import { CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskChecklistItem from "@/components/TaskChecklistItem";

interface IPhoneTodayTasksCardProps {
  tasks: any[];
  completingTasks: Set<string>;
  onStatusChange: (taskId: string, newStatus: any) => void;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onNavigateToTasks?: () => void;
}

export const IPhoneTodayTasksCard = ({
  tasks,
  completingTasks,
  onStatusChange,
  onEdit,
  onDelete,
  onNavigateToTasks
}: IPhoneTodayTasksCardProps) => {
  return (
    <div className="bg-card rounded-3xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-4">
      <div className="flex items-center justify-between pb-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <CheckSquare className="h-5 w-5 text-primary" />
          Tasques d'avui
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigateToTasks?.()}
          className="text-sm text-muted-foreground hover:text-foreground border-0 bg-transparent px-3 py-1"
        >
          Veure totes
        </Button>
      </div>
      
      <div className="space-y-1">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tens tasques pendents per avui</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-2 rounded-2xl bg-accent/30 hover:bg-accent/50 transition-all duration-200">
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