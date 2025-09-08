import { useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useDeviceType } from '@/hooks/device/useDeviceType';
import AdaptiveBottomNavigation from '@/components/AdaptiveBottomNavigation';
import IPadSidebar from './iPadSidebar';
import IPadTopNavigation from './IPadTopNavigation';
import MacSidebar from './MacSidebar';
import MacFloatingRestoreButton from './MacFloatingRestoreButton';
import { useIPadNavigation } from '@/contexts/IPadNavigationContext';
import { MacNavigationProvider } from '@/contexts/MacNavigationContext';

interface AdaptiveNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
  sidebarCollapsed?: boolean;
  onSidebarCollapseChange?: (collapsed: boolean) => void;
}

const AdaptiveNavigation = ({ 
  activeTab, 
  onTabChange, 
  onCreateTask,
  sidebarCollapsed = false,
  onSidebarCollapseChange
}: AdaptiveNavigationProps) => {
  const { type } = useDeviceDetection();
  const { type: deviceType } = useDeviceType();

  const toggleSidebarCollapse = () => {
    const newState = !sidebarCollapsed;
    onSidebarCollapseChange?.(newState);
  };

  // iPhone: Use bottom navigation (existing)
  if (type === 'iphone') {
    return (
      <AdaptiveBottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateTask={onCreateTask}
      />
    );
  }

  // iPad: Use adaptive navigation (sidebar or topbar)
  if (type === 'ipad') {
    return <IPadNavigationWrapper 
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreateTask={onCreateTask}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebarCollapse={toggleSidebarCollapse}
    />;
  }

  // Mac: Use Mac sidebar with context
  if (deviceType === 'mac') {
    return (
      <MacNavigationProvider>
        <MacSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCreateTask={onCreateTask}
        />
        <MacFloatingRestoreButton />
      </MacNavigationProvider>
    );
  }

  // Desktop: Use top navigation (placeholder for future implementation)
  // For now, use bottom navigation as fallback
  return (
    <AdaptiveBottomNavigation
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreateTask={onCreateTask}
    />
  );
};

// iPad Navigation Wrapper Component
interface IPadNavigationWrapperProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
}

const IPadNavigationWrapper = ({ 
  activeTab, 
  onTabChange, 
  onCreateTask,
  sidebarCollapsed,
  onToggleSidebarCollapse
}: IPadNavigationWrapperProps) => {
  const { navigationMode } = useIPadNavigation();

  if (navigationMode === 'topbar') {
    return (
      <IPadTopNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateTask={onCreateTask}
      />
    );
  }

  return (
    <IPadSidebar
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreateTask={onCreateTask}
      isCollapsed={sidebarCollapsed}
      onToggleCollapse={onToggleSidebarCollapse}
    />
  );
};

export default AdaptiveNavigation;