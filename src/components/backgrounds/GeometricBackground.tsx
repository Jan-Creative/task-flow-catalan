import React from 'react';

interface GeometricBackgroundProps {
  speed?: number;
  intensity?: number;
  hueShift?: number;
}

export const GeometricBackground: React.FC<GeometricBackgroundProps> = ({
  speed = 1.0,
  intensity = 0.5,
  hueShift = 0.0
}) => {
  const animationDuration = `${20 / speed}s`;
  const hueRotation = hueShift * 360;
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            linear-gradient(45deg, transparent 40%, hsl(${280 + hueRotation}, 70%, 50%) 50%, transparent 60%),
            linear-gradient(-45deg, transparent 40%, hsl(${220 + hueRotation}, 70%, 50%) 50%, transparent 60%),
            linear-gradient(90deg, hsl(${180 + hueRotation}, 60%, 40%) 0%, transparent 50%, hsl(${300 + hueRotation}, 60%, 40%) 100%)
          `,
          backgroundSize: `${80 * intensity + 40}px ${80 * intensity + 40}px, ${60 * intensity + 30}px ${60 * intensity + 30}px, 100% 100%`,
          animation: `geometric-float ${animationDuration} ease-in-out infinite`,
          filter: `hue-rotate(${hueRotation}deg)`,
        }}
      />
      
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent ${20 * intensity + 10}px,
              hsl(${260 + hueRotation}, 80%, 60%) ${20 * intensity + 10}px,
              hsl(${260 + hueRotation}, 80%, 60%) ${22 * intensity + 12}px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent ${30 * intensity + 15}px,
              hsl(${340 + hueRotation}, 70%, 50%) ${30 * intensity + 15}px,
              hsl(${340 + hueRotation}, 70%, 50%) ${32 * intensity + 17}px
            )
          `,
          animation: `geometric-pulse ${(parseFloat(animationDuration) * 0.7).toFixed(1)}s ease-in-out infinite alternate`,
        }}
      />

      <style>{`
        @keyframes geometric-float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(-${(10 * intensity).toFixed(1)}px, -${(15 * intensity).toFixed(1)}px) rotate(${(2 * intensity).toFixed(1)}deg);
          }
          50% {
            transform: translate(${(15 * intensity).toFixed(1)}px, -${(10 * intensity).toFixed(1)}px) rotate(${(-1 * intensity).toFixed(1)}deg);
          }
          75% {
            transform: translate(-${(8 * intensity).toFixed(1)}px, ${(12 * intensity).toFixed(1)}px) rotate(${(1.5 * intensity).toFixed(1)}deg);
          }
        }
        
        @keyframes geometric-pulse {
          0% {
            opacity: 0.2;
            transform: scale(1);
          }
          100% {
            opacity: ${(0.4 * intensity).toFixed(2)};
            transform: scale(${(1 + 0.1 * intensity).toFixed(2)});
          }
        }
      `}</style>
    </div>
  );
};