import React from 'react';

interface WaveBackgroundProps {
  speed?: number;
  intensity?: number;
  hueShift?: number;
}

export const WaveBackground: React.FC<WaveBackgroundProps> = ({
  speed = 1.0,
  intensity = 0.5,
  hueShift = 0.0
}) => {
  const animationDuration = `${15 / speed}s`;
  const hueRotation = hueShift * 360;
  const waveHeight = 60 * intensity + 30;
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {/* Wave Layer 1 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 100%, 
              hsl(${240 + hueRotation}, 70%, 40%) 0%, 
              hsl(${260 + hueRotation}, 60%, 30%) 30%, 
              transparent 70%
            )
          `,
          transform: `translateY(${40 * intensity}%)`,
          animation: `wave-drift ${animationDuration} ease-in-out infinite`,
          opacity: 0.6,
        }}
      />
      
      {/* Wave Layer 2 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              transparent 0%, 
              hsl(${200 + hueRotation}, 80%, 50%) 40%, 
              hsl(${220 + hueRotation}, 70%, 40%) 70%, 
              transparent 100%
            )
          `,
          clipPath: `polygon(
            0% ${100 - waveHeight}%, 
            ${25 * intensity + 10}% ${95 - waveHeight}%, 
            ${50 * intensity + 25}% ${105 - waveHeight}%, 
            ${75 * intensity + 40}% ${90 - waveHeight}%, 
            100% ${100 - waveHeight}%, 
            100% 100%, 
            0% 100%
          )`,
          animation: `wave-flow ${(parseFloat(animationDuration) * 1.2).toFixed(1)}s ease-in-out infinite`,
          opacity: 0.4,
        }}
      />
      
      {/* Wave Layer 3 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            conic-gradient(from 0deg at 50% 120%, 
              hsl(${180 + hueRotation}, 60%, 50%) 0deg, 
              hsl(${280 + hueRotation}, 70%, 40%) 120deg, 
              hsl(${160 + hueRotation}, 80%, 45%) 240deg, 
              hsl(${180 + hueRotation}, 60%, 50%) 360deg
            )
          `,
          clipPath: `ellipse(${120 * intensity + 60}% ${80 * intensity + 40}% at 50% 100%)`,
          animation: `wave-rotate ${(parseFloat(animationDuration) * 2).toFixed(1)}s linear infinite`,
          opacity: 0.3,
        }}
      />

      <style>{`
        @keyframes wave-drift {
          0%, 100% {
            transform: translateY(${(40 * intensity).toFixed(1)}%) translateX(0) scale(1);
          }
          50% {
            transform: translateY(${(20 * intensity).toFixed(1)}%) translateX(${(10 * intensity).toFixed(1)}px) scale(${(1 + 0.1 * intensity).toFixed(2)});
          }
        }
        
        @keyframes wave-flow {
          0%, 100% {
            clip-path: polygon(
              0% ${(100 - waveHeight).toFixed(1)}%, 
              ${(25 * intensity + 10).toFixed(1)}% ${(95 - waveHeight).toFixed(1)}%, 
              ${(50 * intensity + 25).toFixed(1)}% ${(105 - waveHeight).toFixed(1)}%, 
              ${(75 * intensity + 40).toFixed(1)}% ${(90 - waveHeight).toFixed(1)}%, 
              100% ${(100 - waveHeight).toFixed(1)}%, 
              100% 100%, 
              0% 100%
            );
          }
          50% {
            clip-path: polygon(
              0% ${(95 - waveHeight).toFixed(1)}%, 
              ${(30 * intensity + 15).toFixed(1)}% ${(105 - waveHeight).toFixed(1)}%, 
              ${(60 * intensity + 30).toFixed(1)}% ${(85 - waveHeight).toFixed(1)}%, 
              ${(80 * intensity + 45).toFixed(1)}% ${(100 - waveHeight).toFixed(1)}%, 
              100% ${(95 - waveHeight).toFixed(1)}%, 
              100% 100%, 
              0% 100%
            );
          }
        }
        
        @keyframes wave-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};