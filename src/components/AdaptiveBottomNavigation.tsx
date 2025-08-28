import { Calendar, Folder, Settings, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import CircularActionMenuWithArc from "./CircularActionMenuWithArc";

interface AdaptiveBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

const AdaptiveBottomNavigation = ({ activeTab, onTabChange, onCreateTask }: AdaptiveBottomNavigationProps) => {
  const [isCompacted, setIsCompacted] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const isMobile = useIsMobile();

  const tabs = [
    { id: "avui", label: "Avui", icon: Calendar },
    { id: "carpetes", label: "Carpetes", icon: Folder },
    { id: "calendar", label: "Calendari", icon: Calendar },
    { id: "notificacions", label: "Notificacions", icon: Bell },
    { id: "configuracio", label: "Configuració", icon: Settings },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  // Auto-compact logic for calendar page
  useEffect(() => {
    if (activeTab === "calendar") {
      const timer = setTimeout(() => {
        setShowTransition(true);
        setTimeout(() => setIsCompacted(true), 100);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsCompacted(false);
      setShowTransition(false);
    }
  }, [activeTab]);

  const handleCompactedClick = () => {
    setIsCompacted(false);
    setShowTransition(false);
  };

  if (isCompacted && activeTab === "calendar") {
    return (
      <div className="fixed bottom-6 left-4 z-50">
        <Button
          onClick={handleCompactedClick}
          size="lg"
          className={cn(
            "bg-gray-800/90 backdrop-blur-[var(--backdrop-blur-organic)] hover:scale-110 active:scale-95 transition-all duration-300 ease-out rounded-full h-14 w-14 shadow-[var(--shadow-floating)] flex-shrink-0 p-0",
            showTransition && "animate-scale-in"
          )}
        >
          {activeTabData && <activeTabData.icon className="h-5 w-5 text-muted-foreground" />}
          <ChevronRight className="h-3 w-3 ml-1 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div className={cn(
        "flex items-center justify-between transition-all duration-500 ease-out",
        showTransition && "animate-fade-out"
      )}>
        {/* Main Navigation */}
        <div className="bg-gray-800/90 backdrop-blur-[var(--backdrop-blur-organic)] rounded-[28px] shadow-[var(--shadow-organic)] px-2 py-1.5 flex-1 mr-4">
          <div className={cn(
            "flex items-center justify-between mx-auto",
            isMobile ? "max-w-full overflow-x-auto scrollbar-hide" : "max-w-lg"
          )}>
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 h-auto transition-all duration-200 ease-out rounded-[20px] flex-shrink-0",
                      isMobile ? "py-1.5 px-2 min-w-[50px]" : "py-2 px-3 min-w-[60px]",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102"
                    )}
                  >
                    <Icon className={cn("shrink-0", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                    <span className={cn(
                      "font-medium leading-tight whitespace-nowrap",
                      isMobile ? "text-[9px]" : "text-[10px]"
                    )}>
                      {tab.label}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Circular Action Menu */}
        <CircularActionMenuWithArc
          onCreateTask={onCreateTask}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default AdaptiveBottomNavigation;