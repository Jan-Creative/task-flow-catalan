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
    <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-4">
      {/* Floating Glass Card Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-background/5 backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110 border border-white/5 rounded-2xl shadow-lg/10 transition-all duration-300">
          {/* Content */}
          <div className="flex items-center justify-between h-12 px-4">
        {/* Left side - Mode toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleNavigationMode}
            className="h-7 w-7 p-0 hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <h1 className="text-base font-semibold text-white/90">
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
                  "h-8 px-3 rounded-xl transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm",
                  isActive 
                    ? "bg-white/15 text-white font-medium shadow-lg/20 border border-white/20" 
                    : "text-white/70 hover:text-white hover:bg-white/10",
                  isSpecial && "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-300 hover:from-orange-500/30 hover:to-yellow-500/30"
                )}
              >
                <Icon className={cn(
                  "h-3.5 w-3.5 transition-colors duration-200",
                  isActive && "text-white",
                  isSpecial && "text-orange-300"
                )} />
                <span className="ml-2 text-xs hidden sm:inline">
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-2 w-1 h-1 bg-white rounded-full" />
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
            className="bg-white/15 hover:bg-white/25 text-white font-medium h-8 px-3 backdrop-blur-sm border border-white/20 transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline text-xs">Nova Tasca</span>
            <span className="sm:hidden text-xs">Nova</span>
          </Button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPadTopNavigation;