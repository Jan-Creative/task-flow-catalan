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
    <div className="iphone-card iphone-animate-bounce-in">
      <div className="flex items-center justify-between pb-6">
        <h3 className="flex items-center gap-3 iphone-text-primary">
          <CheckSquare className="h-7 w-7 text-primary" />
          Tasques d'avui
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigateToTasks?.()}
          className="iphone-touch-target text-muted-foreground hover:text-foreground bg-accent/20 hover:bg-accent/40 rounded-xl px-4"
        >
          Veure totes
        </Button>
      </div>
      
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mb-4">
                <CheckSquare className="h-8 w-8 text-success" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">Tot fet!</h4>
            <p className="text-muted-foreground iphone-text-body leading-relaxed max-w-sm mx-auto">
              Has completat totes les tasques d'avui. Pots afegir-ne més o planificar per demà.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="p-5 rounded-2xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 hover:from-accent/30 hover:to-accent/20 transition-all duration-200 iphone-interactive">
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