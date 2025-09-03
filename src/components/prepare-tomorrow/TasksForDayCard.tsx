import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Removed unused import
import CreateTaskModal from '@/components/CreateTaskModal';
import { Plus, Calendar, Clock } from 'lucide-react';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useDadesApp } from '@/hooks/useDadesApp';
import { format, addDays } from 'date-fns';
import { ca } from 'date-fns/locale';
import type { Task } from '@/types/task';

interface TasksForDayCardProps {
  tomorrow: string;
  onTasksUpdate?: (tasks: Task[]) => void;
}

export const TasksForDayCard = ({ tomorrow, onTasksUpdate }: TasksForDayCardProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { tasks, folders } = useDadesApp();
  const { handleCreateTask } = useTaskOperations();

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

  const completedCount = tasksForTomorrow.filter(task => task.status === 'completada').length;
  const totalCount = tasksForTomorrow.length;

  return (
    <>
      <Card className="h-fit hover:shadow-lg transition-all duration-300 border-2 border-muted/50 hover:border-primary/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Tasques del Dia
            </div>
            <Badge variant="secondary" className="text-xs font-medium">
              {completedCount}/{totalCount}
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm">
            Tasques programades per {tomorrowDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enhanced Progress summary */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-muted/20 to-muted/10 border border-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Progres de Preparació</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            {totalCount > 0 && (
              <div className="w-full bg-muted/20 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Enhanced Tasks list */}
          <div className="space-y-3">
            {tasksForTomorrow.length > 0 ? (
              tasksForTomorrow.map(task => {
                const folder = folders.find(f => f.id === task.folder_id);
                return (
                  <div key={task.id} className="group p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 border border-muted/20 hover:border-muted/40">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm leading-tight">{task.title}</p>
                          <Badge 
                            variant={task.status === 'completada' ? 'default' : 'outline'} 
                            className="text-xs shrink-0"
                          >
                            {task.status === 'completada' ? '✓ Completada' : 'Pendent'}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary/60" />
                            <span className="text-muted-foreground font-medium">
                              {task.priority}
                            </span>
                          </div>
                          
                          {folder && (
                            <div className="flex items-center gap-1">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: folder.color }} 
                              />
                              <span className="text-muted-foreground">
                                {folder.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium mb-1">No hi ha tasques programades</p>
                <p className="text-xs">Afegeix tasques per organitzar el teu dia de demà</p>
              </div>
            )}
          </div>

          {/* Enhanced Add task button */}
          <div className="pt-2">
            <Button 
              onClick={() => setShowCreateModal(true)}
              variant="outline" 
              className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-dashed border-2 hover:border-solid"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Afegir Tasca per Demà
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTaskForDay}
        folders={folders}
      />
    </>
  );
};