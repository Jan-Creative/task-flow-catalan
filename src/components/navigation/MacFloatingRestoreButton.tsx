import { useState, useEffect } from 'react';
import { ChevronRight, Sidebar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMacNavigation } from '@/contexts/MacNavigationContext';
import { cn } from '@/lib/utils';

const MacFloatingRestoreButton = () => {
  const { sidebarState, setSidebarState } = useMacNavigation();
  const [isVisible, setIsVisible] = useState(false);

  // Show button when sidebar is hidden
  useEffect(() => {
    if (sidebarState === 'hidden') {
      // Slight delay for smooth UX
      const timer = setTimeout(() => setIsVisible(true), 200);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [sidebarState]);

  // Don't render if not hidden
  if (sidebarState !== 'hidden') {
    return null;
  }

  const handleRestore = () => {
    setSidebarState('expanded');
  };

  return (
    <div
      className={cn(
        "fixed left-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
      )}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleRestore}
        className={cn(
          "h-12 w-12 p-0 rounded-full shadow-lg backdrop-blur-sm",
          "bg-card/90 hover:bg-card border-border/50 hover:border-border",
          "hover:shadow-xl hover:scale-105 active:scale-95",
          "transition-all duration-200"
        )}
        title="Mostrar sidebar (⌘B)"
      >
        <div className="flex items-center justify-center">
          <Sidebar className="h-4 w-4 text-muted-foreground" />
          <ChevronRight className="h-3 w-3 text-muted-foreground ml-0.5" />
        </div>
      </Button>
    </div>
  );
};

export default MacFloatingRestoreButton;