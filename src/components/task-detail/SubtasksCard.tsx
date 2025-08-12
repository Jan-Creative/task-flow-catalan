import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckSquare, Trash2 } from "lucide-react";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface SubtasksCardProps {
  taskId: string;
}

export const SubtasksCard = ({ taskId }: SubtasksCardProps) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', title: 'Investigar competitors', completed: true },
    { id: '2', title: 'Definir estratègia', completed: false },
    { id: '3', title: 'Crear prototip', completed: false },
  ]);
  const [newSubtask, setNewSubtask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = subtasks.filter(subtask => subtask.completed).length;
  const progressPercentage = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const newSubtaskObj: Subtask = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
      };
      setSubtasks([...subtasks, newSubtaskObj]);
      setNewSubtask('');
      setIsAdding(false);
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(subtask =>
      subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
    ));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            Subtasques
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Afegir
          </Button>
        </div>
        {subtasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{completedCount} de {subtasks.length} completades</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="flex gap-2 animate-fade-in">
            <Input
              placeholder="Nova subtasca..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSubtask();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              autoFocus
            />
            <Button onClick={handleAddSubtask} size="sm">
              Afegir
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsAdding(false)} 
              size="sm"
            >
              Cancel·lar
            </Button>
          </div>
        )}

        {subtasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hi ha subtasques encara</p>
            <p className="text-sm">Afegeix subtasques per organitzar millor la feina</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group animate-fade-in"
              >
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => toggleSubtask(subtask.id)}
                />
                <span
                  className={`flex-1 ${
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
                  onClick={() => deleteSubtask(subtask.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};