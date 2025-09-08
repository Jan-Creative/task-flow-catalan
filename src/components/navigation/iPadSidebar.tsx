import { Calendar, Folder, Settings, Bell, Home, CheckSquare, Sunrise, ChevronRight, LayoutGrid, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { usePrepareTomorrowVisibility } from "@/hooks/usePrepareTomorrowVisibility";
import { useIPadNavigation } from "@/contexts/IPadNavigationContext";

interface iPadSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const iPadSidebar = ({ 
  activeTab, 
  onTabChange, 
  onCreateTask,
  isCollapsed = false,
  onToggleCollapse 
}: iPadSidebarProps) => {
  const { isVisible: showPrepareTomorrow } = usePrepareTomorrowVisibility();
  const { toggleNavigationMode } = useIPadNavigation();

  // Navigation items organized by sections
  const mainSections = [
    {
      title: "Principal",
      items: [
        { id: "inici", label: "Inici", icon: Home },
        { id: "avui", label: "Avui", icon: CheckSquare },
      ]
    },
    {
      title: "Organització",
      items: [
        { id: "carpetes", label: "Carpetes", icon: Folder },
        { id: "notes", label: "Notes", icon: FileText },
        { id: "calendar", label: "Calendari", icon: Calendar },
      ]
    },
    {
      title: "Gestió",
      items: [
        { id: "notificacions", label: "Notificacions", icon: Bell },
        ...(showPrepareTomorrow ? [{ id: "preparar-dema", label: "Preparar demà", icon: Sunrise }] : []),
        { id: "configuracio", label: "Configuració", icon: Settings },
      ]
    }
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full z-40 p-4 transition-all duration-300 ease-out",
      "flex items-start justify-start"
    )}>
      {/* Floating Card Container */}
      <div className={cn(
        "relative flex flex-col bg-card backdrop-blur-2xl rounded-3xl transition-all duration-300 ease-out",
        "shadow-floating hover:shadow-elevated",
        isCollapsed ? "w-16 h-auto py-4" : "w-72 h-[calc(100vh-2rem)]"
      )}>
        {/* Content */}
        <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="p-6">
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-foreground">
              Dades
            </h1>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {/* Navigation Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNavigationMode}
              className={cn(
                "h-8 w-8 p-0 hover:bg-accent/60",
                isCollapsed && "hidden"
              )}
              title="Canviar a barra superior"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            
            {/* Collapse Toggle */}
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0"
                title={isCollapsed ? "Expandir sidebar" : "Comprimir sidebar"}
              >
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  !isCollapsed && "rotate-180"
                )} />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Action Button */}
        <div className={cn("p-6", isCollapsed && "px-3")}>
          <Button
            onClick={onCreateTask}
            className={cn(
              "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200",
              isCollapsed ? "px-0" : "px-6 py-3"
            )}
            size={isCollapsed ? "sm" : "default"}
          >
            {isCollapsed ? "+" : "+ Nova Tasca"}
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto">
          {mainSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6">
              {!isCollapsed && (
                <div className="px-6 mb-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              
              <nav className={cn("space-y-1", isCollapsed ? "px-2" : "px-4")}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isSpecial = item.id === "preparar-dema";
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      onClick={() => onTabChange(item.id)}
                       className={cn(
                         "w-full justify-start h-11 px-3 rounded-xl transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]",
                         isActive 
                           ? "bg-primary/15 text-primary font-medium shadow-lg border border-primary/20" 
                           : "text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:shadow-md",
                         isSpecial && "bg-gradient-to-r from-orange-500/15 to-yellow-500/15 text-orange-400 hover:from-orange-500/25 hover:to-yellow-500/25 shadow-lg",
                         isCollapsed && "px-2 justify-center"
                       )}
                    >
                      <Icon className={cn(
                        "h-5 w-5 transition-colors duration-200",
                        isActive && "text-primary",
                        isSpecial && "text-orange-400",
                        !isCollapsed && "mr-3"
                      )} />
                      {!isCollapsed && (
                        <span className="truncate">
                          {item.label}
                        </span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                      )}
                    </Button>
                  );
                })}
              </nav>
              
              {sectionIndex < mainSections.length - 1 && !isCollapsed && (
                <div className="px-6 mt-6 mb-2">
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-6">
            <div className="text-xs text-muted-foreground text-center">
              Optimitzat per iPad
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default iPadSidebar;