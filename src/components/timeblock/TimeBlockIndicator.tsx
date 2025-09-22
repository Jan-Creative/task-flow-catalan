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
          linear-gradient(0deg, ${borderColor}60 0%, transparent 6px),
          linear-gradient(90deg, ${borderColor}60 0%, transparent 6px),
          linear-gradient(180deg, ${borderColor}60 0%, transparent 6px),
          linear-gradient(270deg, ${borderColor}60 0%, transparent 6px)
        `,
        boxShadow: `
          inset 0 0 0 4px ${borderColor}70,
          inset 0 0 30px ${borderColor}40,
          0 0 60px ${borderColor}30,
          0 0 100px ${borderColor}15
        `,
        animation: 'timeblock-pulse 3s ease-in-out infinite, timeblock-breathe 2s ease-in-out infinite alternate',
      }}
    >
      {/* Enhanced corner accents */}
      <div 
        className="absolute top-0 left-0 w-16 h-16 rounded-br-3xl"
        style={{
          background: `radial-gradient(circle at top left, ${borderColor}80 0%, transparent 70%)`,
          animation: 'timeblock-corner-glow 2.5s ease-in-out infinite alternate, timeblock-shimmer 4s linear infinite',
        }}
      />
      <div 
        className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl"
        style={{
          background: `radial-gradient(circle at top right, ${borderColor}80 0%, transparent 70%)`,
          animation: 'timeblock-corner-glow 2.5s ease-in-out infinite alternate 0.4s, timeblock-shimmer 4s linear infinite 1s',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-16 h-16 rounded-tr-3xl"
        style={{
          background: `radial-gradient(circle at bottom left, ${borderColor}80 0%, transparent 70%)`,
          animation: 'timeblock-corner-glow 2.5s ease-in-out infinite alternate 0.8s, timeblock-shimmer 4s linear infinite 2s',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-3xl"
        style={{
          background: `radial-gradient(circle at bottom right, ${borderColor}80 0%, transparent 70%)`,
          animation: 'timeblock-corner-glow 2.5s ease-in-out infinite alternate 1.2s, timeblock-shimmer 4s linear infinite 3s',
        }}
      />

      {/* Wave effect for sides */}
      <div 
        className="absolute top-4 left-0 w-1 h-16"
        style={{
          background: `linear-gradient(to bottom, transparent, ${borderColor}60, transparent)`,
          animation: 'timeblock-wave 3s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute top-4 right-0 w-1 h-16"
        style={{
          background: `linear-gradient(to bottom, transparent, ${borderColor}60, transparent)`,
          animation: 'timeblock-wave 3s ease-in-out infinite 1s',
        }}
      />
      <div 
        className="absolute bottom-4 left-0 w-1 h-16"
        style={{
          background: `linear-gradient(to bottom, transparent, ${borderColor}60, transparent)`,
          animation: 'timeblock-wave 3s ease-in-out infinite 2s',
        }}
      />
      <div 
        className="absolute bottom-4 right-0 w-1 h-16"
        style={{
          background: `linear-gradient(to bottom, transparent, ${borderColor}60, transparent)`,
          animation: 'timeblock-wave 3s ease-in-out infinite 3s',
        }}
      />
    </div>
  );
};