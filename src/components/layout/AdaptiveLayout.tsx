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

  // iPhone: Simple full-width layout
  if (type === 'iphone') {
    return (
      <LayoutContainer sidebarCollapsed={sidebarCollapsed}>
        <div className="w-full h-full">
          <div className="relative w-full p-4">
            {children}
          </div>
        </div>
      </LayoutContainer>
    );
  }

  // iPad: Responsive grid layout
  if (type === 'ipad') {
    if (navigationMode === 'topbar') {
      return (
        <LayoutContainer sidebarCollapsed={sidebarCollapsed}>
          <div className="grid grid-cols-1 grid-rows-[80px_1fr] w-full h-full">
            <div className="relative w-full overflow-y-auto p-6">
              {children}
            </div>
          </div>
        </LayoutContainer>
      );
    }
    
    return (
      <LayoutContainer sidebarCollapsed={sidebarCollapsed}>
        <div className="flex w-full h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </LayoutContainer>
    );
  }

  // Mac: Flexible sidebar + content layout
  if (deviceType === 'mac') {
    return (
      <LayoutContainer sidebarCollapsed={sidebarCollapsed}>
        <div className="flex w-full h-full">
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </LayoutContainer>
    );
  }

  // Desktop fallback: Simple layout
  return (
    <LayoutContainer sidebarCollapsed={sidebarCollapsed}>
      <div className="w-full h-full">
        <div className="relative w-full p-4">
          {children}
        </div>
      </div>
    </LayoutContainer>
  );
};

export default AdaptiveLayout;