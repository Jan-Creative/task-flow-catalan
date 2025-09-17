import { useMemo } from "react";
import { format } from "date-fns";
import { Clock, Plus, Calendar, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTodayTimeBlocks } from "@/hooks/useTodayTimeBlocks";
import { useTaskTimeBlocks } from "@/hooks/useTaskTimeBlocks";
import { TimeBlock } from "@/types/timeblock";

interface DashboardTimeBlocksCardProps {
  onOpenTimeBlocksModal: () => void;
  onCreateNewBlock?: () => void;
}

const DashboardTimeBlocksCard = ({ 
  onOpenTimeBlocksModal, 
  onCreateNewBlock 
}: DashboardTimeBlocksCardProps) => {
  const { timeBlocks, loading } = useTodayTimeBlocks();
  const { getTasksByTimeBlock } = useTaskTimeBlocks();

  // Sort time blocks by start time and limit to 5
  const displayTimeBlocks = useMemo(() => {
    if (!timeBlocks) return [];
    
    return [...timeBlocks]
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5);
  }, [timeBlocks]);

  // Get current time to highlight active block
  const currentTime = format(new Date(), 'HH:mm');

  // Check if a block is currently active
  const isBlockActive = (block: TimeBlock) => {
    return currentTime >= block.startTime && currentTime <= block.endTime;
  };

  // Get tasks information for a time block
  const getTasksInfo = (blockId: string) => {
    const tasks = getTasksByTimeBlock(blockId);
    const completedTasks = tasks.filter(task => task.status === 'completada');
    return {
      total: tasks.length,
      completed: completedTasks.length,
      pending: tasks.length - completedTasks.length,
      tasks: tasks
    };
  };

  return (
    <TooltipProvider>
      <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-primary" />
          Blocs de Temps d'Avui
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateNewBlock}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenTimeBlocksModal}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Veure tots
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Carregant blocs...</div>
          </div>
        ) : displayTimeBlocks.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Cap bloc de temps programat
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Organitza el teu dia creant blocs de temps
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateNewBlock}
              className="mt-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear bloc
            </Button>
          </div>
        ) : (
          /* Time Blocks List */
          <div className="space-y-2">
            {displayTimeBlocks.map((block) => {
              const isActive = isBlockActive(block);
              const tasksInfo = getTasksInfo(block.id);
              const hasCompletedTasks = tasksInfo.completed > 0;
              const completionPercentage = tasksInfo.total > 0 ? (tasksInfo.completed / tasksInfo.total) * 100 : 0;
              
              const BlockContent = (
                <div
                  key={block.id}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md group relative overflow-hidden",
                    isActive 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-transparent bg-accent/50 hover:bg-accent/80",
                    tasksInfo.total > 0 && "animate-pulse [animation-duration:3s] [animation-iteration-count:infinite]"
                  )}
                  onClick={onOpenTimeBlocksModal}
                >
                  {/* Progress bar background */}
                  {tasksInfo.total > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  {/* Progress indicator at top */}
                  {tasksInfo.total > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30 rounded-t-xl overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Enhanced time indicator */}
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2 transition-all duration-200",
                        isActive 
                          ? "bg-primary border-primary shadow-[0_0_6px_hsl(var(--primary))]" 
                          : tasksInfo.total > 0 
                            ? "bg-primary/50 border-primary/50" 
                            : "border-muted-foreground/50"
                      )} />
                      
                      {/* Block info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {block.title}
                          </span>
                          
                          {/* Task indicator dot */}
                          {tasksInfo.total > 0 && (
                            <div className={cn(
                              "w-2 h-2 rounded-full transition-colors duration-200",
                              hasCompletedTasks ? "bg-emerald-500" : "bg-amber-500"
                            )} />
                          )}
                          
                          {isActive && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              Actiu
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {block.startTime} - {block.endTime}
                          </span>
                          
                          {/* Enhanced task badges */}
                          {tasksInfo.total > 0 && (
                            <div className="flex items-center gap-1">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-xs px-1.5 py-0 border transition-colors duration-200",
                                  hasCompletedTasks 
                                    ? "border-emerald-500/50 text-emerald-600 bg-emerald-50" 
                                    : "border-amber-500/50 text-amber-600 bg-amber-50"
                                )}
                              >
                                {tasksInfo.completed > 0 && (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                )}
                                {tasksInfo.pending > 0 && tasksInfo.completed === 0 && (
                                  <Circle className="w-3 h-3 mr-1" />
                                )}
                                {tasksInfo.completed}/{tasksInfo.total}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced color indicator */}
                    <div className="flex items-center gap-2">
                      {tasksInfo.total > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {Math.round(completionPercentage)}%
                        </div>
                      )}
                      <div 
                        className={cn(
                          "w-4 h-4 rounded border transition-all duration-200",
                          tasksInfo.total > 0 && "shadow-sm ring-1 ring-primary/20"
                        )}
                        style={{ backgroundColor: block.color }}
                      />
                    </div>
                  </div>
                </div>
              );

              // Wrap with tooltip if has tasks
              if (tasksInfo.total > 0) {
                return (
                  <Tooltip key={block.id}>
                    <TooltipTrigger asChild>
                      {BlockContent}
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">{block.title}</div>
                        <div className="space-y-1">
                          {tasksInfo.tasks.slice(0, 3).map((task, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              {task.status === 'completada' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Circle className="w-3 h-3 text-muted-foreground" />
                              )}
                              <span className={cn(
                                "truncate",
                                task.status === 'completada' && "line-through text-muted-foreground"
                              )}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                          {tasksInfo.tasks.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{tasksInfo.tasks.length - 3} més
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground pt-1 border-t">
                          {tasksInfo.completed} completades, {tasksInfo.pending} pendents
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return BlockContent;
            })}
            
            {/* Show more indicator */}
            {timeBlocks && timeBlocks.length > 5 && (
              <div 
                onClick={onOpenTimeBlocksModal}
                className="p-3 text-center text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                +{timeBlocks.length - 5} blocs més
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default DashboardTimeBlocksCard;