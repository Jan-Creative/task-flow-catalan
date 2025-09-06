import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NavigationMode = 'sidebar' | 'topbar';

interface IPadNavigationContextType {
  navigationMode: NavigationMode;
  setNavigationMode: (mode: NavigationMode) => void;
  toggleNavigationMode: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const IPadNavigationContext = createContext<IPadNavigationContextType | null>(null);

interface IPadNavigationProviderProps {
  children: ReactNode;
}

export const IPadNavigationProvider = ({ children }: IPadNavigationProviderProps) => {
  const [navigationMode, setNavigationModeState] = useState<NavigationMode>(() => {
    const stored = localStorage.getItem('ipad-navigation-mode');
    return (stored as NavigationMode) || 'sidebar';
  });
  
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem('ipad-sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  });

  // Persist navigation mode
  useEffect(() => {
    localStorage.setItem('ipad-navigation-mode', navigationMode);
  }, [navigationMode]);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('ipad-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const setNavigationMode = (mode: NavigationMode) => {
    setNavigationModeState(mode);
  };

  const toggleNavigationMode = () => {
    setNavigationModeState(prev => prev === 'sidebar' ? 'topbar' : 'sidebar');
  };

  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
  };

  const value = {
    navigationMode,
    setNavigationMode,
    toggleNavigationMode,
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed
  };

  return (
    <IPadNavigationContext.Provider value={value}>
      {children}
    </IPadNavigationContext.Provider>
  );
};

export const useIPadNavigation = () => {
  const context = useContext(IPadNavigationContext);
  if (!context) {
    throw new Error('useIPadNavigation must be used within IPadNavigationProvider');
  }
  return context;
};