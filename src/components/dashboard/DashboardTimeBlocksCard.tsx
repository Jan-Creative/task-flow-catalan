import { useMemo } from "react";
import { format } from "date-fns";
import { Clock, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  // Get tasks count for a time block
  const getTasksCount = (blockId: string) => {
    return getTasksByTimeBlock(blockId).length;
  };

  return (
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
              const tasksCount = getTasksCount(block.id);
              
              return (
                <div
                  key={block.id}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                    isActive 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-transparent bg-accent/50 hover:bg-accent/80"
                  )}
                  onClick={onOpenTimeBlocksModal}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Time indicator */}
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2",
                        isActive ? "bg-primary border-primary" : "border-muted-foreground/50"
                      )} />
                      
                      {/* Block info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {block.title}
                          </span>
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
                          {tasksCount > 0 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {tasksCount} {tasksCount === 1 ? 'tasca' : 'tasques'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Color indicator */}
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: block.color }}
                    />
                  </div>
                </div>
              );
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
  );
};

export default DashboardTimeBlocksCard;