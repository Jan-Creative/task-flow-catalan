import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, MoreHorizontal } from 'lucide-react';
import { CreateTimeBlockModal } from './CreateTimeBlockModal';
import { cn } from '@/lib/utils';

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // "09:00"
  endTime: string;   // "11:00"
  color: string;
  description?: string;
}

interface TimeBlocksCardProps {
  timeBlocks: TimeBlock[];
  onAddTimeBlock?: (block: Omit<TimeBlock, 'id'>) => Promise<void> | void;
  onUpdateTimeBlock?: (blockId: string, updates: Partial<TimeBlock>) => Promise<void> | void;
  onRemoveTimeBlock?: (blockId: string) => Promise<void> | void;
  className?: string;
}

export const TimeBlocksCard = ({ 
  timeBlocks, 
  onAddTimeBlock, 
  onUpdateTimeBlock, 
  onRemoveTimeBlock,
  className 
}: TimeBlocksCardProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00

  const getBlockPosition = (block: TimeBlock) => {
    const [startHour, startMinutes] = block.startTime.split(':').map(Number);
    const [endHour, endMinutes] = block.endTime.split(':').map(Number);
    
    const startPosition = ((startHour - 8) * 60 + startMinutes) / 60; // Hours from 8:00
    const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;
    
    return {
      top: `${startPosition * 4}rem`, // 4rem per hour
      height: `${Math.max(duration * 4, 1)}rem`, // Minimum height
    };
  };

  const handleCreateBlock = (blockData: Omit<TimeBlock, 'id'>) => {
    if (onAddTimeBlock) {
      onAddTimeBlock(blockData);
    }
    setShowCreateModal(false);
  };

  const handleEditBlock = (blockData: Omit<TimeBlock, 'id'>) => {
    if (editingBlock && onUpdateTimeBlock) {
      onUpdateTimeBlock(editingBlock.id, blockData);
    }
    setEditingBlock(null);
  };

  const handleBlockClick = (block: TimeBlock) => {
    setEditingBlock(block);
  };

  const totalPlannedHours = useMemo(() => {
    return timeBlocks.reduce((total, block) => {
      const [startHour, startMinutes] = block.startTime.split(':').map(Number);
      const [endHour, endMinutes] = block.endTime.split(':').map(Number);
      const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;
      return total + duration;
    }, 0);
  }, [timeBlocks]);

  return (
    <>
      <Card className={cn("h-fit", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Blocs de Temps
          </CardTitle>
          <CardDescription>
            Organitza el teu temps en blocs dedicats
          </CardDescription>
          {totalPlannedHours > 0 && (
            <div className="text-sm text-muted-foreground">
              {totalPlannedHours.toFixed(1)} hores planificades
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline view */}
          <div className="relative bg-muted/10 rounded-lg border border-border/50 overflow-hidden">
            <div className="flex">
              {/* Time column */}
              <div className="w-16 flex-shrink-0 bg-card/80">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 px-2 py-1 text-xs text-muted-foreground border-t border-border/30 flex items-start first:border-t-0"
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Blocks column */}
              <div className="flex-1 relative min-h-[720px]"> {/* 15 hours * 48px per hour */}
                {/* Hour separators */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 h-12 border-t border-border/20 first:border-t-0"
                    style={{ top: `${(hour - 8) * 3}rem` }}
                  >
                    {/* Half-hour line */}
                    <div className="absolute top-6 left-0 right-0 h-px bg-border/10" />
                  </div>
                ))}

                {/* Time blocks */}
                {timeBlocks.map((block) => {
                  const position = getBlockPosition(block);
                  
                  return (
                    <div
                      key={block.id}
                      className="absolute left-1 right-1 rounded-md cursor-pointer group hover:shadow-md transition-all duration-200 border border-white/20"
                      style={{
                        ...position,
                        backgroundColor: block.color + '40', // 40% opacity
                        borderColor: block.color,
                      }}
                      onClick={() => handleBlockClick(block)}
                    >
                      <div className="p-2 h-full flex flex-col justify-between">
                        <div>
                          <div 
                            className="text-xs font-medium leading-tight truncate"
                            style={{ color: block.color }}
                          >
                            {block.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {block.startTime} - {block.endTime}
                          </div>
                        </div>
                        {block.description && (
                          <div className="text-xs text-muted-foreground truncate mt-1">
                            {block.description}
                          </div>
                        )}
                        
                        {/* Edit indicator on hover */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state overlay */}
                {timeBlocks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div className="text-sm font-medium mb-1">No hi ha blocs de temps</div>
                      <div className="text-xs">Afegeix un bloc per organitzar el teu dia</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add block button */}
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="outline" 
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Afegir Bloc de Temps
          </Button>
        </CardContent>
      </Card>

      <CreateTimeBlockModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBlock}
      />

      {editingBlock && (
        <CreateTimeBlockModal
          open={!!editingBlock}
          onClose={() => setEditingBlock(null)}
          onSubmit={handleEditBlock}
          editingBlock={editingBlock}
          onDelete={onRemoveTimeBlock ? () => {
            onRemoveTimeBlock(editingBlock.id);
            setEditingBlock(null);
          } : undefined}
        />
      )}
    </>
  );
};