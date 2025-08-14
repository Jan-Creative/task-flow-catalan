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
        "w-full transition-all duration-150 ease-out",
        isActive ? "opacity-100 visible" : "opacity-0 invisible absolute",
        className
      )}
      style={{ 
        display: isActive ? 'block' : 'none' // Ensure proper hiding
      }}
    >
      {children}
    </div>
  );
};