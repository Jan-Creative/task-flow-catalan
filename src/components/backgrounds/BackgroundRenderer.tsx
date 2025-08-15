import React from 'react';
import { useBackground } from '@/contexts/BackgroundContext';
import { DarkVeilBackground } from './DarkVeilBackground';
import { MeshGradientBackground } from './MeshGradientBackground';
import { ParticlesBackground } from './ParticlesBackground';
import { GeometricBackground } from './GeometricBackground';
import { WaveBackground } from './WaveBackground';
import { NeonBackground } from './NeonBackground';
import { MatrixBackground } from './MatrixBackground';

export const BackgroundRenderer: React.FC = () => {
  const { settings } = useBackground();
  console.log('BackgroundRenderer - settings:', settings);

  const renderBackground = () => {
    switch (settings.type) {
      case 'dark-veil':
        return (
          <DarkVeilBackground
            speed={settings.speed}
            hueShift={settings.hueShift}
            noiseIntensity={settings.intensity}
            scanlineIntensity={settings.intensity * 0.3}
            warpAmount={settings.intensity * 0.2}
          />
        );
      case 'mesh-gradient':
        return (
          <MeshGradientBackground
            speed={settings.speed}
            intensity={settings.intensity}
            hueShift={settings.hueShift}
          />
        );
      case 'particles':
        return (
          <ParticlesBackground
            speed={settings.speed}
            intensity={settings.intensity}
            hueShift={settings.hueShift}
          />
        );
      case 'geometric':
        return (
          <GeometricBackground
            speed={settings.speed}
            intensity={settings.intensity}
            hueShift={settings.hueShift}
          />
        );
      case 'wave':
        return (
          <WaveBackground
            speed={settings.speed}
            intensity={settings.intensity}
            hueShift={settings.hueShift}
          />
        );
      case 'neon':
        return (
          <NeonBackground
            speed={settings.speed}
            intensity={settings.intensity}
            hueShift={settings.hueShift}
          />
        );
      case 'matrix':
        return (
          <MatrixBackground
            speed={settings.speed}
            intensity={settings.intensity}
            hueShift={settings.hueShift}
          />
        );
      case 'none':
        return null;
      default:
        return null;
    }
  };

  if (settings.type === 'none') {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" key={settings.type}>
      {renderBackground()}
    </div>
  );
};