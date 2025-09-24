import { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useDeviceType } from '@/hooks/device/useDeviceType';
import { useIPadNavigation } from '@/contexts/IPadNavigationContext';
import LayoutContainer from './LayoutContainer';
import { cn } from '@/lib/utils';

interface AdaptiveLayoutProps {
  children: ReactNode;
  sidebarCollapsed?: boolean;
}

const AdaptiveLayout = ({ children, sidebarCollapsed = false }: AdaptiveLayoutProps) => {
  const { type } = useDeviceDetection();
  const { type: deviceType } = useDeviceType();
  const { navigationMode } = type === 'ipad' ? useIPadNavigation() : { navigationMode: 'sidebar' };

  // Use CSS Grid for stable layouts instead of dynamic margins
  const getGridClasses = () => {
    switch (type) {
      case 'iphone':
        return "grid-cols-1 grid-rows-1";
      
      case 'ipad':
        if (navigationMode === 'topbar') {
          return "grid-cols-1 grid-rows-[80px_1fr] pt-0";
        }
        return cn(
          "grid-cols-[auto_1fr] grid-rows-1",
          "transition-[grid-template-columns] duration-300 ease-out"
        );
      
      case 'desktop':
      default:
        if (deviceType === 'mac') {
          return cn(
            "grid-cols-[auto_1fr] grid-rows-1",
            "transition-[grid-template-columns] duration-300 ease-out"
          );
        }
        return "grid-cols-1 grid-rows-1";
    }
  };

  const getContentClasses = () => {
    const baseClasses = "relative w-full overflow-hidden";
    
    switch (type) {
      case 'iphone':
        return cn(baseClasses, "p-4");
      
      case 'ipad':
        return cn(baseClasses, "p-6");
      
      case 'desktop':
      default:
        if (deviceType === 'mac') {
          return cn(baseClasses, "p-6");
        }
        return cn(baseClasses, "p-4");
    }
  };

  return (
    <LayoutContainer sidebarCollapsed={sidebarCollapsed}>
      <div className={cn("grid w-full h-full", getGridClasses())}>
        <div className={getContentClasses()}>
          {children}
        </div>
      </div>
    </LayoutContainer>
  );
};

export default AdaptiveLayout;