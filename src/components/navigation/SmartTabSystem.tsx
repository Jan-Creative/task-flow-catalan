import { Calendar, Folder, Settings, Bell, Home, CheckSquare, Sunrise, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon: any;
  priority: number; // 1 = highest priority, 5 = lowest
  category?: 'primary' | 'secondary';
}

interface SmartTabSystemProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  maxVisibleTabs: number;
  availableWidth: number;
  showPrepareTomorrow?: boolean;
  isMobile?: boolean;
}

const SmartTabSystem = ({ 
  activeTab, 
  onTabChange, 
  maxVisibleTabs, 
  availableWidth,
  showPrepareTomorrow = false,
  isMobile = false
}: SmartTabSystemProps) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Define all available tabs with priorities
  const allTabs: TabItem[] = [
    { id: "inici", label: "Inici", icon: Home, priority: 1, category: 'primary' },
    { id: "avui", label: "Tasques", icon: CheckSquare, priority: 2, category: 'primary' },
    { id: "carpetes", label: "Carpetes", icon: Folder, priority: 3, category: 'primary' },
    { id: "calendar", label: "Calendari", icon: Calendar, priority: 4, category: 'primary' },
    ...(showPrepareTomorrow ? [{ id: "preparar-dema", label: "Preparar demà", icon: Sunrise, priority: 2, category: 'primary' as const }] : []),
    { id: "notificacions", label: "Notificacions", icon: Bell, priority: 5, category: 'secondary' as const },
    { id: "configuracio", label: "Configuració", icon: Settings, priority: 6, category: 'secondary' as const },
  ];

  // Sort tabs by priority and ensure active tab is always visible
  const sortedTabs = [...allTabs].sort((a, b) => {
    // Always prioritize the active tab
    if (a.id === activeTab) return -1;
    if (b.id === activeTab) return 1;
    return a.priority - b.priority;
  });

  // Split tabs into visible and overflow
  const visibleTabs = sortedTabs.slice(0, Math.max(1, maxVisibleTabs - 1)); // Reserve space for "More" button
  const overflowTabs = sortedTabs.slice(maxVisibleTabs - 1);
  
  // Ensure active tab is in visible tabs
  const activeInVisible = visibleTabs.some(tab => tab.id === activeTab);
  if (!activeInVisible && overflowTabs.length > 0) {
    const activeTabData = overflowTabs.find(tab => tab.id === activeTab);
    if (activeTabData) {
      // Replace last visible tab with active tab
      overflowTabs.unshift(visibleTabs.pop()!);
      visibleTabs.push(activeTabData);
      const activeIndex = overflowTabs.findIndex(tab => tab.id === activeTab);
      if (activeIndex > -1) {
        overflowTabs.splice(activeIndex, 1);
      }
    }
  }

  const hasOverflow = overflowTabs.length > 0;

  const renderTab = (tab: TabItem, isCompact = false) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    
    return (
      <Button
        key={tab.id}
        variant="ghost"
        size="sm"
        onClick={() => {
          onTabChange(tab.id);
          setIsMoreOpen(false);
        }}
        className={cn(
          "flex flex-col items-center gap-0.5 h-auto transition-all duration-200 ease-out rounded-[20px] flex-shrink-0",
          isCompact 
            ? "py-2 px-3 min-w-[60px]" 
            : isMobile 
              ? "py-1.5 px-2 min-w-[50px]" 
              : "py-2 px-3 min-w-[60px]",
          isActive
            ? "bg-primary/10 text-primary scale-105"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102",
          tab.id === "preparar-dema" && "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-300 animate-pulse"
        )}
      >
        <Icon className={cn("shrink-0", isMobile && !isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        <span className={cn(
          "font-medium leading-tight whitespace-nowrap",
          isCompact ? "text-[10px]" : isMobile ? "text-[9px]" : "text-[10px]"
        )}>
          {tab.label}
        </span>
      </Button>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {/* Visible tabs */}
      {visibleTabs.map(tab => renderTab(tab))}
      
      {/* More button with overflow tabs */}
      {hasOverflow && (
        <Popover open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-0.5 h-auto transition-all duration-200 ease-out rounded-[20px] flex-shrink-0",
                isMobile ? "py-1.5 px-2 min-w-[50px]" : "py-2 px-3 min-w-[60px]",
                "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-102"
              )}
            >
              <MoreHorizontal className={cn("shrink-0", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
              <span className={cn(
                "font-medium leading-tight whitespace-nowrap",
                isMobile ? "text-[9px]" : "text-[10px]"
              )}>
                Més
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-2 bg-gray-800/95 backdrop-blur-[var(--backdrop-blur-organic)] border-gray-700 shadow-[var(--shadow-floating)]" 
            side="top"
            align="end"
          >
            <div className="flex flex-col gap-1">
              {overflowTabs.map(tab => renderTab(tab, true))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default SmartTabSystem;