import React from 'react';

interface NeonBackgroundProps {
  speed?: number;
  intensity?: number;
  hueShift?: number;
}

export const NeonBackground: React.FC<NeonBackgroundProps> = ({
  speed = 1.0,
  intensity = 0.5,
  hueShift = 0.0
}) => {
  const animationDuration = `${8 / speed}s`;
  const hueRotation = hueShift * 360;
  const glowIntensity = intensity * 20 + 10;
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Neon Grid Lines */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 98%, hsl(${320 + hueRotation}, 100%, 50%) 100%),
            linear-gradient(90deg, transparent 98%, hsl(${280 + hueRotation}, 100%, 50%) 100%)
          `,
          backgroundSize: `${50 * intensity + 25}px ${50 * intensity + 25}px`,
          opacity: 0.6,
          filter: `drop-shadow(0 0 ${glowIntensity}px hsl(${320 + hueRotation}, 100%, 50%)) drop-shadow(0 0 ${glowIntensity * 0.5}px hsl(${280 + hueRotation}, 100%, 50%))`,
          animation: `neon-flicker ${animationDuration} ease-in-out infinite`,
        }}
      />
      
      {/* Neon Circles */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, 
              hsl(${200 + hueRotation}, 100%, 50%) 0%, 
              transparent ${15 * intensity + 8}%
            ),
            radial-gradient(circle at 70% 60%, 
              hsl(${160 + hueRotation}, 100%, 50%) 0%, 
              transparent ${20 * intensity + 10}%
            ),
            radial-gradient(circle at 40% 80%, 
              hsl(${240 + hueRotation}, 100%, 50%) 0%, 
              transparent ${12 * intensity + 6}%
            )
          `,
          filter: `blur(${2 * intensity + 1}px) drop-shadow(0 0 ${glowIntensity}px currentColor)`,
          animation: `neon-pulse ${(parseFloat(animationDuration) * 1.5).toFixed(1)}s ease-in-out infinite alternate`,
          opacity: 0.4,
        }}
      />
      
      {/* Neon Bars */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(45deg, 
              transparent 48%, 
              hsl(${340 + hueRotation}, 100%, 50%) 49%, 
              hsl(${340 + hueRotation}, 100%, 50%) 51%, 
              transparent 52%
            ),
            linear-gradient(-45deg, 
              transparent 48%, 
              hsl(${180 + hueRotation}, 100%, 50%) 49%, 
              hsl(${180 + hueRotation}, 100%, 50%) 51%, 
              transparent 52%
            )
          `,
          backgroundSize: `${200 * intensity + 100}px ${200 * intensity + 100}px`,
          filter: `drop-shadow(0 0 ${glowIntensity * 0.8}px currentColor)`,
          animation: `neon-sweep ${(parseFloat(animationDuration) * 2).toFixed(1)}s linear infinite`,
          opacity: 0.3,
        }}
      />

      <style>{`
        @keyframes neon-flicker {
          0%, 100% {
            opacity: 0.6;
            filter: drop-shadow(0 0 ${glowIntensity.toFixed(1)}px hsl(${(320 + hueRotation).toFixed(0)}, 100%, 50%)) 
                    drop-shadow(0 0 ${(glowIntensity * 0.5).toFixed(1)}px hsl(${(280 + hueRotation).toFixed(0)}, 100%, 50%));
          }
          5%, 15%, 25%, 35%, 85%, 95% {
            opacity: 0.8;
            filter: drop-shadow(0 0 ${(glowIntensity * 1.5).toFixed(1)}px hsl(${(320 + hueRotation).toFixed(0)}, 100%, 50%)) 
                    drop-shadow(0 0 ${(glowIntensity * 0.8).toFixed(1)}px hsl(${(280 + hueRotation).toFixed(0)}, 100%, 50%));
          }
          10%, 20%, 30%, 90% {
            opacity: 0.4;
            filter: drop-shadow(0 0 ${(glowIntensity * 0.5).toFixed(1)}px hsl(${(320 + hueRotation).toFixed(0)}, 100%, 50%)) 
                    drop-shadow(0 0 ${(glowIntensity * 0.3).toFixed(1)}px hsl(${(280 + hueRotation).toFixed(0)}, 100%, 50%));
          }
        }
        
        @keyframes neon-pulse {
          0% {
            opacity: 0.4;
            transform: scale(1);
          }
          100% {
            opacity: ${(0.7 * intensity).toFixed(2)};
            transform: scale(${(1 + 0.2 * intensity).toFixed(2)});
          }
        }
        
        @keyframes neon-sweep {
          0% {
            transform: translateX(-100%) rotate(0deg);
          }
          100% {
            transform: translateX(100%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};