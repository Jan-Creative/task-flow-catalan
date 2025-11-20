import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Clock, 
  Folder, 
  MoveRight, 
  RotateCcw, 
  Archive,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { useTasksCore } from '@/hooks/tasks/useTasksCore';
import { Tasca } from '@/types';
import { format, addDays, startOfDay } from 'date-fns';
import { ca } from 'date-fns/locale';

// Extended task type with folder information
interface ExtendedTask extends Tasca {
  folder?: {
    id: string;
    name: string;
    color: string;
  };
}

export const IncompleteTasksCard = () => {
  const { tasks, folders, actualitzarTasca: updateTask, loading } = useTasksCore();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [actionType, setActionType] = useState<'tomorrow' | 'reschedule' | 'inbox'>('tomorrow');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the Bustia (inbox) folder
  const inboxFolder = folders.find(folder => folder.is_system && folder.name === 'Bustia');

  // Filter incomplete tasks from today and overdue tasks
  const incompleteTasksToday = (tasks as ExtendedTask[]).filter(task => {
    const today = startOfDay(new Date());
    const taskDate = task.due_date ? startOfDay(new Date(task.due_date)) : null;
    
    // Tasks due today that are not completed
    const isDueToday = taskDate && taskDate.getTime() === today.getTime() && task.status !== 'completat';
    
    // Overdue tasks that are not completed
    const isOverdue = taskDate && taskDate.getTime() < today.getTime() && task.status !== 'completat';
    
    // Tasks in progress without due date (potentially worked on today)
    const isInProgressWithoutDate = task.status === 'en_proces' && !task.due_date;
    
    return isDueToday || isOverdue || isInProgressWithoutDate;
  });

  // Group tasks by category
  const groupedTasks = {
    overdue: incompleteTasksToday.filter(task => {
      const today = startOfDay(new Date());
      const taskDate = task.due_date ? startOfDay(new Date(task.due_date)) : null;
      return taskDate && taskDate.getTime() < today.getTime();
    }),
    today: incompleteTasksToday.filter(task => {
      const today = startOfDay(new Date());
      const taskDate = task.due_date ? startOfDay(new Date(task.due_date)) : null;
      return taskDate && taskDate.getTime() === today.getTime();
    }),
    inProgress: incompleteTasksToday.filter(task => 
      task.status === 'en_proces' && !task.due_date
    )
  };

  if (incompleteTasksToday.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Tasques Incompletes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              🎉 Perfecte! No tens tasques incompletes pendents
            </p>
            <p className="text-xs text-muted-foreground">
              Totes les tasques del dia estan completades o organitzades
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === incompleteTasksToday.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(incompleteTasksToday.map(task => task.id));
    }
  };

  const handleMoveToTomorrow = async () => {
    setIsProcessing(true);
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    
    try {
      const tasksToUpdate = incompleteTasksToday.filter(task => 
        selectedTasks.includes(task.id)
      );
      
      await Promise.all(
        tasksToUpdate.map(task => 
          updateTask(task.id, { due_date: tomorrow })
        )
      );
      
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error moving tasks to tomorrow:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReschedule = () => {
    setActionType('reschedule');
    setShowDatePicker(true);
  };

  const handleMoveToInbox = async () => {
    if (!inboxFolder) return;
    
    setIsProcessing(true);
    
    try {
      const tasksToUpdate = incompleteTasksToday.filter(task => 
        selectedTasks.includes(task.id)
      );
      
      await Promise.all(
        tasksToUpdate.map(task => 
          updateTask(task.id, { 
            folder_id: inboxFolder.id,
            due_date: null 
          })
        )
      );
      
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error moving tasks to inbox:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDateConfirm = async () => {
    if (!selectedDate) return;
    
    setIsProcessing(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      const tasksToUpdate = incompleteTasksToday.filter(task => 
        selectedTasks.includes(task.id)
      );
      
      await Promise.all(
        tasksToUpdate.map(task => 
          updateTask(task.id, { due_date: formattedDate })
        )
      );
      
      setSelectedTasks([]);
      setShowDatePicker(false);
      setSelectedDate(undefined);
    } catch (error) {
      console.error('Error rescheduling tasks:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const TaskGroup = ({ title, tasks, icon, colorClass }: {
    title: string;
    tasks: ExtendedTask[];
    icon: React.ReactNode;
    colorClass: string;
  }) => {
    if (tasks.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className={`text-sm font-medium ${colorClass}`}>{title}</h4>
          <Badge variant="outline" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        {tasks.map(task => (
          <div 
            key={task.id} 
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <Checkbox
              checked={selectedTasks.includes(task.id)}
              onCheckedChange={() => handleSelectTask(task.id)}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-medium text-sm text-foreground truncate">
                  {task.title}
                </h5>
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
                {task.due_date && (
                  <>
                    <CalendarIcon className="h-3 w-3" />
                    <span>
                      {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ca })}
                    </span>
                  </>
                )}
                <Badge variant="outline" className="text-xs">
                  {task.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {task.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Tasques Incompletes</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {incompleteTasksToday.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isProcessing}
              >
                {selectedTasks.length === incompleteTasksToday.length ? 'Deseleccionar tot' : 'Seleccionar tot'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <TaskGroup
            title="Tasques Vençudes"
            tasks={groupedTasks.overdue}
            icon={<Clock className="h-4 w-4 text-red-500" />}
            colorClass="text-red-600"
          />
          
          <TaskGroup
            title="Tasques d'Avui"
            tasks={groupedTasks.today}
            icon={<CalendarIcon className="h-4 w-4 text-orange-500" />}
            colorClass="text-orange-600"
          />
          
          <TaskGroup
            title="En Procés (sense data)"
            tasks={groupedTasks.inProgress}
            icon={<RotateCcw className="h-4 w-4 text-blue-500" />}
            colorClass="text-blue-600"
          />

          {selectedTasks.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              <Button
                variant="default"
                size="sm"
                onClick={handleMoveToTomorrow}
                disabled={isProcessing}
                className="bg-primary text-primary-foreground"
              >
                <MoveRight className="h-4 w-4 mr-1" />
                Moure a Demà ({selectedTasks.length})
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReschedule}
                disabled={isProcessing}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Reorganitzar
              </Button>
              
              {inboxFolder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMoveToInbox}
                  disabled={isProcessing}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Moure a Bustia
                </Button>
              )}
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Consell:</strong> Organitza les tasques incompletes per mantenir el control. 
              Pots moure-les a demà, reorganitzar-les per altres dies, o portar-les a la carpeta Bustia per revisar-les més tard.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecciona una Nova Data</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDatePicker(false)}>
              Cancel·lar
            </Button>
            <Button 
              onClick={handleDateConfirm} 
              disabled={!selectedDate || isProcessing}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};