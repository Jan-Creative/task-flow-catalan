import { ReactNode } from 'react';
import AdaptiveBottomNavigation from '@/components/AdaptiveBottomNavigation';
import { useResponsiveLayout } from '@/hooks/device';

interface MobileLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

export function MobileLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  onCreateTask 
}: MobileLayoutProps) {
  const layout = useResponsiveLayout();

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Main content area - optimized for touch */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-4 space-y-4">
          {children}
        </div>
      </main>

      {/* Bottom navigation - iPhone style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t">
        <AdaptiveBottomNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCreateTask={onCreateTask}
        />
      </div>
    </div>
  );
}