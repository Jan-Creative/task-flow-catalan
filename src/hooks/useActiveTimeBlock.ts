import { useState, useEffect } from 'react';
import { useTodayTimeBlocks } from './useTodayTimeBlocks';
import { TimeBlock } from '@/types/timeblock';

interface ActiveTimeBlockState {
  activeBlock: TimeBlock | null;
  isInActiveBlock: boolean;
}

export const useActiveTimeBlock = (): ActiveTimeBlockState => {
  const { timeBlocks } = useTodayTimeBlocks();
  const [activeState, setActiveState] = useState<ActiveTimeBlockState>({
    activeBlock: null,
    isInActiveBlock: false,
  });

  useEffect(() => {
    const checkActiveBlock = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const activeBlock = timeBlocks.find(block => {
        const startTime = block.startTime;
        const endTime = block.endTime;
        
        // Convert times to minutes for easier comparison
        const timeToMinutes = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        const currentMinutes = timeToMinutes(currentTime);
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      });

      setActiveState({
        activeBlock: activeBlock || null,
        isInActiveBlock: !!activeBlock,
      });
    };

    // Check immediately
    checkActiveBlock();

    // Check every 30 seconds for better precision
    const interval = setInterval(checkActiveBlock, 30000);

    return () => clearInterval(interval);
  }, [timeBlocks]);

  return activeState;
};