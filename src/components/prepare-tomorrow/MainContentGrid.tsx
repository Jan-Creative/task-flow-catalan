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
    <div className="w-full h-full flex flex-col gap-4 animate-fade-in transition-all duration-300">
      {/* Primary Row - Perfect mosaic alignment */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-4 animate-scale-in transition-all duration-300">
        {/* Tasks for Day Card - Clean, expanded (3 cols) */}
        <div className="lg:col-span-3 h-fit">
          <TasksForDayCard 
            tomorrow={tomorrow}
            onTasksUpdate={(tasks) => {
              console.log('Tasks updated:', tasks);
            }}
          />
        </div>
        
        {/* Time Blocks Card - Compact, aligned (2 cols) */}
        <div className="lg:col-span-2 h-fit">
          <TimeBlocksCard 
            className="h-full"
            timeBlocks={preparation?.time_blocks || []}
            onAddTimeBlock={addTimeBlock}
            onUpdateTimeBlock={updateTimeBlock}
            onRemoveTimeBlock={removeTimeBlock}
          />
        </div>
      </div>

      {/* Secondary Row - Supporting cards, perfect alignment */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-4 animate-scale-in transition-all duration-300 delay-100">
        {/* Notes Card - Clean, expanded (3 cols) */}
        <Card className="lg:col-span-3 h-fit hover:shadow-lg transition-all duration-300 border-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="h-4 w-4 text-primary" />
              Notes de Preparació
            </CardTitle>
            <CardDescription className="text-sm">
              Apunta reflexions, objectius o recordatoris per demà
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Objectius per demà, coses a recordar, reflexions del dia d'avui..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="resize-none focus:ring-2 focus:ring-primary/20 transition-all border-muted/30"
            />
            <Button 
              onClick={handleSaveNotes} 
              variant="outline" 
              size="sm"
              className="w-full hover:bg-primary hover:text-primary-foreground transition-colors border-muted/30"
            >
              Guardar Notes
            </Button>
          </CardContent>
        </Card>

        {/* Quick Organization Card - Clean, compact (2 cols) */}
        <Card className="lg:col-span-2 h-fit hover:shadow-md transition-all duration-300 border-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-primary" />
              Organització Ràpida
            </CardTitle>
            <CardDescription className="text-sm">
              Resum de carpetes actives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {folders.slice(0, 6).map(folder => {
              const folderTasks = tasks.filter(t => t.folder_id === folder.id);
              const completedTasks = folderTasks.filter(t => t.status === 'completada');
              
              return (
                <div key={folder.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/10 transition-colors border-l-2 border-transparent hover:border-primary/30">
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
              <div className="text-center py-6">
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