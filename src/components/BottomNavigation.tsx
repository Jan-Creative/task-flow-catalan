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
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="flex items-center justify-between">
        {/* Main Navigation */}
        <div className="bg-gray-800/90 backdrop-blur-[var(--backdrop-blur-organic)] rounded-[28px] shadow-[var(--shadow-organic)] px-2 py-1.5 flex-1 mr-4">
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

        {/* Floating Action Button */}
        <Button
          onClick={onCreateTask}
          size="lg"
          className="bg-gradient-primary hover:scale-110 active:scale-95 transition-all duration-200 ease-out rounded-full h-14 w-14 shadow-[var(--shadow-floating)] hover:shadow-glow flex-shrink-0 p-0"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;