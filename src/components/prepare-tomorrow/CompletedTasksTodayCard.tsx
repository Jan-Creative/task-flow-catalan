import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Archive, CheckCircle, Clock, Folder } from 'lucide-react';
import { useState } from 'react';
import { useDadesApp } from '@/hooks/useDadesApp';
import { useTaskHistory } from '@/hooks/useTaskHistory';
import { Tasca } from '@/types';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';

// Extended task type for completed tasks with additional properties
interface ExtendedTask extends Tasca {
  completed_at?: string;
  folder?: {
    id: string;
    name: string;
    color: string;
  };
}

export const CompletedTasksTodayCard = () => {
  const { tasks } = useDadesApp();
  const { archiveTasks, archivingTasks } = useTaskHistory();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Filter completed tasks from today
  const completedTasksToday = (tasks as ExtendedTask[]).filter(task => {
    if (task.status !== 'completat' || !task.completed_at) return false;
    
    const completedDate = new Date(task.completed_at);
    const today = new Date();
    
    return (
      completedDate.getDate() === today.getDate() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getFullYear() === today.getFullYear()
    );
  });

  // Temporarily show card even when empty for development
  const shouldShowCard = true; // completedTasksToday.length > 0;
  
  if (!shouldShowCard) {
    return null;
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === completedTasksToday.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(completedTasksToday.map(task => task.id));
    }
  };

  const handleArchiveSelected = () => {
    const tasksToArchive = completedTasksToday.filter(task => 
      selectedTasks.includes(task.id)
    );
    
    if (tasksToArchive.length > 0) {
      archiveTasks(tasksToArchive);
      setSelectedTasks([]);
    }
  };

  const handleArchiveAll = () => {
    archiveTasks(completedTasksToday);
    setSelectedTasks([]);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Tasques Completades Avui</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {completedTasksToday.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={archivingTasks}
            >
              {selectedTasks.length === completedTasksToday.length ? 'Deseleccionar tot' : 'Seleccionar tot'}
            </Button>
            {selectedTasks.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleArchiveSelected}
                disabled={archivingTasks}
                className="bg-primary text-primary-foreground"
              >
                <Archive className="h-4 w-4 mr-1" />
                Arxivar ({selectedTasks.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchiveAll}
              disabled={archivingTasks}
            >
              <Archive className="h-4 w-4 mr-1" />
              Arxivar tot
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {completedTasksToday.length === 0 ? (
          <div className="text-center py-8">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                📋 No hi ha tasques completades avui
              </p>
              <p className="text-xs text-muted-foreground">
                Les tasques que completis avui apareixeran aquí
              </p>
            </div>
          </div>
        ) : (
          completedTasksToday.map((task) => (
          <div 
            key={task.id} 
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/10 transition-colors"
          >
            <Checkbox
              checked={selectedTasks.includes(task.id)}
              onCheckedChange={() => handleSelectTask(task.id)}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {task.title}
                </h4>
                {task.folder && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Folder className="h-3 w-3" />
                    <span>{task.folder.name}</span>
                  </div>
                )}
              </div>
              
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Completada: {format(new Date(task.completed_at!), 'HH:mm', { locale: ca })}
                </span>
                <Badge variant="outline" className="text-xs">
                  {task.priority}
                </Badge>
              </div>
            </div>
          </div>
          ))
        )}
        
        {completedTasksToday.length > 0 && (
          <div className="mt-4 p-3 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Consell:</strong> Arxiva les tasques completades per mantenir l'app neta. 
              Les tasques arxivades es poden consultar a la configuració de l'app.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};