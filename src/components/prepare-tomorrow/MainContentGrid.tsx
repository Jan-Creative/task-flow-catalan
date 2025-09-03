import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TasksForDayCard } from './TasksForDayCard';
import { TimeBlocksCard } from './TimeBlocksCard';
import { FolderOpen, NotebookPen } from 'lucide-react';
import { Tasca } from '@/types';

interface MainContentGridProps {
  tasks: Tasca[];
  folders: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  notes: string;
  setNotes: (notes: string) => void;
  handleSaveNotes: () => Promise<void>;
  preparation: any;
  tomorrow: string;
  addTimeBlock: (block: any) => Promise<void>;
  updateTimeBlock: (id: string, block: any) => Promise<void>;
  removeTimeBlock: (id: string) => Promise<void>;
}

export const MainContentGrid: React.FC<MainContentGridProps> = ({
  tasks,
  folders,
  notes,
  setNotes,
  handleSaveNotes,
  preparation,
  tomorrow,
  addTimeBlock,
  updateTimeBlock,
  removeTimeBlock
}) => {
  return (
    <div className="space-y-6 animate-fade-in transition-all duration-300">
      {/* Primary Cards Row - Tasks and Time Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-scale-in transition-all duration-300 delay-300">
        {/* Tasks for Day Card - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <TasksForDayCard 
            tomorrow={tomorrow}
            onTasksUpdate={(tasks) => {
              // Optional callback for when tasks are updated
              console.log('Tasks updated:', tasks);
            }}
          />
        </div>
        
        {/* Time Blocks Card - 3 columns on large screens */}
        <TimeBlocksCard 
          className="lg:col-span-3"
          timeBlocks={preparation?.time_blocks || []}
          onAddTimeBlock={addTimeBlock}
          onUpdateTimeBlock={updateTimeBlock}
          onRemoveTimeBlock={removeTimeBlock}
        />
      </div>

      {/* Secondary Cards Row - Organization and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-scale-in transition-all duration-300 delay-500">
        {/* Quick Organization - 2 columns on large screens */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Organització Ràpida
            </CardTitle>
            <CardDescription>
              Revisa l'estat de les teves carpetes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {folders.slice(0, 4).map(folder => {
              const folderTasks = tasks.filter(t => t.folder_id === folder.id);
              const completedTasks = folderTasks.filter(t => t.status === 'completada');
              
              return (
                <div key={folder.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: folder.color }} 
                    />
                    <span className="font-medium text-sm">{folder.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{folderTasks.length} tasques</p>
                    <p className="text-xs text-muted-foreground">
                      {completedTasks.length} completades
                    </p>
                  </div>
                </div>
              );
            })}
            
            {folders.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  📁 No hi ha carpetes creades encara
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Crea carpetes per organitzar millor les teves tasques
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes - 3 columns on large screens */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookPen className="h-5 w-5 text-primary" />
              Notes de Preparació
            </CardTitle>
            <CardDescription>
              Apunta reflexions, objectius o recordatoris per demà
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Objectius per demà, coses a recordar, reflexions del dia d'avui..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="resize-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button 
              onClick={handleSaveNotes} 
              variant="outline" 
              className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Guardar Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};