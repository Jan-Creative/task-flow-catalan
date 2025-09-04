import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Calendar, 
  FolderOpen, 
  CalendarDays, 
  Bell, 
  Sunrise, 
  Settings,
  Plus,
  Command
} from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/device';
import { useKeyboardShortcuts } from '@/hooks';

interface DesktopLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, shortcut: '⌘1' },
  { id: 'today', label: 'Avui', icon: Calendar, shortcut: '⌘2' },
  { id: 'folders', label: 'Carpetes', icon: FolderOpen, shortcut: '⌘3' },
  { id: 'calendar', label: 'Calendari', icon: CalendarDays, shortcut: '⌘4' },
  { id: 'notifications', label: 'Notificacions', icon: Bell, shortcut: '⌘5' },
  { id: 'prepare-tomorrow', label: 'Preparar demà', icon: Sunrise, shortcut: '⌘6' },
  { id: 'settings', label: 'Configuració', icon: Settings, shortcut: '⌘7' },
];

export function DesktopLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  onCreateTask 
}: DesktopLayoutProps) {
  const layout = useResponsiveLayout();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Register keyboard shortcuts for Mac
  useKeyboardShortcuts({
    shortcuts: [
      { id: 'nav-dashboard', name: 'Dashboard', description: 'Go to Dashboard', keys: ['meta', '1'], action: () => onTabChange('dashboard'), category: 'navigation' },
      { id: 'nav-today', name: 'Today', description: 'Go to Today', keys: ['meta', '2'], action: () => onTabChange('today'), category: 'navigation' },
      { id: 'nav-folders', name: 'Folders', description: 'Go to Folders', keys: ['meta', '3'], action: () => onTabChange('folders'), category: 'navigation' },
      { id: 'nav-calendar', name: 'Calendar', description: 'Go to Calendar', keys: ['meta', '4'], action: () => onTabChange('calendar'), category: 'navigation' },
      { id: 'nav-notifications', name: 'Notifications', description: 'Go to Notifications', keys: ['meta', '5'], action: () => onTabChange('notifications'), category: 'navigation' },
      { id: 'nav-prepare', name: 'Prepare Tomorrow', description: 'Go to Prepare Tomorrow', keys: ['meta', '6'], action: () => onTabChange('prepare-tomorrow'), category: 'navigation' },
      { id: 'nav-settings', name: 'Settings', description: 'Go to Settings', keys: ['meta', '7'], action: () => onTabChange('settings'), category: 'navigation' },
      { id: 'create-task', name: 'Create Task', description: 'Create new task', keys: ['meta', 'n'], action: onCreateTask, category: 'actions' },
    ]
  });

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Top navigation bar - Mac style */}
      <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">TaskFlow</h1>
              
              {/* Navigation tabs */}
              <Tabs value={activeTab} onValueChange={onTabChange} className="ml-8">
                <TabsList className="grid grid-cols-7 w-fit">
                  {navigationItems.map((item) => (
                    <TabsTrigger 
                      key={item.id} 
                      value={item.id}
                      className="flex items-center gap-2 px-4"
                      title={`${item.label} (${item.shortcut})`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="gap-2"
              >
                <Command className="h-4 w-4" />
                <span className="hidden lg:inline">Dreceres</span>
              </Button>
              
              <Button
                onClick={onCreateTask}
                className="gap-2"
                title="Nova tasca (⌘N)"
              >
                <Plus className="h-5 w-5" />
                Nova tasca
              </Button>
            </div>
          </div>

          {/* Keyboard shortcuts overlay */}
          {showShortcuts && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium mb-3">Dreceres de teclat</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                {navigationItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.label}</span>
                    <kbd className="bg-background px-2 py-1 rounded text-xs">
                      {item.shortcut}
                    </kbd>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Nova tasca</span>
                  <kbd className="bg-background px-2 py-1 rounded text-xs">⌘N</kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content - optimized for desktop */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-none">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}