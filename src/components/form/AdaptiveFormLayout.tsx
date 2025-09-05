/**
 * Adaptive Form Layout - Responsive layout optimized for iPad and iPhone
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveLayout } from '@/hooks/device/useResponsiveLayout';

interface AdaptiveFormLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

// Main adaptive layout container
export const AdaptiveFormLayout: React.FC<AdaptiveFormLayoutProps> = ({ 
  children, 
  className 
}) => {
  const { layout, useCompactMode } = useResponsiveLayout();
  
  const isTabletOrDesktop = layout === 'tablet' || layout === 'desktop';
  
  return (
    <div className={cn(
      "grid gap-6 w-full",
      // iPad/Desktop: 2 columns, mobile: 1 column
      isTabletOrDesktop ? "md:grid-cols-2 md:gap-8" : "grid-cols-1",
      useCompactMode && "gap-4",
      className
    )}>
      {children}
    </div>
  );
};

// Left column for main information
export const FormMainSection: React.FC<FormSectionProps> = ({ 
  children, 
  className, 
  title 
}) => {
  const { layout } = useResponsiveLayout();
  const isTabletOrDesktop = layout === 'tablet' || layout === 'desktop';
  
  return (
    <div className={cn(
      "space-y-6",
      isTabletOrDesktop && "md:col-span-1",
      className
    )}>
      {title && (
        <div className="space-y-1">
          <h3 className="text-base font-medium text-foreground">{title}</h3>
          <div className="h-px bg-border"></div>
        </div>
      )}
      {children}
    </div>
  );
};

// Right column for metadata and actions
export const FormMetaSection: React.FC<FormSectionProps> = ({ 
  children, 
  className, 
  title 
}) => {
  const { layout } = useResponsiveLayout();
  const isTabletOrDesktop = layout === 'tablet' || layout === 'desktop';
  
  return (
    <div className={cn(
      "space-y-4",
      isTabletOrDesktop && "md:col-span-1",
      className
    )}>
      {title && (
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="h-px bg-border/50"></div>
        </div>
      )}
      {children}
    </div>
  );
};

// Inline field for better space utilization
export const InlineField: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}> = ({ label, children, className, required }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
    </div>
  );
};

// Compact field group for metadata
export const CompactFieldGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-4",
      "sm:grid-cols-2 sm:gap-3",
      className
    )}>
      {children}
    </div>
  );
};