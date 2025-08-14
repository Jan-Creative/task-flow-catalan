import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  activeTab: string;
  className?: string;
}

export const PageTransition = ({ children, activeTab, className }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [pendingTab, setPendingTab] = useState(activeTab);

  useEffect(() => {
    if (activeTab !== pendingTab) {
      // Start fade out
      setIsVisible(false);
      
      // After fade out completes, update content and fade in
      const timer = setTimeout(() => {
        setPendingTab(activeTab);
        setIsVisible(true);
      }, 150); // Half of transition duration
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, pendingTab]);

  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-smooth",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className
      )}
    >
      {children}
    </div>
  );
};

interface TabContentProps {
  children: ReactNode;
  isActive: boolean;
  className?: string;
}

export const TabContent = ({ children, isActive, className }: TabContentProps) => {
  if (!isActive) return null;
  
  return (
    <div 
      className={cn(
        "animate-fade-in-subtle",
        className
      )}
    >
      {children}
    </div>
  );
};