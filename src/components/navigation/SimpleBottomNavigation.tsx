import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SmartTabSystem from "@/components/navigation/SmartTabSystem";
import { cn } from "@/lib/utils";

interface SimpleBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
  isMobile?: boolean;
}

const SimpleBottomNavigation = ({ 
  activeTab, 
  onTabChange, 
  onCreateTask, 
  isMobile = true 
}: SimpleBottomNavigationProps) => {
  const navigationContent = (
    <div className="simple-bottom-nav z-[30]">
      <div className="flex items-center justify-between">
        {/* Tabs container */}
        <div className="bg-background/80 backdrop-blur-md border border-border rounded-[20px] px-2 py-1.5 flex-1 mr-3 shadow-lg">
          <div className="flex items-center justify-center">
            <SmartTabSystem
              activeTab={activeTab}
              onTabChange={onTabChange}
              maxVisibleTabs={5}
              availableWidth={360}
              isMobile={isMobile}
            />
          </div>
        </div>
        
        {/* Floating Action Button */}
        <Button
          onClick={onCreateTask}
          size="lg"
          className={cn(
            "rounded-full h-14 w-14 p-0 shadow-lg",
            "bg-primary text-primary-foreground",
            "hover:scale-110 active:scale-95",
            "transition-all duration-200 ease-out"
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );

  return createPortal(navigationContent, document.body);
};

export default SimpleBottomNavigation;