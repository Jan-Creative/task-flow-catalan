import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Plus } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/device';

interface TabletLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'today', label: 'Avui', icon: '📅' },
  { id: 'folders', label: 'Carpetes', icon: '📁' },
  { id: 'calendar', label: 'Calendari', icon: '🗓️' },
  { id: 'notifications', label: 'Notificacions', icon: '🔔' },
  { id: 'prepare-tomorrow', label: 'Preparar demà', icon: '🌅' },
  { id: 'settings', label: 'Configuració', icon: '⚙️' },
];

export function TabletLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  onCreateTask 
}: TabletLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const layout = useResponsiveLayout();

  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div className={`bg-card border-r flex flex-col ${className}`}>
      {/* Sidebar header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">TaskFlow</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className="w-full justify-start gap-3"
            onClick={() => onTabChange(item.id)}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Create task button */}
      <div className="p-4 border-t">
        <Button
          onClick={onCreateTask}
          className="w-full gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Nova tasca
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar className="w-64 sticky top-0 h-screen" />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Top toolbar for iPad */}
        <div className="lg:hidden bg-background/95 backdrop-blur-sm border-b p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold capitalize">
              {navigationItems.find(item => item.id === activeTab)?.label || activeTab}
            </h1>
            <Button onClick={onCreateTask} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova tasca
            </Button>
          </div>
        </div>

        {/* Content area - optimized for tablet */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}