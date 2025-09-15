import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FolderOpen, Calendar, Clock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDadesApp } from '@/hooks/useDadesApp';
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
  const { updateTask, deleteTask, folders } = useDadesApp();
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

  return (
    <div className="bg-muted/10 border border-border/30 rounded-lg p-4 space-y-4">
      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedTasks.length === tasks.length && tasks.length > 0}
            onCheckedChange={onSelectAll}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="text-sm"
          >
            {selectedTasks.length === tasks.length ? 'Deseleccionar tot' : 'Seleccionar tot'}
          </Button>
          {selectedTasks.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {selectedTasks.length} seleccionades
            </Badge>
          )}
        </div>

        {selectedTasks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="text-xs"
          >
            Cancel·lar selecció
          </Button>
        )}
      </div>

      {/* Mass actions - only show when tasks are selected */}
      {selectedTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Move to folder */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Moure a carpeta</label>
            <Select onValueChange={handleMoveToFolder} disabled={isProcessing}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Triar carpeta..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Bustia
                  </div>
                </SelectItem>
                {folders.filter(f => !f.is_system).map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Set date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Establir data</label>
            <Select onValueChange={handleSetDate} disabled={isProcessing}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Triar data..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Avui
                  </div>
                </SelectItem>
                <SelectItem value="tomorrow">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    Demà
                  </div>
                </SelectItem>
                <SelectItem value="clear">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Sense data
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Set priority */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Establir prioritat</label>
            <Select onValueChange={handleSetPriority} disabled={isProcessing}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Triar prioritat..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">
                  <Badge variant="destructive" className="text-xs">Alta</Badge>
                </SelectItem>
                <SelectItem value="mitjana">
                  <Badge variant="outline" className="text-xs">Mitjana</Badge>
                </SelectItem>
                <SelectItem value="baixa">
                  <Badge variant="secondary" className="text-xs">Baixa</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delete tasks */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Accions</label>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isProcessing}
              className="h-8 w-full"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};