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
        "fixed bottom-0 left-0 right-0 z-50 fixed-zone",
        "pb-[env(safe-area-inset-bottom)]",
        "overscroll-contain"
      )}
    >
      {/* Container with maximum stability */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 max-w-md mx-auto">
          {/* Main Navigation - Fixed width container */}
          <div className={cn(
            "bg-card/95 backdrop-blur-[var(--backdrop-blur-navigation)]",
            "backdrop-saturate-[var(--backdrop-saturate-navigation)]",
            "backdrop-brightness-[var(--backdrop-brightness-navigation)]",
            "rounded-[24px] shadow-[var(--shadow-floating)]",
            "px-1.5 py-1.5 min-h-[60px]",
            "border border-white/[0.08]"
          )}>
            <div className="grid grid-cols-6 gap-1 items-center justify-items-center">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 h-auto py-1.5 px-2 rounded-[16px] transition-all duration-200 ease-out w-full",
                      activeTab === tab.id
                        ? "bg-primary/15 text-primary scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-medium leading-tight">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Circular Action Menu - Fixed positioning */}
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16">
            {mode === 'arc' ? (
              <CircularActionMenuWithArc onCreateTask={onCreateTask} isMobile={isMobile} />
            ) : (
              <CircularActionMenu onCreateTask={onCreateTask} isMobile={isMobile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedBottomNavigation;