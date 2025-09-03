import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, MoreHorizontal, Settings } from 'lucide-react';
import { CreateTimeBlockModal } from './CreateTimeBlockModal';
import { TimeBlockNotificationConfigModal } from './TimeBlockNotificationConfig';
import { TimeBlockNotificationPopover } from './TimeBlockNotificationPopover';
import { cn } from '@/lib/utils';
import { useBlockResize } from '@/hooks/useBlockResize';
import { useTimeBlockNotifications } from '@/hooks/useTimeBlockNotifications';
import type { TimeBlock, TimeBlockNotificationConfig } from '@/types/timeblock';

// TimeBlock interface now imported from types

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
  const [showNotificationConfig, setShowNotificationConfig] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState<TimeBlockNotificationConfig>({
    enableGlobal: false,
    defaultStartReminder: 5,
    defaultEndReminder: 5,
    defaultStartEnabled: true,
    defaultEndEnabled: false,
  });

  // Initialize resize functionality
  const { resizeState, startResize, containerRef } = useBlockResize({
    onUpdateBlock: onUpdateTimeBlock || (() => {}),
    minHour: 8,
    maxHour: 22,
    snapMinutes: 15,
  });

  const { updateBlockNotifications } = useTimeBlockNotifications();

  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00

  const getBlockPosition = (block: TimeBlock) => {
    const [startHour, startMinutes] = block.startTime.split(':').map(Number);
    const [endHour, endMinutes] = block.endTime.split(':').map(Number);
    
    const startPosition = ((startHour - 8) * 60 + startMinutes) / 60; // Hours from 8:00
    const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;
    
    return {
      top: `${startPosition * 2.5}rem`, // 2.5rem per hour to match grid
      height: `${Math.max(duration * 2.5, 1)}rem`, // Minimum height
    };
  };

  const formatDuration = (block: TimeBlock) => {
    const [startHour, startMinutes] = block.startTime.split(':').map(Number);
    const [endHour, endMinutes] = block.endTime.split(':').map(Number);
    const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;
    
    if (duration === 1) return "1 hora";
    if (duration < 1) return `${Math.round(duration * 60)} min`;
    return `${duration.toFixed(1)} hores`;
  };

  const handleCreateBlock = async (blockData: Omit<TimeBlock, 'id'>) => {
    const newBlock = { ...blockData, id: crypto.randomUUID() };
    if (onAddTimeBlock) {
      onAddTimeBlock(blockData);
    }
    
    // Schedule notifications if enabled
    if (blockData.notifications) {
      await updateBlockNotifications(newBlock);
    }
    
    setShowCreateModal(false);
  };

  const handleEditBlock = async (blockData: Omit<TimeBlock, 'id'>) => {
    if (editingBlock && onUpdateTimeBlock) {
      const updatedBlock = { ...editingBlock, ...blockData };
      onUpdateTimeBlock(editingBlock.id, blockData);
      
      // Update notifications if enabled
      if (blockData.notifications) {
        await updateBlockNotifications(updatedBlock, editingBlock);
      }
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Blocs de Temps
            </div>
            <Button
              onClick={() => setShowNotificationConfig(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
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
          <div className="relative bg-muted/5 rounded-lg border border-muted/8 overflow-hidden">
            <div className="relative">
              {/* Time column */}
              <div className="w-14 flex-shrink-0 bg-muted/8 relative z-10">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-10 px-2 py-1 text-xs text-muted-foreground/40 border-t border-muted/8 flex items-start first:border-t-0"
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Grid background - positioned absolutely to cover full width */}
              <div className="absolute inset-0 min-h-[375px]">
                {/* Hour separators */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 h-10 border-t border-muted/8 first:border-t-0"
                    style={{ top: `${(hour - 8) * 2.5}rem` }}
                  >
                    {/* Half-hour line */}
                    <div className="absolute top-5 left-0 right-0 h-px bg-muted/5" />
                  </div>
                ))}
              </div>

              {/* Time blocks - positioned absolutely to cover full width */}
              <div ref={containerRef} className="absolute inset-0 min-h-[375px]">
                {timeBlocks.map((block) => {
                  const isResizing = resizeState.isResizing && resizeState.blockId === block.id;
                  const renderBlock: TimeBlock = isResizing && resizeState.currentStartTime
                    ? { ...block, startTime: resizeState.currentStartTime, endTime: resizeState.currentEndTime }
                    : block;
                  const position = getBlockPosition(renderBlock);
                  
                  return (
                    <div
                      key={block.id}
                      className={cn(
                        "absolute left-0 right-0 rounded-lg cursor-pointer group hover:shadow-lg transition-all duration-300 border-2",
                        isResizing && "shadow-xl ring-2 ring-primary/50"
                      )}
                      style={{
                        ...position,
                        backgroundColor: block.color + '30', // 30% opacity
                        borderColor: block.color,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockClick(block);
                      }}
                    >
                      {/* Top resize handle */}
                      <div
                        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 transition-colors z-20"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startResize(block.id, 'top', e.clientY, block.startTime, block.endTime);
                        }}
                      />
                      
                      {/* Bottom resize handle */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 transition-colors z-20"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startResize(block.id, 'bottom', e.clientY, block.startTime, block.endTime);
                        }}
                      />

                      <div className="p-3 pl-16 h-full flex flex-col justify-start relative z-10"> {/* pl-16 to avoid time column */}
                        <div className="space-y-1">
                          <div 
                            className="text-sm font-semibold leading-tight truncate"
                            style={{ color: block.color }}
                          >
                            {block.title}
                          </div>
                          <div className="text-xs text-muted-foreground/80 font-medium">
                            {formatDuration(renderBlock)}
                          </div>
                          {block.description && (
                            <div className="text-xs text-muted-foreground/70 truncate mt-1">
                              {block.description}
                            </div>
                          )}
                        </div>
                        
                        {/* Notification and edit indicators on hover */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <TimeBlockNotificationPopover
                            block={block}
                            onUpdateBlock={(updates) => onUpdateTimeBlock?.(block.id, updates)}
                          />
                          <div className="p-1">
                            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                          </div>
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
        notificationConfig={notificationConfig}
      />

      <TimeBlockNotificationConfigModal
        open={showNotificationConfig}
        onClose={() => setShowNotificationConfig(false)}
        config={notificationConfig}
        onConfigChange={setNotificationConfig}
      />

      {editingBlock && (
        <CreateTimeBlockModal
          open={!!editingBlock}
          onClose={() => setEditingBlock(null)}
          onSubmit={handleEditBlock}
          editingBlock={editingBlock}
          notificationConfig={notificationConfig}
          onDelete={onRemoveTimeBlock ? () => {
            onRemoveTimeBlock(editingBlock.id);
            setEditingBlock(null);
          } : undefined}
        />
      )}
    </>
  );
};