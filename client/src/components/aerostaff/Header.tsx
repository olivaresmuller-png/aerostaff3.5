import React from 'react';
import { format, addDays, subDays } from 'date-fns';
import { Plane, HardDrive, ChevronLeft, Calendar, ChevronRight, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onClearAll: () => void;
    onAutoAssign: () => void;
}

export function Header({ selectedDate, onDateChange, onClearAll, onAutoAssign }: HeaderProps) {
    return (
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-display font-bold tracking-tight" data-testid="text-app-title">AeroStaff</h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <HardDrive className="w-3 h-3" /> Local Storage
                        <span>•</span>
                        Aircraft Maintenance Staffing
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDateChange(subDays(selectedDate, 1))} data-testid="button-prev-day">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm font-medium" data-testid="text-selected-date">{format(selectedDate, 'EEE, MMM d, yyyy')}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDateChange(addDays(selectedDate, 1))} data-testid="button-next-day">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button variant="outline" onClick={onClearAll} className="text-destructive border-destructive/50 hover:bg-destructive/10" data-testid="button-clear-all">
                    <Trash2 className="h-4 w-4 mr-2" /> Clear All
                </Button>
                <Button onClick={onAutoAssign} className="bg-primary" data-testid="button-auto-assign">
                    <Play className="h-4 w-4 mr-2" /> Auto-Assign
                </Button>
            </div>
        </header>
    );
}
