import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckSquare, Trash2 } from "lucide-react";
import { useTaskContext } from "@/contexts/TaskContext";

interface SubtasksCardProps {
  taskId?: string; // Optional since we can get it from context
}

export const SubtasksCard = memo(({ taskId: propTaskId }: SubtasksCardProps = {}) => {
  // Use context data as priority
  const contextData = useTaskContext();
  const {
    subtasks,
    subtasksLoading: loading,
    completedCount,
    progressPercentage,
    createSubtask,
    deleteSubtask,
    toggleSubtask
  } = contextData || {};
  
  // For backwards compatibility only use fallback when no context
  const finalData = contextData || {
    subtasks: [],
    loading: true,
    completedCount: 0,
    progressPercentage: 0,
    createSubtask: async () => {},
    deleteSubtask: async () => {},
    toggleSubtask: async () => {}
  };
  
  const [newSubtask, setNewSubtask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = async () => {
    if (newSubtask.trim()) {
      await finalData.createSubtask(newSubtask);
      setNewSubtask('');
      setIsAdding(false);
    }
  };

  return (
    <Card className="animate-fade-in h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5 text-primary" />
            Subtasques
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1 h-7 text-xs"
          >
            <Plus className="h-3 w-3" />
            Afegir
          </Button>
        </div>
        {finalData.subtasks.length > 0 && (
          <div className="space-y-2">
            <Progress 
              value={finalData.progressPercentage} 
              size="sm"
              showLabel
              showGlow={finalData.progressPercentage > 70}
              animated
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
        {isAdding && (
          <div className="flex gap-2 animate-fade-in mb-3 flex-shrink-0">
            <Input
              placeholder="Nova subtasca..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubtask();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              autoFocus
              className="text-sm h-8"
            />
            <Button onClick={handleAddSubtask} size="sm" className="h-8 px-3 text-xs">
              Afegir
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsAdding(false)} 
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Cancel
            </Button>
          </div>
        )}

        {finalData.subtasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hi ha subtasques</p>
              <p className="text-xs opacity-70">Afegeix-ne una per començar</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="space-y-1">
              {finalData.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40 group animate-fade-in transition-colors"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => finalData.toggleSubtask(subtask.id)}
                    className="flex-shrink-0"
                  />
                  <span
                    className={`flex-1 text-sm leading-tight ${
                      subtask.completed 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    }`}
                  >
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => finalData.deleteSubtask(subtask.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});