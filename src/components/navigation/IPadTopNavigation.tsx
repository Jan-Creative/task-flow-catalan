import { Calendar, Folder, Bell, Home, CheckSquare, Sunrise, Plus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePrepareTomorrowVisibility } from "@/hooks/usePrepareTomorrowVisibility";
import { useIPadNavigation } from "@/contexts/IPadNavigationContext";

interface IPadTopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

const IPadTopNavigation = ({ 
  activeTab, 
  onTabChange, 
  onCreateTask
}: IPadTopNavigationProps) => {
  const { isVisible: showPrepareTomorrow } = usePrepareTomorrowVisibility();
  const { toggleNavigationMode } = useIPadNavigation();

  // Main navigation items for top bar
  const navigationItems = [
    { id: "inici", label: "Inici", icon: Home },
    { id: "avui", label: "Avui", icon: CheckSquare },
    { id: "carpetes", label: "Carpetes", icon: Folder },
    { id: "calendar", label: "Calendari", icon: Calendar },
    { id: "notificacions", label: "Notificacions", icon: Bell },
    ...(showPrepareTomorrow ? [{ id: "preparar-dema", label: "Preparar demà", icon: Sunrise }] : []),
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
      {/* Floating Card Container */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-card backdrop-blur-2xl border border-border/60 rounded-2xl shadow-floating">
          {/* Content */}
          <div className="flex items-center justify-between h-14 px-6">
        {/* Left side - Mode toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleNavigationMode}
            className="h-8 w-8 p-0 hover:bg-accent/60"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Dades
          </h1>
        </div>

        {/* Center - Navigation items */}
        <div className="flex items-center gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isSpecial = item.id === "preparar-dema";
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "h-9 px-3 rounded-lg transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]",
                  isActive 
                    ? "bg-primary/15 text-primary font-medium shadow-md border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                  isSpecial && "bg-gradient-to-r from-orange-500/15 to-yellow-500/15 text-orange-400 hover:from-orange-500/25 hover:to-yellow-500/25"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isActive && "text-primary",
                  isSpecial && "text-orange-400"
                )} />
                <span className="ml-2 text-sm hidden sm:inline">
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-2 w-1.5 h-1.5 bg-primary rounded-full" />
                )}
              </Button>
            );
          })}
        </div>

        {/* Right side - Create task button */}
        <div className="flex items-center">
          <Button
            onClick={onCreateTask}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-9 px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Tasca</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPadTopNavigation;