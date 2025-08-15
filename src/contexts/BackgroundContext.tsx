import React, { createContext, useContext, useState, useEffect } from 'react';

export type BackgroundType = 'dark-veil' | 'mesh-gradient' | 'particles' | 'none';

interface BackgroundSettings {
  type: BackgroundType;
  intensity: number;
  speed: number;
  hueShift: number;
}

interface BackgroundContextType {
  settings: BackgroundSettings;
  updateSettings: (settings: Partial<BackgroundSettings>) => void;
  setBackgroundType: (type: BackgroundType) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const DEFAULT_SETTINGS: BackgroundSettings = {
  type: 'dark-veil',
  intensity: 0.5,
  speed: 1.0,
  hueShift: 0.0,
};

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BackgroundSettings>(() => {
    const saved = localStorage.getItem('background-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('background-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<BackgroundSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setBackgroundType = (type: BackgroundType) => {
    updateSettings({ type });
  };

  return (
    <BackgroundContext.Provider value={{ settings, updateSettings, setBackgroundType }}>
      {children}
    </BackgroundContext.Provider>
  );
};

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};