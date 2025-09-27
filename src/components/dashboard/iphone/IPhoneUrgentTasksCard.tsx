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
          tasks.map((task) => (
            <div key={task.id} className="p-4 rounded-2xl bg-destructive/5 hover:bg-destructive/10 transition-all duration-200">
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