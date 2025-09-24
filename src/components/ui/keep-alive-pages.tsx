import React, { ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";

interface KeepAlivePagesProps {
  children: ReactNode;
  activeTab: string;
  className?: string;
}

interface PageCacheItem {
  content: ReactNode;
  isActive: boolean;
}

export const KeepAlivePages = ({ children, activeTab, className }: KeepAlivePagesProps) => {
  // Simple direct rendering without complex state management
  return (
    <div 
      className={cn(
        "transition-opacity duration-200 ease-out",
        className
      )}
    >
      {children}
    </div>
  );
};

interface TabPageProps {
  children: ReactNode;
  tabId: string;
  activeTab: string;
  className?: string;
}

export const TabPage = ({ children, tabId, activeTab, className }: TabPageProps) => {
  const isActive = tabId === activeTab;
  
  return (
    <div 
      className={cn(
        "w-full h-full",
        "transition-transform duration-200 ease-out",
        "contain-layout contain-style contain-paint", // CSS containment for isolation
        isActive 
          ? "transform-none opacity-100 relative z-10" 
          : "transform-gpu translate-x-full opacity-0 absolute inset-0 z-0",
        className
      )}
      style={{ 
        willChange: isActive ? 'auto' : 'transform' // Performance optimization
      }}
    >
      {children}
    </div>
  );
};