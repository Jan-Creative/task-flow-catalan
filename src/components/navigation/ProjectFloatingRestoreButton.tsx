import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectNavigation } from "@/contexts/ProjectNavigationContext";
import { cn } from "@/lib/utils";

const ProjectFloatingRestoreButton = () => {
  const { isCollapsed, toggleCollapsed } = useProjectNavigation();

  if (!isCollapsed) return null;

  return (
    <div className="fixed left-4 top-6 z-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleCollapsed}
        className={cn(
          "h-10 w-10 p-0 rounded-xl transition-all duration-300",
          "bg-card/80 backdrop-blur-xl border border-border/50",
          "hover:bg-card/90 hover:shadow-lg hover:scale-105",
          "shadow-floating"
        )}
        title="Expandir sidebar del projecte (⌘\)"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProjectFloatingRestoreButton;