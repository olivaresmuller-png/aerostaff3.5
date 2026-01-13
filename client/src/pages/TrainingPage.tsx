import { useState, useMemo } from 'react';
import { format, parse, eachDayOfInterval, isWithinInterval } from 'date-fns';
import {
  GraduationCap, Plus, Trash2, Edit2, Save, X, Calendar, Users, CheckCircle2,
  AlertTriangle, XCircle, ChevronRight, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/StoreContext';
import { isOnDuty } from '@/lib/data';

interface DateRange {
  id: string;
  startDate: string;
  endDate: string;
}

interface Training {
  id: string;
  name: string;
  dateRanges: DateRange[];
  selectedEmployees: string[];
  maxGroupSize?: number;
  createdAt: string;
}

interface ConflictDetail {
  date: string;
  type: 'vacation' | 'sick' | 'training' | 'comp' | 'other';
  code: string;
}

interface AvailabilityResult {
  employeeId: string;
  employeeName: string;
  dateRangeId: string;
  status: 'available' | 'conflict' | 'staffing_issue';
  conflicts: ConflictDetail[];
  staffingImpact: string | null;
}

const CONFLICT_CODES: Record<string, { type: ConflictDetail['type']; label: string }> = {
  'LA': { type: 'vacation', label: 'Annual Leave' },
  'LD': { type: 'vacation', label: 'Day Off' },
  'K': { type: 'sick', label: 'Sick Leave' },
  'ED': { type: 'training', label: 'Education/Training' },
  'CO': { type: 'comp', label: 'Comp Day' },
  'MI': { type: 'other', label: 'Military' },
  'Fe': { type: 'other', label: 'Holiday' },
  'KK': { type: 'sick', label: 'Child Sick' },
};

const STORAGE_KEY = 'aerostaff_trainings';

const loadTrainings = (): Training[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTrainings = (trainings: Training[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trainings));
};

export function TrainingPage() {
  const { employees, assignments, getAssignment } = useAppStore();
  const [trainings, setTrainings] = useState<Training[]>(loadTrainings);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [editName, setEditName] = useState('');
  const [editDateRanges, setEditDateRanges] = useState<DateRange[]>([]);
  const [editSelectedEmployees, setEditSelectedEmployees] = useState<string[]>([]);
  const [editMaxGroupSize, setEditMaxGroupSize] = useState<string>('');
  
  const [employeeSearch, setEmployeeSearch] = useState('');

  const updateTrainings = (newTrainings: Training[]) => {
    setTrainings(newTrainings);
    saveTrainings(newTrainings);
  };

  const createNewTraining = () => {
    const newTraining: Training = {
      id: `training_${Date.now()}`,
      name: 'New Training',
      dateRanges: [{ id: `range_${Date.now()}`, startDate: '', endDate: '' }],
      selectedEmployees: [],
      createdAt: new Date().toISOString(),
    };
    updateTrainings([...trainings, newTraining]);
    setSelectedTraining(newTraining);
    startEditing(newTraining);
  };

  const startEditing = (training: Training) => {
    setEditName(training.name);
    setEditDateRanges([...training.dateRanges]);
    setEditSelectedEmployees([...training.selectedEmployees]);
    setEditMaxGroupSize(training.maxGroupSize?.toString() || '');
    setIsEditing(true);
    setShowResults(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (selectedTraining?.name === 'New Training' && selectedTraining.dateRanges[0]?.startDate === '') {
      updateTrainings(trainings.filter(t => t.id !== selectedTraining.id));
      setSelectedTraining(null);
    }
  };

  const saveEditing = () => {
    if (!selectedTraining) return;
    
    const updated: Training = {
      ...selectedTraining,
      name: editName,
      dateRanges: editDateRanges.filter(r => r.startDate && r.endDate),
      selectedEmployees: editSelectedEmployees,
      maxGroupSize: editMaxGroupSize ? parseInt(editMaxGroupSize) : undefined,
    };
    
    updateTrainings(trainings.map(t => t.id === updated.id ? updated : t));
    setSelectedTraining(updated);
    setIsEditing(false);
  };

  const deleteTraining = (id: string) => {
    updateTrainings(trainings.filter(t => t.id !== id));
    if (selectedTraining?.id === id) {
      setSelectedTraining(null);
      setIsEditing(false);
    }
  };

  const addDateRange = () => {
    setEditDateRanges([...editDateRanges, { id: `range_${Date.now()}`, startDate: '', endDate: '' }]);
  };

  const removeDateRange = (id: string) => {
    setEditDateRanges(editDateRanges.filter(r => r.id !== id));
  };

  const updateDateRange = (id: string, field: 'startDate' | 'endDate', value: string) => {
    setEditDateRanges(editDateRanges.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const toggleEmployee = (employeeId: string) => {
    if (editSelectedEmployees.includes(employeeId)) {
      setEditSelectedEmployees(editSelectedEmployees.filter(id => id !== employeeId));
    } else {
      setEditSelectedEmployees([...editSelectedEmployees, employeeId]);
    }
  };

  const selectAllEmployees = () => {
    setEditSelectedEmployees(employees.map(e => e.id));
  };

  const clearAllEmployees = () => {
    setEditSelectedEmployees([]);
  };

  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) return employees;
    const search = employeeSearch.toLowerCase();
    return employees.filter(e => 
      e.name.toLowerCase().includes(search) || 
      e.initials.toLowerCase().includes(search)
    );
  }, [employees, employeeSearch]);

  const checkAvailability = (): AvailabilityResult[] => {
    if (!selectedTraining) return [];
    
    const results: AvailabilityResult[] = [];
    
    selectedTraining.dateRanges.forEach(range => {
      if (!range.startDate || !range.endDate) return;
      
      let start: Date, end: Date;
      try {
        start = parse(range.startDate, 'yyyy-MM-dd', new Date());
        end = parse(range.endDate, 'yyyy-MM-dd', new Date());
      } catch {
        return;
      }
      
      const daysInRange = eachDayOfInterval({ start, end });
      
      selectedTraining.selectedEmployees.forEach(employeeId => {
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) return;
        
        const conflicts: ConflictDetail[] = [];
        
        daysInRange.forEach(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const assignment = getAssignment(dateStr, employeeId);
          
          if (assignment && CONFLICT_CODES[assignment]) {
            conflicts.push({
              date: dateStr,
              type: CONFLICT_CODES[assignment].type,
              code: assignment,
            });
          }
        });
        
        let staffingImpact: string | null = null;
        const staffingIssues: string[] = [];
        
        daysInRange.forEach(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const onDutyEmployees = employees.filter(e => {
            const code = getAssignment(dateStr, e.id);
            return isOnDuty(code || '-');
          });
          
          const srEngOnDuty = onDutyEmployees.filter(e => e.role === 'SrEng' || e.role === 'PM').length;
          const psOnDuty = onDutyEmployees.filter(e => e.role === 'PS').length;
          
          if ((employee.role === 'SrEng' || employee.role === 'PM') && srEngOnDuty <= 6) {
            staffingIssues.push(`${format(day, 'dd.MM')}: Would leave Senior staff below min (6), currently ${srEngOnDuty}`);
          } else if (employee.role === 'PS' && psOnDuty <= 2) {
            staffingIssues.push(`${format(day, 'dd.MM')}: Would leave PS below min (2), currently ${psOnDuty}`);
          }
        });
        
        if (staffingIssues.length > 0) {
          staffingImpact = staffingIssues.join('\n');
        }
        
        let status: AvailabilityResult['status'] = 'available';
        if (conflicts.length > 0) {
          status = 'conflict';
        } else if (staffingImpact) {
          status = 'staffing_issue';
        }
        
        results.push({
          employeeId,
          employeeName: employee.name,
          dateRangeId: range.id,
          status,
          conflicts,
          staffingImpact,
        });
      });
    });
    
    return results;
  };

  const availabilityResults = useMemo(() => {
    if (!showResults || !selectedTraining) return [];
    return checkAvailability();
  }, [showResults, selectedTraining, employees, assignments]);

  const getDateRangeStats = (rangeId: string) => {
    const rangeResults = availabilityResults.filter(r => r.dateRangeId === rangeId);
    const available = rangeResults.filter(r => r.status === 'available').length;
    const conflicts = rangeResults.filter(r => r.status === 'conflict').length;
    const staffing = rangeResults.filter(r => r.status === 'staffing_issue').length;
    return { available, conflicts, staffing, total: rangeResults.length };
  };

  const getBestDateRange = () => {
    if (!selectedTraining || selectedTraining.dateRanges.length === 0) return null;
    
    let bestRange: DateRange | null = null;
    let bestAvailable = -1;
    
    selectedTraining.dateRanges.forEach(range => {
      const stats = getDateRangeStats(range.id);
      if (stats.available > bestAvailable) {
        bestAvailable = stats.available;
        bestRange = range;
      }
    });
    
    return bestRange;
  };

  const formatDateRange = (range: DateRange) => {
    if (!range.startDate || !range.endDate) return 'Not set';
    try {
      const start = parse(range.startDate, 'yyyy-MM-dd', new Date());
      const end = parse(range.endDate, 'yyyy-MM-dd', new Date());
      return `${format(start, 'dd.MM.yyyy')} - ${format(end, 'dd.MM.yyyy')}`;
    } catch {
      return 'Invalid dates';
    }
  };

  return (
    <div className="space-y-6" data-testid="training-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Training Availability
          </h1>
          <p className="text-muted-foreground mt-1">
            Check employee availability for training courses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Saved Trainings</CardTitle>
                <Button size="sm" onClick={createNewTraining} data-testid="button-new-training">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {trainings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No trainings saved yet</p>
                    <p className="text-sm">Click "New" to create one</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trainings.map(training => (
                      <div
                        key={training.id}
                        onClick={() => {
                          setSelectedTraining(training);
                          setIsEditing(false);
                          setShowResults(false);
                        }}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedTraining?.id === training.id
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted/50 border-transparent"
                        )}
                        data-testid={`training-item-${training.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{training.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {training.selectedEmployees.length} employees · {training.dateRanges.length} date option(s)
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {!selectedTraining ? (
            <Card className="h-[570px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select a training or create a new one</p>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xl font-semibold max-w-md"
                      placeholder="Training name"
                      data-testid="input-training-name"
                    />
                  ) : (
                    <CardTitle className="text-xl">{selectedTraining.name}</CardTitle>
                  )}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={cancelEditing}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEditing} data-testid="button-save-training">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => startEditing(selectedTraining)}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteTraining(selectedTraining.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4" />
                    Date Options
                  </Label>
                  {isEditing ? (
                    <div className="space-y-3">
                      {editDateRanges.map((range, index) => (
                        <div key={range.id} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-16">Option {index + 1}</span>
                          <Input
                            type="date"
                            value={range.startDate}
                            onChange={(e) => updateDateRange(range.id, 'startDate', e.target.value)}
                            className="w-40"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="date"
                            value={range.endDate}
                            onChange={(e) => updateDateRange(range.id, 'endDate', e.target.value)}
                            className="w-40"
                          />
                          {editDateRanges.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeDateRange(range.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addDateRange}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Date Option
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedTraining.dateRanges.map((range, index) => (
                        <Badge key={range.id} variant="secondary" className="text-sm py-1 px-3">
                          Option {index + 1}: {formatDateRange(range)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Employees ({isEditing ? editSelectedEmployees.length : selectedTraining.selectedEmployees.length})
                    </Label>
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Search..."
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="w-40 h-8"
                        />
                        <Button variant="outline" size="sm" onClick={selectAllEmployees}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={clearAllEmployees}>
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <ScrollArea className="h-48 border rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {filteredEmployees.map(employee => (
                          <div
                            key={employee.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                              editSelectedEmployees.includes(employee.id)
                                ? "bg-primary/10"
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => toggleEmployee(employee.id)}
                          >
                            <Checkbox
                              checked={editSelectedEmployees.includes(employee.id)}
                              onCheckedChange={() => toggleEmployee(employee.id)}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.initials} · {employee.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedTraining.selectedEmployees.slice(0, 10).map(id => {
                        const emp = employees.find(e => e.id === id);
                        return emp ? (
                          <Badge key={id} variant="outline" className="text-xs">
                            {emp.name}
                          </Badge>
                        ) : null;
                      })}
                      {selectedTraining.selectedEmployees.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedTraining.selectedEmployees.length - 10} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Max Group Size (optional)
                      </Label>
                      <Input
                        type="number"
                        value={editMaxGroupSize}
                        onChange={(e) => setEditMaxGroupSize(e.target.value)}
                        placeholder="No limit"
                        className="w-40"
                      />
                    </div>
                  </>
                )}

                {!isEditing && selectedTraining.selectedEmployees.length > 0 && selectedTraining.dateRanges.some(r => r.startDate && r.endDate) && (
                  <>
                    <Separator />
                    <div className="flex justify-center">
                      <Button 
                        size="lg" 
                        onClick={() => setShowResults(true)}
                        className="px-8"
                        data-testid="button-check-availability"
                      >
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Check Availability
                      </Button>
                    </div>
                  </>
                )}

                {showResults && availabilityResults.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Availability Results
                      </Label>
                      
                      {getBestDateRange() && selectedTraining.dateRanges.length > 1 && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Recommended: {formatDateRange(getBestDateRange()!)}
                          </p>
                        </div>
                      )}

                      {selectedTraining.dateRanges.map((range, rangeIndex) => {
                        const stats = getDateRangeStats(range.id);
                        const rangeResults = availabilityResults.filter(r => r.dateRangeId === range.id);
                        
                        return (
                          <div key={range.id} className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium">Option {rangeIndex + 1}: {formatDateRange(range)}</span>
                              <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                                {stats.available} available
                              </Badge>
                              {stats.conflicts > 0 && (
                                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                                  {stats.conflicts} conflicts
                                </Badge>
                              )}
                              {stats.staffing > 0 && (
                                <Badge variant="secondary" className="bg-red-500/20 text-red-600">
                                  {stats.staffing} staffing issues
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {rangeResults.map(result => {
                                const hasDetails = result.conflicts.length > 0 || result.staffingImpact;
                                
                                if (!hasDetails) {
                                  return (
                                    <div
                                      key={`${result.employeeId}-${result.dateRangeId}`}
                                      className={cn(
                                        "p-3 rounded border",
                                        result.status === 'available' && "bg-green-500/10 border-green-500/30"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium">{result.employeeName}</span>
                                        <Badge variant="secondary" className="ml-auto text-xs bg-green-500/20 text-green-600">
                                          Available
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <Collapsible key={`${result.employeeId}-${result.dateRangeId}`}>
                                    <CollapsibleTrigger className="w-full">
                                      <div
                                        className={cn(
                                          "p-3 rounded border cursor-pointer transition-colors",
                                          result.status === 'conflict' && "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20",
                                          result.status === 'staffing_issue' && "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          {result.status === 'conflict' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                          {result.status === 'staffing_issue' && <XCircle className="h-4 w-4 text-red-500" />}
                                          <span className="text-sm font-medium">{result.employeeName}</span>
                                          <Badge 
                                            variant="secondary" 
                                            className={cn(
                                              "ml-auto text-xs",
                                              result.status === 'conflict' && "bg-yellow-500/20 text-yellow-600",
                                              result.status === 'staffing_issue' && "bg-red-500/20 text-red-600"
                                            )}
                                          >
                                            {result.status === 'conflict' ? 'Has Conflicts' : 'Staffing Issue'}
                                          </Badge>
                                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                                        </div>
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className={cn(
                                        "mt-1 p-3 rounded border-l-4 ml-4",
                                        result.status === 'conflict' && "bg-yellow-500/5 border-yellow-500",
                                        result.status === 'staffing_issue' && "bg-red-500/5 border-red-500"
                                      )}>
                                        {result.conflicts.length > 0 && (
                                          <div className="mb-2">
                                            <p className="font-medium text-sm text-yellow-600 dark:text-yellow-400 mb-1">Conflicts:</p>
                                            {result.conflicts.map((c, i) => (
                                              <p key={i} className="text-sm pl-2">
                                                • {format(parse(c.date, 'yyyy-MM-dd', new Date()), 'dd.MM.yyyy')}: <span className="font-medium">{CONFLICT_CODES[c.code]?.label || c.code}</span>
                                              </p>
                                            ))}
                                          </div>
                                        )}
                                        {result.staffingImpact && (
                                          <div>
                                            <p className="font-medium text-sm text-red-600 dark:text-red-400 mb-1">Staffing Issues:</p>
                                            {result.staffingImpact.split('\n').map((line, i) => (
                                              <p key={i} className="text-sm pl-2">• {line}</p>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainingPage;
