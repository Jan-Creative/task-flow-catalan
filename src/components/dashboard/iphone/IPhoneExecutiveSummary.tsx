import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

interface IPhoneExecutiveSummaryProps {
  dashboardTasks: any[];
  todayEvents: any[];
  urgentTasks: any[];
}

export const IPhoneExecutiveSummary = ({
  dashboardTasks,
  todayEvents,
  urgentTasks
}: IPhoneExecutiveSummaryProps) => {
  const stats = useMemo(() => {
    const completedToday = dashboardTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = dashboardTasks.filter(task => task.status !== 'completed').length;
    const productivityPercentage = dashboardTasks.length > 0 
      ? Math.round((completedToday / dashboardTasks.length) * 100) 
      : 0;
    
    return {
      pending: pendingTasks,
      urgent: urgentTasks.length,
      completed: completedToday,
      productivity: productivityPercentage,
      hasEvents: todayEvents.length > 0,
      eventsCount: todayEvents.length
    };
  }, [dashboardTasks, todayEvents, urgentTasks]);

  return (
    <div className="iphone-card iphone-animate-slide-up">
      {/* Header with productivity insight */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Resum del dia</h2>
        {stats.productivity > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">{stats.productivity}%</span>
          </div>
        )}
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Pending tasks */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 iphone-interactive">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/20">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pendents</div>
            </div>
          </div>
        </div>

        {/* Urgent tasks */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20 iphone-interactive">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{stats.urgent}</div>
              <div className="text-sm text-muted-foreground">Urgents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Events indicator */}
      {stats.hasEvents && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-accent-foreground" />
            <div>
              <span className="text-sm font-medium text-foreground">
                {stats.eventsCount} esdeveniment{stats.eventsCount !== 1 ? 's' : ''} avui
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Productivity progress bar */}
      {stats.productivity > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progrés d'avui</span>
            <span className="text-sm text-success font-semibold">{stats.completed}/{dashboardTasks.length}</span>
          </div>
          <div className="w-full bg-success/20 rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.productivity}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};