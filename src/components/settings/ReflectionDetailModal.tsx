import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DailyReflectionCard } from '@/components/prepare-tomorrow/DailyReflectionCard';
import type { DailyReflection } from '@/types/reflection';

interface ReflectionDetailModalProps {
  reflection: DailyReflection | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReflectionDetailModal({ reflection, isOpen, onClose }: ReflectionDetailModalProps) {
  if (!reflection) return null;

  const reflectionDate = new Date(reflection.reflection_date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reflexió Detallada</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <DailyReflectionCard date={reflectionDate} />
        </div>
      </DialogContent>
    </Dialog>
  );
}