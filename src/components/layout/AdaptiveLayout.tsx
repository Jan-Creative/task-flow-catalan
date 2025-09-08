import { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useDeviceType } from '@/hooks/device/useDeviceType';
import { useIPadNavigation } from '@/contexts/IPadNavigationContext';
import { cn } from '@/lib/utils';

interface AdaptiveLayoutProps {
  children: ReactNode;
  sidebarCollapsed?: boolean;
}

const AdaptiveLayout = ({ children, sidebarCollapsed = false }: AdaptiveLayoutProps) => {
  const { type } = useDeviceDetection();
  const { type: deviceType } = useDeviceType();
  const { navigationMode } = type === 'ipad' ? useIPadNavigation() : { navigationMode: 'sidebar' };

  // Calculate layout based on device type
  const getLayoutClasses = () => {
    switch (type) {
      case 'iphone':
        // iPhone: Full width with bottom padding for navigation
        return "w-full pb-24";
      
      case 'ipad':
        // iPad: Different layouts based on navigation mode
        if (navigationMode === 'topbar') {
          return "transition-all duration-300 ease-out min-h-screen pt-20";
        }
        // Sidebar mode: Floating sidebar layout with left margin for floating card
        return cn(
          "transition-all duration-300 ease-out min-h-screen",
          sidebarCollapsed ? "ml-24" : "ml-80"
        );
      
      case 'desktop':
      default:
        // Mac: Left margin for fixed sidebar (w-64 + p-2 = 264px + 12px separation)
        if (deviceType === 'mac') {
          return "transition-all duration-300 ease-out min-h-screen ml-[276px]";
        }
        // Other Desktop: Full width (top navigation in future)
        return "w-full";
    }
  };

  // Apply specific styles for iPad and Mac layouts
  const getContentClasses = () => {
    if (type === 'ipad') {
      if (navigationMode === 'topbar') {
        return "relative z-0 p-6 max-w-none";
      }
       return "relative z-0 p-6 max-w-none";
    }
    
    // Mac: Optimized padding for large screens
    if (deviceType === 'mac') {
      return "relative z-0 p-6 max-w-none";
    }
    
    return "relative z-0";
  };

  return (
    <div className={getLayoutClasses()}>
      <div className={getContentClasses()}>
        {children}
      </div>
    </div>
  );
};

export default AdaptiveLayout;