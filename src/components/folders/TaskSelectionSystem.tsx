import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FolderOpen, Calendar, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTasks } from '@/contexts/TasksProvider';
import { toast } from 'sonner';
import type { Task } from '@/types';

interface TaskSelectionSystemProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const TaskSelectionSystem = ({ 
  tasks, 
  selectedTasks, 
  onSelectTask, 
  onSelectAll, 
  onClearSelection 
}: TaskSelectionSystemProps) => {
  const { actualitzarTasca: updateTask, eliminarTasca: deleteTask, folders } = useTasks();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMoveToFolder = async (folderId: string) => {
    if (selectedTasks.length === 0) return;
    
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { folder_id: folderId === 'none' ? null : folderId })
        )
      );
      
      const folder = folderId === 'none' 
        ? 'Bustia' 
        : folders.find(f => f.id === folderId)?.name || 'carpeta';
      
      toast.success(`${selectedTasks.length} tasques mogudes a ${folder}`);
      onClearSelection();
    } catch (error) {
      console.error('Error moving tasks:', error);
      toast.error('Error al moure les tasques');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDate = async (dateType: 'today' | 'tomorrow' | 'clear') => {
    if (selectedTasks.length === 0) return;
    
    setIsProcessing(true);
    try {
      let due_date = null;
      if (dateType === 'today') {
        due_date = new Date().toISOString().split('T')[0];
      } else if (dateType === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        due_date = tomorrow.toISOString().split('T')[0];
      }
      
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { due_date })
        )
      );
      
      const message = dateType === 'clear' 
        ? 'Data eliminada' 
        : `Data establerta a ${dateType === 'today' ? 'avui' : 'demà'}`;
      
      toast.success(`${selectedTasks.length} tasques actualitzades: ${message}`);
      onClearSelection();
    } catch (error) {
      console.error('Error setting date:', error);
      toast.error('Error al establir la data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetPriority = async (priority: string) => {
    if (selectedTasks.length === 0) return;
    
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { priority })
        )
      );
      
      toast.success(`${selectedTasks.length} tasques actualitzades amb prioritat: ${priority}`);
      onClearSelection();
    } catch (error) {
      console.error('Error setting priority:', error);
      toast.error('Error al establir la prioritat');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTasks.length === 0) return;
    
    if (!confirm(`Estàs segur que vols eliminar ${selectedTasks.length} tasques? Aquesta acció no es pot desfer.`)) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => deleteTask(taskId))
      );
      
      toast.success(`${selectedTasks.length} tasques eliminades`);
      onClearSelection();
    } catch (error) {
      console.error('Error deleting tasks:', error);
      toast.error('Error al eliminar les tasques');
    } finally {
      setIsProcessing(false);
    }
  };

  if (tasks.length === 0) return null;

  if (selectedTasks.length === 0) return null;

  return (
    <div className="backdrop-blur-sm bg-background/60 border border-border/40 rounded-xl p-3 mb-4 transition-all duration-300">
      {/* Compact selection controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedTasks.length === tasks.length && tasks.length > 0}
            onCheckedChange={onSelectAll}
            className="h-4 w-4"
          />
          <span className="text-sm text-muted-foreground">
            {selectedTasks.length} de {tasks.length} seleccionades
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel·lar
        </Button>
      </div>

      {/* Compact mass actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Move to folder */}
        <Select onValueChange={handleMoveToFolder} disabled={isProcessing}>
          <SelectTrigger className="h-7 w-auto min-w-[120px] bg-background/80 border-border/60 text-xs">
            <FolderOpen className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Moure a..." />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-md border-border/60">
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-3 w-3" />
                <span className="text-xs">Bustia</span>
              </div>
            </SelectItem>
            {folders.filter(f => !f.is_system).map(folder => (
              <SelectItem key={folder.id} value={folder.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="text-xs">{folder.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Set date */}
        <Select onValueChange={handleSetDate} disabled={isProcessing}>
          <SelectTrigger className="h-7 w-auto min-w-[100px] bg-background/80 border-border/60 text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Data..." />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-md border-border/60">
            <SelectItem value="today">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-primary" />
                <span className="text-xs">Avui</span>
              </div>
            </SelectItem>
            <SelectItem value="tomorrow">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-secondary" />
                <span className="text-xs">Demà</span>
              </div>
            </SelectItem>
            <SelectItem value="clear">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs">Sense data</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Set priority */}
        <Select onValueChange={handleSetPriority} disabled={isProcessing}>
          <SelectTrigger className="h-7 w-auto min-w-[100px] bg-background/80 border-border/60 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Prioritat..." />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-md border-border/60">
            <SelectItem value="alta">
              <Badge variant="destructive" className="text-xs h-4">Alta</Badge>
            </SelectItem>
            <SelectItem value="mitjana">
              <Badge variant="outline" className="text-xs h-4">Mitjana</Badge>
            </SelectItem>
            <SelectItem value="baixa">
              <Badge variant="secondary" className="text-xs h-4">Baixa</Badge>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Delete tasks */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDeleteSelected}
          disabled={isProcessing}
          className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Eliminar
        </Button>
      </div>
    </div>
  );
};