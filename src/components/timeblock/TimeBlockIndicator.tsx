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
          linear-gradient(0deg, ${borderColor}20 0%, transparent 8px),
          linear-gradient(90deg, ${borderColor}20 0%, transparent 8px),
          linear-gradient(180deg, ${borderColor}20 0%, transparent 8px),
          linear-gradient(270deg, ${borderColor}20 0%, transparent 8px)
        `,
        boxShadow: `
          inset 0 0 0 3px ${borderColor}90,
          inset 0 0 40px ${borderColor}60,
          0 0 80px ${borderColor}50,
          0 0 120px ${borderColor}30,
          0 0 160px ${borderColor}20
        `,
        animation: 'timeblock-siri-breathe 4s ease-in-out infinite alternate',
      }}
    >
      {/* Siri-style corner glows */}
      <div 
        className="absolute top-0 left-0 w-24 h-24 rounded-br-[3rem]"
        style={{
          background: `radial-gradient(circle at top left, ${borderColor}40 0%, transparent 80%)`,
          animation: 'timeblock-siri-glow 4s ease-in-out infinite alternate',
        }}
      />
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-bl-[3rem]"
        style={{
          background: `radial-gradient(circle at top right, ${borderColor}40 0%, transparent 80%)`,
          animation: 'timeblock-siri-glow 4s ease-in-out infinite alternate 1s',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-[3rem]"
        style={{
          background: `radial-gradient(circle at bottom left, ${borderColor}40 0%, transparent 80%)`,
          animation: 'timeblock-siri-glow 4s ease-in-out infinite alternate 2s',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-[3rem]"
        style={{
          background: `radial-gradient(circle at bottom right, ${borderColor}40 0%, transparent 80%)`,
          animation: 'timeblock-siri-glow 4s ease-in-out infinite alternate 3s',
        }}
      />

      {/* Ambient glow effect */}
      <div 
        className="absolute inset-2 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${borderColor}10 70%, transparent 100%)`,
          animation: 'timeblock-ambient-glow 6s ease-in-out infinite alternate',
        }}
      />
    </div>
  );
};