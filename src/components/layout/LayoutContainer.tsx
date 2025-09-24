import { ReactNode } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useDeviceType } from '@/hooks/device/useDeviceType';
import { cn } from '@/lib/utils';

interface LayoutContainerProps {
  children: ReactNode;
  navigationHeight?: number;
  sidebarCollapsed?: boolean;
}

const LayoutContainer = ({ children, navigationHeight = 0, sidebarCollapsed = false }: LayoutContainerProps) => {
  const { type } = useDeviceDetection();
  const { type: deviceType } = useDeviceType();

  // Calculate safe areas and layout constraints
  const getLayoutClasses = () => {
    const baseClasses = "relative w-full min-h-dvh";
    
    switch (type) {
      case 'iphone':
        return cn(
          baseClasses,
          "pb-[calc(7rem+env(safe-area-inset-bottom))]", // Updated height for new layout
          "overscroll-contain",
          "contain-layout"
        );
      
      case 'ipad':
        return cn(
          baseClasses,
          "flex flex-col" // Flexible layout for iPad
        );
      
      case 'desktop':
      default:
        if (deviceType === 'mac') {
          return cn(
            baseClasses,
            "flex flex-col" // Flexible layout for Mac
          );
        }
        return baseClasses;
    }
  };

  const getContentClasses = () => {
    switch (type) {
      case 'iphone':
        return cn(
          "relative w-full",
          "contain-layout",
          "overflow-y-auto overflow-x-hidden",
          "overscroll-behavior-contain"
        );
      
      case 'ipad':
        return cn(
          "flex-1 w-full",
          "contain-layout contain-style"
        );
      
      case 'desktop':
      default:
        if (deviceType === 'mac') {
          return cn(
            "flex-1 w-full",
            "contain-layout"
          );
        }
        return cn(
          "relative w-full",
          "contain-layout"
        );
    }
  };

  return (
    <div className={getLayoutClasses()}>
      <div className={getContentClasses()}>
        {children}
      </div>
    </div>
  );
};

export default LayoutContainer;