import { useMemo } from "react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
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
  completingTasks: Set<string>;
  onStatusChange: (taskId: string, newStatus: any) => void;
  onDelete: (taskId: string) => void;
  onOpenReminderConfig: () => void;
  onOpenTimeBlocks: () => void;
  showPrepareTomorrow?: boolean;
}

export const IPhoneDashboardLayout = ({
  dashboardTasks,
  urgentTasks,
  todayEvents,
  onEditTask,
  onNavigateToTasks,
  onNavigateToCalendar,
  onNavigateToNotifications,
  completingTasks,
  onStatusChange,
  onDelete,
  onOpenReminderConfig,
  onOpenTimeBlocks,
  showPrepareTomorrow
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

  // Greeting icon based on time
  const GreetingIcon = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return Sun;
    if (hour < 18) return Sun;
    return Moon;
  }, []);

  return (
    <div className="w-full min-h-screen p-4 pb-24 space-y-8">
      {/* Personalized Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/20 rounded-3xl">
              <GreetingIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                {greeting},<br />{userName}!
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                {format(new Date(), "EEEE, d MMMM", { locale: ca })}
              </p>
            </div>
          </div>
          
          <DashboardToolbar 
            onNavigateToPrepareTomorrow={() => window.location.href = '/prepare-tomorrow'}
            onOpenReminderConfig={onOpenReminderConfig}
            onOpenTodayTimeBlocks={onOpenTimeBlocks}
            onNavigateToNotifications={onNavigateToNotifications}
          />
        </div>

        {/* Executive Summary */}
        <IPhoneExecutiveSummary 
          dashboardTasks={dashboardTasks}
          todayEvents={todayEvents}
          urgentTasks={urgentTasks}
        />
      </div>

      {/* Single Column Cards Layout */}
      <div className="space-y-6">
        {/* Today's Tasks Card */}
        <IPhoneTodayTasksCard
          tasks={dashboardTasks}
          completingTasks={completingTasks}
          onStatusChange={onStatusChange}
          onEdit={onEditTask}
          onDelete={onDelete}
          onNavigateToTasks={onNavigateToTasks}
        />

        {/* Urgent Tasks Card */}
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