import { AlertTriangle, Clock, Calendar } from "lucide-react";
import TaskChecklistItem from "@/components/TaskChecklistItem";

interface UrgentTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string | null;
  urgencyScore: number;
  urgencyLevel: 'critical' | 'high' | 'moderate';
  urgencyReason: string;
  created_at: string;
  updated_at: string;
}

interface IPhoneUrgentTasksCardProps {
  tasks: UrgentTask[];
  completingTasks: Set<string>;
  onStatusChange: (taskId: string, newStatus: any) => void;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
}

const getUrgencyIcon = (level: 'critical' | 'high' | 'moderate') => {
  switch (level) {
    case 'critical':
      return AlertTriangle;
    case 'high':
      return Clock;
    case 'moderate':
      return Calendar;
    default:
      return AlertTriangle;
  }
};

const getUrgencyStyles = (level: 'critical' | 'high' | 'moderate') => {
  switch (level) {
    case 'critical':
      return {
        gradient: 'bg-gradient-to-br from-red-500/15 to-red-600/15',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        hover: 'hover:from-red-500/20 hover:to-red-600/20'
      };
    case 'high':
      return {
        gradient: 'bg-gradient-to-br from-orange-500/15 to-orange-600/15',
        border: 'border-orange-500/30',
        icon: 'text-orange-400',
        hover: 'hover:from-orange-500/20 hover:to-orange-600/20'
      };
    case 'moderate':
      return {
        gradient: 'bg-gradient-to-br from-yellow-500/15 to-yellow-600/15',
        border: 'border-yellow-500/30',
        icon: 'text-yellow-400',
        hover: 'hover:from-yellow-500/20 hover:to-yellow-600/20'
      };
    default:
      return {
        gradient: 'bg-gradient-to-br from-red-500/15 to-red-600/15',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        hover: 'hover:from-red-500/20 hover:to-red-600/20'
      };
  }
};

export const IPhoneUrgentTasksCard = ({
  tasks,
  completingTasks,
  onStatusChange,
  onEdit,
  onDelete
}: IPhoneUrgentTasksCardProps) => {
  return (
    <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
      <div className="pb-6">
        <h3 className="flex items-center gap-3 text-2xl font-semibold">
          <AlertTriangle className="h-7 w-7 text-destructive" />
          Tasques urgents
        </h3>
      </div>
      
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No tens tasques urgents</p>
          </div>
        ) : (
          tasks.map((task) => {
            const UrgencyIcon = getUrgencyIcon(task.urgencyLevel);
            const styles = getUrgencyStyles(task.urgencyLevel);
            
            return (
              <div 
                key={task.id} 
                className={`p-4 rounded-2xl border transition-all duration-200 ${styles.gradient} ${styles.border} ${styles.hover}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <UrgencyIcon className={`h-4 w-4 ${styles.icon}`} />
                    <span className={`text-xs font-medium ${styles.icon}`}>
                      {task.urgencyReason}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-xs font-bold ${styles.icon}`}>
                      {task.urgencyScore}
                    </span>
                  </div>
                </div>
                
                <TaskChecklistItem
                  task={task}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  viewMode="list"
                  completingTasks={completingTasks}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};