import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Archive, FolderOpen, Inbox } from 'lucide-react';
import { useState } from 'react';
import { useDadesApp } from '@/hooks/useDadesApp';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { toast } from 'sonner';

interface InboxTriageToolsProps {
  inboxTaskCount: number;
  selectedTasks: string[];
  onClearSelection: () => void;
}

export const InboxTriageTools = ({ inboxTaskCount, selectedTasks, onClearSelection }: InboxTriageToolsProps) => {
  const { updateTask, folders } = useDadesApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMoveToToday = async () => {
    if (selectedTasks.length === 0) return;
    
    setIsProcessing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { due_date: today })
        )
      );
      toast.success(`${selectedTasks.length} tasques mogudes a Avui`);
      onClearSelection();
    } catch (error) {
      console.error('Error moving tasks:', error);
      toast.error('Error al moure les tasques');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSchedule = async () => {
    if (selectedTasks.length === 0) return;
    // This will be enhanced in future phases with date picker
    toast.info('Funcionalitat de programació vindrà aviat');
  };

  const handleMoveToFolder = async (folderId: string) => {
    if (selectedTasks.length === 0) return;
    
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { folder_id: folderId })
        )
      );
      const folder = folders.find(f => f.id === folderId);
      toast.success(`${selectedTasks.length} tasques mogudes a ${folder?.name || 'carpeta'}`);
      onClearSelection();
    } catch (error) {
      console.error('Error moving tasks to folder:', error);
      toast.error('Error al moure les tasques');
    } finally {
      setIsProcessing(false);
    }
  };

  const showTriageNotification = inboxTaskCount > 5;

  return (
    <div className="space-y-4">
      {/* Inbox notification */}
      {showTriageNotification && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <Inbox className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                Bustia necessita organització
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Tens {inboxTaskCount} tasques sense organitzar. Considera organitzar-les per mantenir el flux de treball net.
              </p>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              {inboxTaskCount} tasques
            </Badge>
          </div>
        </div>
      )}

      {/* Quick triage tools - show when tasks are selected */}
      {selectedTasks.length > 0 && (
        <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">
              Eines d'organització ràpida
            </h3>
            <Badge variant="outline">
              {selectedTasks.length} seleccionades
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMoveToToday}
              disabled={isProcessing}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Moure a Avui
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleSchedule}
              disabled={isProcessing}
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              <Clock className="h-4 w-4 mr-1" />
              Programar
            </Button>
            
            {/* Quick folder actions */}
            {folders.filter(f => !f.is_system).slice(0, 3).map(folder => (
              <Button
                key={folder.id}
                size="sm"
                variant="outline"
                onClick={() => handleMoveToFolder(folder.id)}
                disabled={isProcessing}
                className="bg-muted/30 border-border/50 hover:bg-muted/50"
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                {folder.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};