import { AlertTriangle } from "lucide-react";
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

export const IPhoneUrgentTasksCard = ({
  tasks,
  completingTasks,
  onStatusChange,
  onEdit,
  onDelete
}: IPhoneUrgentTasksCardProps) => {
  return (
    <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-4">
      <div className="pb-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Tasques urgents d'avui
        </h3>
      </div>
      
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tens tasques urgents avui</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-3 rounded-2xl bg-accent/30 hover:bg-accent/50 transition-all duration-200">
              <TaskChecklistItem
                task={task}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                viewMode="compact"
                completingTasks={completingTasks}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};