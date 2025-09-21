import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock } from "lucide-react";
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
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-background/5 backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/5 rounded-2xl shadow-lg/10"
        overlayClassName="bg-transparent"
      >        
        <div className="flex-1 overflow-y-auto p-6">
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
              className="border-0 shadow-none bg-transparent"
              baseDate={new Date()}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};