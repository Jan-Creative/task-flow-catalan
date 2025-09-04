import { ReactNode } from 'react';
import { useDeviceType, useResponsiveLayout } from '@/hooks/device';
import { MobileLayout } from './MobileLayout';
import { TabletLayout } from './TabletLayout';
import { DesktopLayout } from './DesktopLayout';

interface AdaptiveLayoutWrapperProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

export function AdaptiveLayoutWrapper({
  children,
  activeTab,
  onTabChange,
  onCreateTask
}: AdaptiveLayoutWrapperProps) {
  const device = useDeviceType();
  const layout = useResponsiveLayout();

  // Force specific layouts based on device type
  if (device.type === 'iphone' || layout.layout === 'mobile') {
    return (
      <MobileLayout
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateTask={onCreateTask}
      >
        {children}
      </MobileLayout>
    );
  }

  if (device.type === 'ipad' || layout.layout === 'tablet') {
    return (
      <TabletLayout
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateTask={onCreateTask}
      >
        {children}
      </TabletLayout>
    );
  }

  // Mac, Windows, or large screens default to desktop layout
  return (
    <DesktopLayout
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreateTask={onCreateTask}
    >
      {children}
    </DesktopLayout>
  );
}