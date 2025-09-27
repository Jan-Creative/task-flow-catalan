import { useMemo } from "react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { IPhoneToolbarMenu } from './IPhoneToolbarMenu';
import { IPhoneQuickActionsBar } from './IPhoneQuickActionsBar';
import { IPhoneExecutiveSummary } from "./IPhoneExecutiveSummary";
import { IPhoneTodayTasksCard } from "./IPhoneTodayTasksCard";
import { IPhoneUrgentTasksCard } from "./IPhoneUrgentTasksCard";

interface IPhoneDashboardLayoutProps {
  dashboardTasks: any[];
  urgentTasks: any[];
  todayEvents: any[];
  onEditTask: (task: any) => void;
  onNavigateToTasks?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToPrepareTomorrow?: () => void;
  onCreateTask?: () => void;
  completingTasks: Set<string>;
  onStatusChange: (taskId: string, newStatus: any) => void;
  onDelete: (taskId: string) => void;
  onOpenReminderConfig?: () => void;
  onOpenTodayTimeBlocks?: () => void;
}

export const IPhoneDashboardLayout = ({
  dashboardTasks,
  urgentTasks,
  todayEvents,
  onEditTask,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToNotifications,
  onNavigateToPrepareTomorrow,
  onCreateTask,
  completingTasks,
  onStatusChange,
  onDelete,
  onOpenReminderConfig,
  onOpenTodayTimeBlocks
}: IPhoneDashboardLayoutProps) => {
  const { user } = useAuth();

  // Get user display name
  const userName = useMemo(() => {
    if (!user) return "Usuari";
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "Usuari";
  }, [user]);

  // Dynamic greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon dia";
    if (hour < 18) return "Bona tarda"; 
    return "Bona nit";
  }, []);

  // Greeting icon and formatted date
  const IconComponent = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 18 ? Moon : Sun;
  }, []);

  const formattedDate = useMemo(() => {
    return format(new Date(), "EEEE, d MMMM", { locale: ca });
  }, []);

  return (
    <div className="w-full max-w-full p-4 pb-24 space-y-6 iphone-safe-area">
      {/* Optimized iPhone Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-6 shadow-[var(--iphone-shadow-elevated)] iphone-animate-slide-up">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-foreground mb-1 leading-tight">
                {greeting}, {userName}!
              </h1>
              <p className="text-muted-foreground iphone-text-body">
                {formattedDate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <IPhoneToolbarMenu 
                onNavigateToPrepareTomorrow={onNavigateToPrepareTomorrow}
                onOpenReminderConfig={onOpenReminderConfig}
                onOpenTodayTimeBlocks={onOpenTodayTimeBlocks}
                onNavigateToNotifications={onNavigateToNotifications}
              />
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
      </div>

      {/* Enhanced Executive Summary */}
      <IPhoneExecutiveSummary 
        dashboardTasks={dashboardTasks}
        todayEvents={todayEvents}
        urgentTasks={urgentTasks}
      />

      {/* Quick Actions Bar */}
      <IPhoneQuickActionsBar 
        onCreateTask={onCreateTask}
        onNavigateToCalendar={onNavigateToCalendar}
        onNavigateToTasks={onNavigateToTasks}
        onNavigateToPrepareTomorrow={onNavigateToPrepareTomorrow}
      />

      {/* Optimized Task Cards */}
      <div className="space-y-6 iphone-thumb-zone">
        <IPhoneTodayTasksCard 
          tasks={dashboardTasks}
          completingTasks={completingTasks}
          onStatusChange={onStatusChange}
          onEdit={onEditTask}
          onDelete={onDelete}
          onNavigateToTasks={onNavigateToTasks}
        />
        
        <IPhoneUrgentTasksCard 
          tasks={urgentTasks}
          completingTasks={completingTasks}
          onStatusChange={onStatusChange}
          onEdit={onEditTask}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};