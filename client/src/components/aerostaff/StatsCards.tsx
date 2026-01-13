import React from 'react';
import { Users, ClipboardList, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
    stats: {
        totalRequired: number;
        totalAssigned: number;
        unfilled: number;
        onDuty: number;
        totalHours: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-sky-200" data-testid="card-stat-on-duty">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div><p className="text-sm text-sky-600">On Duty</p><p className="text-3xl font-display font-bold text-sky-700">{stats.onDuty}</p></div>
                        <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center"><Users className="w-6 h-6 text-sky-500" /></div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200" data-testid="card-stat-required">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div><p className="text-sm text-violet-600">Positions Required</p><p className="text-3xl font-display font-bold text-violet-700">{stats.totalRequired}</p></div>
                        <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center"><ClipboardList className="w-6 h-6 text-violet-500" /></div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200" data-testid="card-stat-assigned">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div><p className="text-sm text-emerald-600">Assigned</p><p className="text-3xl font-display font-bold text-emerald-700">{stats.totalAssigned}</p></div>
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-6 h-6 text-emerald-500" /></div>
                    </div>
                </CardContent>
            </Card>
            <Card className={cn("border", stats.unfilled > 0 ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200" : "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 border-slate-200")} data-testid="card-stat-unfilled">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div><p className={cn("text-sm", stats.unfilled > 0 ? "text-red-600" : "text-slate-600")}>Unfilled</p><p className={cn("text-3xl font-display font-bold", stats.unfilled > 0 ? "text-red-700" : "text-slate-700")}>{stats.unfilled}</p></div>
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", stats.unfilled > 0 ? "bg-red-500/20" : "bg-slate-500/20")}><AlertTriangle className={cn("w-6 h-6", stats.unfilled > 0 ? "text-red-500" : "text-slate-500")} /></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
