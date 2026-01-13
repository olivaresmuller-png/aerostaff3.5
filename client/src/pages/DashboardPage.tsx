import { useMemo, useState } from 'react';
import { format, startOfWeek, addDays, eachDayOfInterval, startOfMonth, endOfMonth, getISOWeek } from 'date-fns';
import { TrendingUp, TrendingDown, Users, Clock, Target, AlertTriangle, CheckCircle, CalendarIcon, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useAppStore } from '@/lib/StoreContext';
import { calculateManhours, calculateWeeklyManhours, isOnDuty, AIRCRAFT_TYPES, countLicensesByType } from '@/lib/data';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export function DashboardPage() {
  const { employees, assignments, selectedDate, getWeekDates } = useAppStore();
  const [checkDate, setCheckDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate, getWeekDates]);
  const checkDay = format(checkDate, 'yyyy-MM-dd');
  const isToday = checkDay === format(new Date(), 'yyyy-MM-dd');

  const weeklyManhours = useMemo(() => {
    return calculateWeeklyManhours(employees, assignments, weekDates);
  }, [employees, assignments, weekDates]);

  const dailyManhours = useMemo(() => {
    return calculateManhours(employees, assignments, checkDay);
  }, [employees, assignments, checkDay]);

  const MIN_MANHOURS = 216;
  const targetProgress = Math.min((dailyManhours / MIN_MANHOURS) * 100, 100);

  const dailyData = useMemo(() => {
    return weekDates.map(date => ({
      day: format(new Date(date), 'EEE'),
      hours: calculateManhours(employees, assignments, date),
      onDuty: assignments.filter(a => a.date === date && isOnDuty(a.shiftCode)).length,
    }));
  }, [employees, assignments, weekDates]);

  const departmentBreakdown = useMemo(() => {
    const depts = ['S/TMBA', 'S/TMBAA', 'S/TMBAB', 'S/TMBAC'];
    return depts.map(dept => ({
      name: dept.replace('S/', ''),
      count: employees.filter(e => e.department === dept).length,
      onDuty: assignments.filter(a => {
        const emp = employees.find(e => e.id === a.employeeId);
        return a.date === checkDay && emp?.department === dept && isOnDuty(a.shiftCode);
      }).length,
    }));
  }, [employees, assignments, checkDay]);

  const gradeDistribution = useMemo(() => {
    const ranges = [
      { name: '100%', min: 100, max: 100 },
      { name: '50-99%', min: 50, max: 99 },
      { name: '1-49%', min: 1, max: 49 },
      { name: '0%', min: 0, max: 0 },
    ];
    return ranges.map(range => ({
      name: range.name,
      value: employees.filter(e => e.grade >= range.min && e.grade <= range.max).length,
    })).filter(r => r.value > 0);
  }, [employees]);

  const topAircraftSkills = useMemo(() => {
    return AIRCRAFT_TYPES.slice(0, 6).map(type => {
      const counts = countLicensesByType(employees, assignments, checkDay, type);
      return {
        name: type,
        b1: counts.b1,
        b2: counts.b2,
        b12: counts.b12,
        total: counts.b1 + counts.b2 + counts.b12,
      };
    }).filter(a => a.total > 0);
  }, [employees, assignments, checkDay]);

  const totalOnDuty = assignments.filter(a => a.date === checkDay && isOnDuty(a.shiftCode)).length;
  const totalOff = employees.length - totalOnDuty;

  // Daily Target: Count employees on Ea/La shifts (excluding PM/PS/SE roles)
  // Week duty alternates: odd ISO week = Ea, even ISO week = La
  // Ea shifts: 'Ea', 'e' (early shifts for regular employees)
  // La shifts: 'La' (late shifts for regular employees)
  // Excluded: 'eA', 'LA', 'Ae', 'AL' (PS/SE position shifts), midshifts, PM shifts
  const dailyTargetData = useMemo(() => {
    const weekNum = getISOWeek(checkDate);
    const isEaWeek = weekNum % 2 === 0; // Even weeks = Ea duty (week 2, 4, 6...), Odd weeks = La duty (week 3, 5, 7...)
    
    // Count employees with Ea or La shifts who are NOT in PM/PS/SE roles
    const count = assignments.filter(a => {
      if (a.date !== checkDay) return false;
      
      const emp = employees.find(e => e.id === a.employeeId);
      if (!emp) return false;
      
      // Exclude PM, PS, SE roles
      const role = emp.role?.toUpperCase() || '';
      if (role === 'PM' || role === 'PS' || role === 'SE') return false;
      
      // Check if shift matches the week's duty
      const code = a.shiftCode;
      if (isEaWeek) {
        // Early week: count 'Ea' and 'e' shifts (not 'eA' which is PS)
        return code === 'Ea' || code === 'e';
      } else {
        // Late week: count 'La' shifts (not 'LA' which is PS)
        return code === 'La';
      }
    }).length;
    
    // Color rules: ≤29 red, 30-34 orange, ≥35 green
    let color: 'red' | 'orange' | 'green';
    let colorClass: string;
    if (count <= 29) {
      color = 'red';
      colorClass = 'text-destructive';
    } else if (count <= 34) {
      color = 'orange';
      colorClass = 'text-warning';
    } else {
      color = 'green';
      colorClass = 'text-success';
    }
    
    const targetShift = isEaWeek ? 'Ea' : 'La';
    return { count, color, colorClass, targetShift, isEaWeek };
  }, [checkDate, checkDay, employees, assignments]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Weekly overview for {format(new Date(weekDates[0]), 'MMM d')} - {format(new Date(weekDates[6]), 'MMM d, yyyy')}
          </p>
        </div>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 font-semibold text-sm h-10 px-4 border-2 hover:border-primary hover:bg-primary/5 transition-all"
              data-testid="button-check-day-picker"
            >
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className={cn("font-bold", isToday ? "text-primary" : "text-foreground")}>
                {isToday ? 'Today' : format(checkDate, 'EEE, MMM d')}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", calendarOpen && "rotate-180")} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3 border-b bg-muted/30">
              <h4 className="font-semibold text-sm">Check Day</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Select a date to view daily statistics</p>
            </div>
            <Calendar
              mode="single"
              selected={checkDate}
              onSelect={(date) => {
                if (date) {
                  setCheckDate(date);
                  setCalendarOpen(false);
                }
              }}
              weekStartsOn={1}
              initialFocus
            />
            {!isToday && (
              <div className="p-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs text-primary hover:bg-primary/10"
                  onClick={() => {
                    setCheckDate(new Date());
                    setCalendarOpen(false);
                  }}
                  data-testid="button-reset-to-today"
                >
                  ← Back to Today
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{isToday ? "Today's" : format(checkDate, 'MMM d')} Manhours</p>
              <p className="text-3xl font-display font-bold mt-1">{dailyManhours.toFixed(0)}</p>
            </div>
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              dailyManhours >= MIN_MANHOURS ? "bg-success/10" : "bg-warning/10"
            )}>
              <Clock className={cn("w-5 h-5", dailyManhours >= MIN_MANHOURS ? "text-success" : "text-warning")} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Target: {MIN_MANHOURS}h/day</span>
              <span className={cn("font-semibold", dailyManhours >= MIN_MANHOURS ? "text-success" : "text-warning")}>
                {targetProgress.toFixed(0)}%
              </span>
            </div>
            <Progress value={targetProgress} className="h-2" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">On Duty {isToday ? 'Today' : format(checkDate, 'MMM d')}</p>
              <p className="text-3xl font-display font-bold mt-1">{totalOnDuty}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{totalOff} off duty</span>
            <span>•</span>
            <span>{employees.length} total</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Daily Target ({dailyTargetData.targetShift} duty)
              </p>
              <p className="text-3xl font-display font-bold mt-1 flex items-center gap-2">
                {dailyTargetData.color === 'green' ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : dailyTargetData.color === 'orange' ? (
                  <AlertTriangle className="w-6 h-6 text-warning" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                )}
                <span className={dailyTargetData.colorClass}>{dailyTargetData.count}</span>
              </p>
            </div>
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              dailyTargetData.color === 'green' ? "bg-success/10" : 
              dailyTargetData.color === 'orange' ? "bg-warning/10" : "bg-destructive/10"
            )}>
              <Target className={cn(
                "w-5 h-5",
                dailyTargetData.color === 'green' ? "text-success" : 
                dailyTargetData.color === 'orange' ? "text-warning" : "text-destructive"
              )} />
            </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {dailyTargetData.count >= 35 
              ? 'Target met (≥35)'
              : dailyTargetData.count >= 30 
                ? `Need ${35 - dailyTargetData.count} more for green`
                : `Need ${30 - dailyTargetData.count} more for orange`
            }
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Total</p>
              <p className="text-3xl font-display font-bold mt-1">
                {weeklyManhours.toFixed(0)}h
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              {weeklyManhours / 7 >= MIN_MANHOURS ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
            </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Weekly target: 1,400h
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Daily Manhours</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Staff on Duty by Day</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="onDuty" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Department Breakdown</h3>
          <div className="space-y-4">
            {departmentBreakdown.map((dept, idx) => (
              <div key={dept.name} className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-sm text-muted-foreground">{dept.count} staff</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                    <span>{dept.onDuty} on duty today</span>
                    <span>{((dept.onDuty / dept.count) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Grade Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {gradeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {gradeDistribution.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold mb-4">Aircraft Skills ({isToday ? 'Today' : format(checkDate, 'MMM d')})</h3>
          <div className="space-y-3">
            {topAircraftSkills.map(aircraft => (
              <div key={aircraft.name} className="flex items-center gap-3">
                <span className="font-mono text-sm font-medium w-20 truncate">{aircraft.name}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono">
                      B1: {aircraft.b1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-mono">
                      B2: {aircraft.b2}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-mono">
                      B1/2: {aircraft.b12}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
