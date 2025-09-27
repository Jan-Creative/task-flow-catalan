import { AlertTriangle } from "lucide-react";
import TaskChecklistItem from "@/components/TaskChecklistItem";

interface IPhoneUrgentTasksCardProps {
  tasks: any[];
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
    <div className="iphone-card iphone-animate-bounce-in">
      <div className="pb-6">
        <h3 className="flex items-center gap-3 iphone-text-primary">
          <AlertTriangle className="h-7 w-7 text-destructive" />
          Tasques urgents
        </h3>
      </div>
      
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Tot sota control!</h4>
            <p className="text-muted-foreground iphone-text-body leading-relaxed max-w-sm mx-auto">
              No tens tasques urgents. Bon treball mantenint les coses organitzades.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-5 rounded-2xl bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/30 hover:from-destructive/15 hover:to-destructive/10 transition-all duration-200 iphone-interactive">
              <TaskChecklistItem
                task={task}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                viewMode="list"
                completingTasks={completingTasks}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};