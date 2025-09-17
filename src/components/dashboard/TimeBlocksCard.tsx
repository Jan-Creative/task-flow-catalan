import { useMemo } from "react";
import { format } from "date-fns";
import { ca } from "date-fns/locale";
import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTodayTimeBlocks } from "@/hooks/useTodayTimeBlocks";
import { useTaskTimeBlocks } from "@/hooks/useTaskTimeBlocks";
import { cn } from "@/lib/utils";

interface TimeBlocksCardProps {
  onOpenModal?: () => void;
}

export const TimeBlocksCard = ({ onOpenModal }: TimeBlocksCardProps) => {
  const { timeBlocks, loading } = useTodayTimeBlocks();
  const { getTasksByTimeBlock } = useTaskTimeBlocks();

  // Sort time blocks by start time and limit to 5 for dashboard
  const sortedTimeBlocks = useMemo(() => {
    if (!timeBlocks) return [];
    
    return [...timeBlocks]
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5);
  }, [timeBlocks]);

  // Get current time for highlighting active block
  const currentTime = useMemo(() => {
    const now = new Date();
    return format(now, 'HH:mm');
  }, []);

  const isCurrentBlock = (startTime: string, endTime: string) => {
    return currentTime >= startTime && currentTime <= endTime;
  };

  return (
    <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-organic)] transition-all duration-300 p-6">
      <div className="flex flex-row items-center justify-between pb-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-primary" />
          Blocs de temps d'avui
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenModal}
          className="text-xs text-muted-foreground hover:text-foreground border-0 bg-transparent"
        >
          Veure tots
        </Button>
      </div>
      
      <div className="pt-0">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Carregant blocs de temps...</p>
          </div>
        ) : sortedTimeBlocks.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-muted-foreground text-sm">No tens blocs de temps programats per avui</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenModal}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Crear bloc
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTimeBlocks.map((block) => {
              const assignedTasks = getTasksByTimeBlock(block.id);
              const isActive = isCurrentBlock(block.startTime, block.endTime);
              
              return (
                <div
                  key={block.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-accent/50"
                  )}
                >
                  {/* Time indicator */}
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "w-3 h-8 rounded-sm",
                        isActive ? "bg-primary" : "bg-muted"
                      )}
                      style={{ backgroundColor: isActive ? undefined : block.color }}
                    />
                  </div>
                  
                  {/* Block info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {block.title}
                      </p>
                      {assignedTasks.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {assignedTasks.length}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {block.startTime} - {block.endTime}
                    </p>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {timeBlocks.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenModal}
                className="w-full text-xs text-muted-foreground hover:text-foreground mt-2"
              >
                +{timeBlocks.length - 5} més blocs...
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};