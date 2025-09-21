import { Plus, ChevronLeft, BarChart3, FileText, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useProjectKeyboardShortcuts, useProjectSearchLogic } from "@/hooks/useProjectNavigation";
import { useProjectNavigation } from "@/contexts/ProjectNavigationContext";
import ProjectSearchInput from "./ProjectSearchInput";
import { SidebarPomodoroWidget } from "@/components/pomodoro/SidebarPomodoroWidget";

interface ProjectSidebarProps {
  projectId: string;
  projectName: string;
  projectIcon?: string;
  activePage: string;
  onPageChange: (page: string) => void;
  onCreateTask: () => void;
}

const ProjectSidebar = ({ 
  projectId,
  projectName,
  projectIcon,
  activePage, 
  onPageChange, 
  onCreateTask
}: ProjectSidebarProps) => {
  const { isCollapsed, toggleCollapsed } = useProjectNavigation();
  
  // Initialize project-specific hooks
  useProjectKeyboardShortcuts(onCreateTask);
  useProjectSearchLogic();

  // Project navigation sections - expandable for future features
  const projectSections = [
    {
      title: "Visió General",
      items: [
        { id: "dashboard", label: "Dashboard", icon: BarChart3 },
      ]
    },
    {
      title: "Gestió", 
      items: [
        // Future sections will be added here
        // { id: "documents", label: "Documents", icon: FileText },
        // { id: "calendar", label: "Planificació", icon: Calendar },
        // { id: "settings", label: "Configuració", icon: Settings },
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
          {/* Project Title & Collapse Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {projectIcon && (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">{projectIcon}</span>
                </div>
              )}
              <h1 className="text-xl font-semibold text-foreground tracking-tight truncate">
                {projectName}
              </h1>
            </div>
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
          <ProjectSearchInput />
        </div>

        <Separator className="mx-6" />

        {/* Quick Action Button */}
        <div className="p-6">
          <Button
            onClick={onCreateTask}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 rounded-xl group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Nova Tasca del Projecte
            <kbd className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-mono bg-primary-foreground/20">
              ⌘N
            </kbd>
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3">
          {projectSections.map((section, sectionIndex) => (
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
                  const isActive = activePage === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      onClick={() => onPageChange(item.id)}
                      className={cn(
                        "w-full h-10 justify-start px-3 rounded-lg transition-all duration-200 group",
                        "hover:bg-accent/60 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                        isActive 
                          ? "bg-primary/15 text-primary font-medium shadow-md border border-primary/20" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 mr-3 transition-all duration-200",
                        isActive && "text-primary",
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
              {sectionIndex < projectSections.length - 1 && section.items.length > 0 && (
                <div className="mt-6">
                  <Separator className="mx-3" />
                </div>
              )}
            </div>
          ))}

          {/* Pomodoro Widget - After sections */}
          <div className="px-3 mb-6">
            <SidebarPomodoroWidget />
          </div>

          {/* Empty State Message */}
          <div className="px-3 py-8 text-center">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>🚀 Projecte en desenvolupament</p>
              <p className="text-xs">Més funcions aviat...</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <div>Projecte Business Plan</div>
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

export default ProjectSidebar;