import { useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import AdaptiveBottomNavigation from '@/components/AdaptiveBottomNavigation';
import IPadSidebar from './iPadSidebar';

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

  // iPad: Use sidebar navigation
  if (type === 'ipad') {
    return (
      <IPadSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onCreateTask={onCreateTask}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
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

export default AdaptiveNavigation;