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
    <div className="space-y-3">
      {/* Subtle inbox notification */}
      {showTriageNotification && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-1.5 rounded-lg">
              <Inbox className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-medium">{inboxTaskCount} tasques</span> sense organitzar
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
              Organitzar
            </Badge>
          </div>
        </div>
      )}

      {/* Minimalist quick triage tools - show when tasks are selected */}
      {selectedTasks.length > 0 && (
        <div className="bg-background/60 border border-border/40 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">
              Accions ràpides:
            </span>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMoveToToday}
              disabled={isProcessing}
              className="h-7 px-2 text-xs bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Avui
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSchedule}
              disabled={isProcessing}
              className="h-7 px-2 text-xs bg-secondary/10 text-secondary hover:bg-secondary/20"
            >
              <Clock className="h-3 w-3 mr-1" />
              Programar
            </Button>
            
            {/* Quick folder actions - only top 2 folders */}
            {folders.filter(f => !f.is_system).slice(0, 2).map(folder => (
              <Button
                key={folder.id}
                size="sm"
                variant="ghost"
                onClick={() => handleMoveToFolder(folder.id)}
                disabled={isProcessing}
                className="h-7 px-2 text-xs bg-muted/30 hover:bg-muted/50"
              >
                <div 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};