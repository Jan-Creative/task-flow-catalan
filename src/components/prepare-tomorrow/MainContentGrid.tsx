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
      {/* Primary Cards Row - Tasks and Time Blocks (CRITICAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-scale-in transition-all duration-300 delay-300">
        {/* Tasks for Day Card - EXPANDED to 3 columns (60% space - CRITICAL for preparation) */}
        <div className="lg:col-span-3">
          <TasksForDayCard 
            tomorrow={tomorrow}
            onTasksUpdate={(tasks) => {
              // Optional callback for when tasks are updated
              console.log('Tasks updated:', tasks);
            }}
          />
        </div>
        
        {/* Time Blocks Card - COMPACTED to 2 columns (40% space - still functional but compact) */}
        <TimeBlocksCard 
          className="lg:col-span-2"
          timeBlocks={preparation?.time_blocks || []}
          onAddTimeBlock={addTimeBlock}
          onUpdateTimeBlock={updateTimeBlock}
          onRemoveTimeBlock={removeTimeBlock}
        />
      </div>

      {/* Secondary Cards Row - Notes and Organization (SUPPORT) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-scale-in transition-all duration-300 delay-500">
        {/* Notes - EXPANDED to 3 columns (60% space - important for reflection) */}
        <Card className="lg:col-span-3 hover:shadow-lg transition-all duration-300">
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
              rows={8}
              className="resize-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[200px]"
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

        {/* Quick Organization - COMPACTED to 2 columns (40% space - contextual info) */}
        <Card className="lg:col-span-2 hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-primary" />
              Organització Ràpida
            </CardTitle>
            <CardDescription className="text-sm">
              Resum de carpetes actives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {folders.slice(0, 5).map(folder => {
              const folderTasks = tasks.filter(t => t.folder_id === folder.id);
              const completedTasks = folderTasks.filter(t => t.status === 'completada');
              
              return (
                <div key={folder.id} className="flex items-center justify-between p-2 rounded-md bg-muted/15 hover:bg-muted/25 transition-colors">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: folder.color }} 
                    />
                    <span className="font-medium text-xs truncate">{folder.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{folderTasks.length}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {completedTasks.length} ✓
                    </p>
                  </div>
                </div>
              );
            })}
            
            {folders.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">
                  📁 Sense carpetes
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Crea carpetes per organitzar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};