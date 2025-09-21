import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useTodayTimeBlocks } from '@/hooks/useTodayTimeBlocks';

interface QuickTimeBlockCreatorProps {
  onSuccess?: () => void;
}

export const QuickTimeBlockCreator = ({ onSuccess }: QuickTimeBlockCreatorProps) => {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createQuickTimeBlock } = useTodayTimeBlocks();

  const handleQuickCreate = async () => {
    if (!title.trim()) {
      toast.error('Afegeix un títol per al bloc');
      return;
    }

    setIsCreating(true);
    try {
      await createQuickTimeBlock(title.trim());
      setTitle('');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating quick time block:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickCreate();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg border border-border/50">
      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Crear bloc ràpid..."
        className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={isCreating}
      />
      <Button
        size="sm"
        onClick={handleQuickCreate}
        disabled={!title.trim() || isCreating}
        className="h-8 px-3"
      >
        {isCreating ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};