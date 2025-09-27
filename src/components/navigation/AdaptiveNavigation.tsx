import { useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { useDeviceType } from '@/hooks/device/useDeviceType';
import SimpleBottomNavigation from '@/components/navigation/SimpleBottomNavigation';
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
  toggleSidebarCollapse?: () => void;
  // New 3-state sidebar props
  sidebarState?: 'expanded' | 'mini' | 'hidden';
  onSidebarStateChange?: (state: 'expanded' | 'mini' | 'hidden') => void;
}

const AdaptiveNavigation = ({ 
  activeTab, 
  onTabChange, 
  onCreateTask,
  sidebarCollapsed = false,
  toggleSidebarCollapse,
  sidebarState,
  onSidebarStateChange
}: AdaptiveNavigationProps) => {
  const { type } = useDeviceDetection();
  const { type: deviceType } = useDeviceType();

  // iPhone: Use simple bottom navigation
  if (type === 'iphone') {
    return (
      <SimpleBottomNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateTask={onCreateTask}
        isMobile={true}
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

  // Mac: Use Mac sidebar with synchronized state
  if (deviceType === 'mac') {
    return (
      <MacNavigationProvider 
        sidebarState={sidebarState}
        onSidebarStateChange={onSidebarStateChange}
      >
        <MacSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCreateTask={onCreateTask}
        />
        <MacFloatingRestoreButton />
      </MacNavigationProvider>
    );
  }

  // Desktop: Use simple bottom navigation as fallback
  return (
    <SimpleBottomNavigation
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreateTask={onCreateTask}
      isMobile={false}
    />
  );
};

// iPad Navigation Wrapper Component
interface IPadNavigationWrapperProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
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