import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateTaskModalLazy, LazyModal } from '@/lib/lazyLoading';
import { Plus, Calendar, Clock } from 'lucide-react';
import { useTasksCore } from '@/hooks/tasks/useTasksCore';
// useDadesApp removed - using useTasksCore only
import { format, addDays } from 'date-fns';
import { ca } from 'date-fns/locale';
import type { Task } from '@/types/task';

interface TasksForDayCardProps {
  tomorrow: string;
  onTasksUpdate?: (tasks: Task[]) => void;
}

export const TasksForDayCard = ({ tomorrow, onTasksUpdate }: TasksForDayCardProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { tasks, folders, crearTasca: handleCreateTask } = useTasksCore();

  const tomorrowDate = format(addDays(new Date(), 1), "EEEE, d 'de' MMMM", { locale: ca });
  
  // Filter tasks for tomorrow's date
  const tasksForTomorrow = useMemo(() => {
    return tasks.filter(task => 
      task.due_date && format(new Date(task.due_date), 'yyyy-MM-dd') === tomorrow
    );
  }, [tasks, tomorrow]);

  const handleCreateTaskForDay = async (taskData: any, customProperties?: any) => {
    try {
      // Ensure the task is created with tomorrow's date
      const taskWithDate = {
        ...taskData,
        due_date: tomorrow
      };
      
      const newTask = await handleCreateTask(taskWithDate, customProperties);
      if (newTask && onTasksUpdate) {
        onTasksUpdate([...tasksForTomorrow, newTask]);
      }
    } catch (error) {
      console.error('Error creating task for tomorrow:', error);
    }
  };

  const completedCount = tasksForTomorrow.filter(task => task.status === 'completat').length;
  const totalCount = tasksForTomorrow.length;

  return (
    <>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Tasques del Dia
          </CardTitle>
          <CardDescription>
            Tasques programades per {tomorrowDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress summary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Progres del dia</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {completedCount}/{totalCount} completades
            </Badge>
          </div>

          {/* Tasks list */}
          <div className="space-y-2">
            {tasksForTomorrow.length > 0 ? (
              tasksForTomorrow.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {task.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {task.priority}
                      </span>
                      {task.folder_id && (
                        <span className="text-xs text-muted-foreground">
                          {folders.find(f => f.id === task.folder_id)?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant={task.status === 'completat' ? 'default' : 'outline'} 
                    className="text-xs"
                  >
                    {task.status === 'completat' ? 'Completada' : 'Pendent'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hi ha tasques programades</p>
                <p className="text-xs">Afegeix una tasca per començar</p>
              </div>
            )}
          </div>

          {/* Add task button */}
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="outline" 
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Afegir Tasca per Demà
          </Button>
        </CardContent>
      </Card>

      {showCreateModal && (
        <LazyModal>
          <CreateTaskModalLazy
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateTaskForDay}
            folders={folders}
          />
        </LazyModal>
      )}
    </>
  );
};