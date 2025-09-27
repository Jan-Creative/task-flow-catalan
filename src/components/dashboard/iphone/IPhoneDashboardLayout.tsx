import { IPhoneHeaderCard } from "./IPhoneHeaderCard";
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

  return (
    <div className="w-full min-h-screen p-4 pb-24 space-y-6">
      {/* Unified Header Card */}
      <IPhoneHeaderCard 
        onOpenReminderConfig={onOpenReminderConfig}
        onOpenTimeBlocks={onOpenTimeBlocks}
        onNavigateToNotifications={onNavigateToNotifications}
      />

      {/* Executive Summary */}
      <IPhoneExecutiveSummary 
        dashboardTasks={dashboardTasks}
        todayEvents={todayEvents}
        urgentTasks={urgentTasks}
      />

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