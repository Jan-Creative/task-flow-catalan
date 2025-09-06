import { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useIPadNavigation } from '@/contexts/IPadNavigationContext';
import { cn } from '@/lib/utils';

interface AdaptiveLayoutProps {
  children: ReactNode;
  sidebarCollapsed?: boolean;
}

const AdaptiveLayout = ({ children, sidebarCollapsed = false }: AdaptiveLayoutProps) => {
  const { type } = useDeviceDetection();
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
          return "transition-all duration-300 ease-out min-h-screen pt-24";
        }
        // Sidebar mode: Floating sidebar layout with left margin for floating card
        return cn(
          "transition-all duration-300 ease-out min-h-screen",
          sidebarCollapsed ? "ml-24" : "ml-80"
        );
      
      case 'desktop':
      default:
        // Desktop: Full width (top navigation in future)
        return "w-full";
    }
  };

  // Apply specific styles for iPad grid layout
  const getContentClasses = () => {
    if (type === 'ipad') {
      if (navigationMode === 'topbar') {
        return "p-6 max-w-none";
      }
      return "p-6 max-w-none";
    }
    return "";
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