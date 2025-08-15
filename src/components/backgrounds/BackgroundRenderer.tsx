import React from 'react';
import { useBackground } from '@/contexts/BackgroundContext';
import { DarkVeilBackground } from './DarkVeilBackground';
import { MeshGradientBackground } from './MeshGradientBackground';
import { ParticlesBackground } from './ParticlesBackground';

export const BackgroundRenderer: React.FC = () => {
  const { settings } = useBackground();

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