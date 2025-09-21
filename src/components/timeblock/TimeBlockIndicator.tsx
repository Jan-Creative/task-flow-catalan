import { useActiveTimeBlock } from '@/hooks/useActiveTimeBlock';
import { useEffect, useState } from 'react';

export const TimeBlockIndicator = () => {
  const { activeBlock, isInActiveBlock } = useActiveTimeBlock();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInActiveBlock && activeBlock) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow smooth transition
      const timeout = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isInActiveBlock, activeBlock]);

  if (!isVisible || !activeBlock) {
    return null;
  }

  const borderColor = activeBlock.color;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999] timeblock-border-indicator"
      style={{
        background: `
          linear-gradient(0deg, ${borderColor}33 0%, transparent 4px),
          linear-gradient(90deg, ${borderColor}33 0%, transparent 4px),
          linear-gradient(180deg, ${borderColor}33 0%, transparent 4px),
          linear-gradient(270deg, ${borderColor}33 0%, transparent 4px)
        `,
        boxShadow: `
          inset 0 0 0 2px ${borderColor}40,
          inset 0 0 20px ${borderColor}20,
          0 0 40px ${borderColor}15
        `,
        animation: 'timeblock-pulse 4s ease-in-out infinite',
      }}
    >
      {/* Corner accents */}
      <div 
        className="absolute top-0 left-0 w-12 h-12 rounded-br-2xl"
        style={{
          background: `radial-gradient(circle at top left, ${borderColor}60 0%, transparent 70%)`,
          animation: 'timeblock-corner-glow 3s ease-in-out infinite alternate',
        }}
      />
      <div 
        className="absolute top-0 right-0 w-12 h-12 rounded-bl-2xl"
        style={{
          background: `radial-gradient(circle at top right, ${borderColor}60 0%, transparent 70%)`,
          animation: 'timeblock-corner-glow 3s ease-in-out infinite alternate 0.5s',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-12 h-12 rounded-tr-2xl"
        style={{
          background: `radial-gradient(circle at bottom left, ${borderColor}60 0%, transparent 70%)`,
          animation: 'timeblock-corner-glow 3s ease-in-out infinite alternate 1s',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-12 h-12 rounded-tl-2xl"
        style={{
          background: `radial-gradient(circle at bottom right, ${borderColor}60 0%, transparent 70%)`,
          animation: 'timeblock-corner-glow 3s ease-in-out infinite alternate 1.5s',
        }}
      />
    </div>
  );
};