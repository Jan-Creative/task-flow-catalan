import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import CircularActionMenuWithArc from "./CircularActionMenuWithArc";
import CircularActionMenu from "./CircularActionMenu";
import { useCircularMenuMode } from "@/hooks/useCircularMenuMode";
import { usePrepareTomorrowVisibility } from "@/hooks/usePrepareTomorrowVisibility";
import { usePhoneDetection } from "@/hooks/device/usePhoneDetection";
import { useIOSDetection } from "@/hooks/useIOSDetection";
import { useKeyboardNavigation } from "@/contexts/KeyboardNavigationContext";
import SmartTabSystem from "./navigation/SmartTabSystem";

interface AdaptiveBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateTask: () => void;
}

const AdaptiveBottomNavigation = ({ activeTab, onTabChange, onCreateTask }: AdaptiveBottomNavigationProps) => {
  const [isCompacted, setIsCompacted] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [safeExitMode, setSafeExitMode] = useState(false);
  const isMobile = useIsMobile();
  const { isArcMode, toggleMode } = useCircularMenuMode("arc");
  const { isVisible: showPrepareTomorrow } = usePrepareTomorrowVisibility();
  const phoneInfo = usePhoneDetection();
  const isIOS = useIOSDetection();
  const { navigationSafeMode, isFormOpen, isKeyboardActive } = useKeyboardNavigation();

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

  // Safe exit coordination - Wait for keyboard to be fully closed
  useEffect(() => {
    if (!isFormOpen && !isKeyboardActive && safeExitMode) {
      const settleTimer = setTimeout(() => {
        setSafeExitMode(false);
        console.debug('🎯 Navigation position validated:', {
          bottom: window.getComputedStyle(document.querySelector('.adaptive-bottom-nav') || document.body).bottom,
          transform: window.getComputedStyle(document.querySelector('.adaptive-bottom-nav') || document.body).transform
        });
      }, 250);
      return () => clearTimeout(settleTimer);
    } else if (isFormOpen) {
      setSafeExitMode(true);
    }
  }, [isFormOpen, isKeyboardActive, safeExitMode]);

  const handleCompactedClick = () => {
    setIsCompacted(false);
    setShowTransition(false);
  };

  // Portal the compact navigation to document.body for absolute positioning
  if (isCompacted && activeTab === "calendar") {
    const compactNav = (
      <div className={cn(
        isIOS && phoneInfo.isPhone ? "ios-bottom-nav-compact" : "fixed bottom-6 left-4 z-50"
      )}>
        <Button
          onClick={handleCompactedClick}
          size="lg"
          className={cn(
            "bg-glass-navigation-primary backdrop-blur-[var(--backdrop-blur-navigation)] backdrop-saturate-[var(--backdrop-saturate-navigation)] backdrop-brightness-[var(--backdrop-brightness-navigation)] border border-glass-border-subtle hover:scale-110 active:scale-95 hover:bg-glass-navigation-accent transition-all duration-300 ease-out rounded-full h-14 w-14 shadow-[var(--glass-shadow-floating)] flex-shrink-0 p-0",
            showTransition && "animate-scale-in"
          )}
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    );
    
    return createPortal(compactNav, document.body);
  }

  // Portal the main navigation to document.body for absolute positioning
  const navigation = (
    <div 
      className={cn(
        "adaptive-bottom-nav",
        isIOS && phoneInfo.isPhone 
          ? (navigationSafeMode || safeExitMode)
            ? "ios-bottom-nav-safe" 
            : "ios-bottom-nav" 
          : "fixed bottom-6 left-4 right-4 z-50",
        "transition-all duration-300 ease-out",
        (navigationSafeMode || safeExitMode) && "navigation-protected"
      )}
    >
      <div className={cn(
        "flex items-center justify-between transition-all duration-500 ease-out",
        showTransition && "animate-fade-out"
      )}>
        {/* Main Navigation */}
        <div className={cn(
          "bg-glass-navigation-primary backdrop-blur-[var(--backdrop-blur-navigation)] backdrop-saturate-[var(--backdrop-saturate-navigation)] backdrop-brightness-[var(--backdrop-brightness-navigation)] rounded-[28px] shadow-[var(--glass-shadow-floating)] border border-glass-border-subtle px-2 py-1.5 flex-1 transition-all duration-300 ease-out",
          phoneInfo.isPhone ? "mr-3" : "mr-4"
        )}>
          <div className="flex items-center justify-center mx-auto">
            <SmartTabSystem
              activeTab={activeTab}
              onTabChange={onTabChange}
              maxVisibleTabs={phoneInfo.isPhone ? phoneInfo.canFitTabs : 6}
              availableWidth={phoneInfo.availableWidth}
              showPrepareTomorrow={showPrepareTomorrow}
              isMobile={phoneInfo.isPhone}
            />
          </div>
        </div>

        {/* Circular Action Menu - Optimized for phone */}
        {isArcMode ? (
          <CircularActionMenuWithArc
            onCreateTask={onCreateTask}
            isMobile={phoneInfo.isPhone || isMobile}
            onToggleMode={toggleMode}
          />
        ) : (
          <CircularActionMenu
            onCreateTask={onCreateTask}
            isMobile={phoneInfo.isPhone || isMobile}
          />
        )}
      </div>
    </div>
  );

  return createPortal(navigation, document.body);
};

export default AdaptiveBottomNavigation;