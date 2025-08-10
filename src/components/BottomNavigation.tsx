import { Calendar, Folder, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

const BottomNavigation = ({ activeTab, onTabChange, onCreateTask }: BottomNavigationProps) => {
  const tabs = [
    { id: "avui", label: "Avui", icon: Calendar },
    { id: "carpetes", label: "Carpetes", icon: Folder },
    { id: "configuracio", label: "Configuració", icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-card/80 backdrop-blur-glass border border-border rounded-3xl shadow-glass p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-1.5 px-2.5 rounded-2xl transition-smooth",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </Button>
              );
            })}
          </div>

          <Button
            onClick={onCreateTask}
            size="lg"
            className="bg-gradient-primary hover:scale-105 transition-bounce rounded-pill h-12 w-12 shadow-elevated hover:shadow-glow"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;