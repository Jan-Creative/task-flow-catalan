import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { TimeBlocksCard } from "@/components/prepare-tomorrow/TimeBlocksCard";
import { useTodayTimeBlocks } from "@/hooks/useTodayTimeBlocks";

interface TodayTimeBlocksModalProps {
  open: boolean;
  onClose: () => void;
}

export const TodayTimeBlocksModal = ({ open, onClose }: TodayTimeBlocksModalProps) => {
  const { 
    timeBlocks, 
    addTimeBlock, 
    updateTimeBlock, 
    removeTimeBlock,
    loading 
  } = useTodayTimeBlocks();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Blocs de Temps d'Avui
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregant blocs de temps...</p>
            </div>
          ) : (
            <TimeBlocksCard
              timeBlocks={timeBlocks}
              onAddTimeBlock={addTimeBlock}
              onUpdateTimeBlock={updateTimeBlock}
              onRemoveTimeBlock={removeTimeBlock}
              className="border-0 shadow-none"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};