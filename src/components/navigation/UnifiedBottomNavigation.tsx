import { Calendar, Folder, Settings, Plus, Bell, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CircularActionMenuWithArc from "@/components/CircularActionMenuWithArc";
import CircularActionMenu from "@/components/CircularActionMenu";
import { useCircularMenuMode } from "@/hooks/useCircularMenuMode";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface UnifiedBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

const UnifiedBottomNavigation = ({ activeTab, onTabChange, onCreateTask }: UnifiedBottomNavigationProps) => {
  const { mode } = useCircularMenuMode();
  const isMobile = useIsMobile();

  const tabs = [
    { id: "inici", label: "Inici", icon: Home },
    { id: "carpetes", label: "Carpetes", icon: Folder },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "calendar", label: "Calendari", icon: Calendar },
    { id: "notificacions", label: "Notificacions", icon: Bell },
    { id: "configuracio", label: "Configuració", icon: Settings },
  ];

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "pb-[env(safe-area-inset-bottom)] px-4",
        "overscroll-contain"
      )}
    >
      {/* Reserved space to prevent content overlap */}
      <div className="h-6" />
      
      <div className="flex items-center justify-between gap-4">
        {/* Main Navigation with backdrop blur */}
        <div className={cn(
          "bg-card/90 backdrop-blur-[var(--backdrop-blur-navigation)]",
          "backdrop-saturate-[var(--backdrop-saturate-navigation)]",
          "backdrop-brightness-[var(--backdrop-brightness-navigation)]",
          "rounded-[28px] shadow-[var(--shadow-floating)]",
          "px-2 py-1.5 flex-1 mr-4",
          "border border-white/[0.08]" // Subtle glass border
        )}>
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 h-auto py-2 px-3 rounded-[20px] transition-all duration-200 ease-out min-w-[60px]",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Circular Action Menu */}
        <div className="flex-shrink-0">
          {mode === 'arc' ? (
            <CircularActionMenuWithArc onCreateTask={onCreateTask} isMobile={isMobile} />
          ) : (
            <CircularActionMenu onCreateTask={onCreateTask} isMobile={isMobile} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedBottomNavigation;