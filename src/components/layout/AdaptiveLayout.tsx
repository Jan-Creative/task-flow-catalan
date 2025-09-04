import { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cn } from '@/lib/utils';

interface AdaptiveLayoutProps {
  children: ReactNode;
  sidebarCollapsed?: boolean;
}

const AdaptiveLayout = ({ children, sidebarCollapsed = false }: AdaptiveLayoutProps) => {
  const { type } = useDeviceDetection();

  // Calculate layout based on device type
  const getLayoutClasses = () => {
    switch (type) {
      case 'iphone':
        // iPhone: Full width with bottom padding for navigation
        return "w-full pb-24";
      
      case 'ipad':
        // iPad: Sidebar layout with left margin
        return cn(
          "transition-all duration-300 ease-out min-h-screen",
          sidebarCollapsed ? "ml-20" : "ml-80"
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