import { Calendar, Folder, Settings, Bell, Home, CheckSquare, Sunrise, Plus, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { usePrepareTomorrowVisibility } from "@/hooks/usePrepareTomorrowVisibility";
import { useMacKeyboardShortcuts, useMacSearchLogic } from "@/hooks/useMacNavigation";
import { useMacNavigation } from "@/contexts/MacNavigationContext";
import MacSearchInput from "./MacSearchInput";

interface MacSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

const MacSidebar = ({ 
  activeTab, 
  onTabChange, 
  onCreateTask
}: MacSidebarProps) => {
  const { isVisible: showPrepareTomorrow } = usePrepareTomorrowVisibility();
  const { isCollapsed, toggleCollapsed } = useMacNavigation();
  
  // Initialize Mac-specific hooks
  useMacKeyboardShortcuts(onCreateTask);
  useMacSearchLogic();

  // Navigation items organized by sections - similar to iPad but optimized for Mac
  const mainSections = [
    {
      title: "Principal",
      items: [
        { id: "inici", label: "Inici", icon: Home },
        { id: "avui", label: "Tasques", icon: CheckSquare },
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
      "fixed left-0 top-0 h-full z-40 p-2 transition-all duration-300 ease-out",
      "w-64",
      isCollapsed && "transform -translate-x-full"
    )}>
      {/* Main Sidebar Container */}
      <div className="h-full flex flex-col bg-card backdrop-blur-2xl rounded-2xl shadow-floating hover:shadow-elevated transition-shadow duration-300">
        
        {/* Header Section */}
        <div className="p-6 space-y-4">
          {/* App Title & Collapse Button */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">
              Dades
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className="h-8 w-8 p-0 hover:bg-accent rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Input */}
          <MacSearchInput />
        </div>

        <Separator className="mx-6" />

        {/* Quick Action Button */}
        <div className="p-6">
          <Button
            onClick={onCreateTask}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 rounded-xl group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Nova Tasca
            <kbd className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono bg-primary-foreground/20">
              ⌘N
            </kbd>
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3">
          {mainSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6">
              {/* Section Header */}
              <div className="px-3 mb-3">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
              
              {/* Section Items */}
              <nav className="space-y-1">
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
                        "w-full h-10 justify-start px-3 rounded-lg transition-all duration-200 group",
                        "hover:bg-accent/60 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                        isActive 
                          ? "bg-primary/15 text-primary font-medium shadow-md border border-primary/20" 
                          : "text-muted-foreground hover:text-foreground",
                        isSpecial && "bg-gradient-to-r from-orange-500/15 to-yellow-500/15 text-orange-600 hover:from-orange-500/25 hover:to-yellow-500/25 shadow-md"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 mr-3 transition-all duration-200",
                        isActive && "text-primary",
                        isSpecial && "text-orange-600",
                        "group-hover:scale-110"
                      )} />
                      <span className="truncate text-sm">
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full shadow-sm" />
                      )}
                    </Button>
                  );
                })}
              </nav>
              
              {/* Section Separator */}
              {sectionIndex < mainSections.length - 1 && (
                <div className="mt-6">
                  <Separator className="mx-3" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div>Optimitzat per Mac</div>
            <div className="flex items-center justify-center gap-4 text-[10px]">
              <span className="flex items-center gap-1">
                <kbd className="bg-muted px-1 rounded">⌘K</kbd> Cercar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-muted px-1 rounded">⌘N</kbd> Nova tasca
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-muted px-1 rounded">⌘\</kbd> Sidebar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacSidebar;