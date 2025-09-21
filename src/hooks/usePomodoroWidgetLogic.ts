import { useLocation } from 'react-router-dom';
import { useDeviceType } from '@/hooks/device/useDeviceType';
import { useSidebar } from '@/components/ui/sidebar';
import { usePomodoroContext } from '@/contexts/PomodoroContext';

export interface PomodoroWidgetVisibility {
  showToolbarIndicator: boolean;
  showSidebarWidget: boolean;
  showFloatingWidget: boolean;
}

/**
 * Hook que coordina la visibilitat dels widgets de Pomodoro
 * segons la pàgina actual, tipus de dispositiu i estat de la sidebar
 */
export const usePomodoroWidgetLogic = (): PomodoroWidgetVisibility => {
  const location = useLocation();
  const { type: deviceType } = useDeviceType();
  const { hasActiveTimer } = usePomodoroContext();
  
  // Intentar obtenir l'estat de la sidebar si està disponible
  let sidebarState = null;
  try {
    sidebarState = useSidebar();
  } catch {
    // No estem en un context de sidebar
  }
  
  const currentPath = location.pathname;
  const isHomePage = currentPath === '/';
  const isMac = deviceType === 'mac';
  const isDesktop = deviceType === 'mac' || deviceType === 'windows';
  const isMobile = deviceType === 'iphone' || deviceType === 'android';
  
  // Sidebar està oberta/visible
  const sidebarOpen = sidebarState?.open ?? false;
  const sidebarCollapsed = sidebarState?.collapsed ?? false;
  const hasSidebar = sidebarState !== null;
  
  // NOTA: Eliminem la restricció anterior que impedia mostrar widgets sense timer actiu
  // Ara els widgets es mostren segons la lògica de coordinació, independentment de si hi ha timer actiu
  
  // REGLES DE VISIBILITAT:
  
  // 1. Indicador de la barra d'eines: només a la pàgina d'inici
  const showToolbarIndicator = isHomePage;
  
  // 2. Widget de sidebar: 
  //    - NO a la pàgina d'inici (prioritat del toolbar)
  //    - Només en dispositius amb sidebar disponible
  //    - Sidebar ha d'estar oberta i no col·lapsada
  const showSidebarWidget = !isHomePage && 
                            hasSidebar && 
                            sidebarOpen && 
                            !sidebarCollapsed && 
                            isDesktop;
  
  // 3. Widget flotant: fallback per a casos específics
  //    - NO a la pàgina d'inici (prioritat del toolbar)
  //    - Dispositius mòbils sempre usen el flotant
  //    - Desktop només quan no hi ha sidebar o està col·lapsada
  const showFloatingWidget = !isHomePage && 
                             (isMobile || 
                              !hasSidebar || 
                              !sidebarOpen || 
                              sidebarCollapsed);
  
  return {
    showToolbarIndicator,
    showSidebarWidget,
    showFloatingWidget
  };
};