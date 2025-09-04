import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveLayout } from '@/hooks/device';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
  minCardWidth?: number;
}

export function ResponsiveGrid({ 
  children, 
  className,
  priority = 'medium',
  minCardWidth = 300
}: ResponsiveGridProps) {
  const layout = useResponsiveLayout();

  // Calculate grid classes based on layout configuration
  const getGridClasses = () => {
    const { columns, spacing, cardSize } = layout;
    
    let gridCols = 'grid-cols-1';
    if (columns === 2) gridCols = 'grid-cols-1 md:grid-cols-2';
    else if (columns === 3) gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    else if (columns === 4) gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

    let gap = 'gap-4';
    if (spacing === 'compact') gap = 'gap-2';
    else if (spacing === 'spacious') gap = 'gap-6';

    return { gridCols, gap };
  };

  const { gridCols, gap } = getGridClasses();

  // Responsive breakpoints based on card size and priority
  const getResponsiveClasses = () => {
    if (layout.useCompactMode) {
      return 'space-y-3'; // Stack vertically on mobile
    }

    // Use CSS Grid with auto-fit for dynamic columns
    const style = {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
      gap: layout.spacing === 'compact' ? '0.5rem' : 
           layout.spacing === 'spacious' ? '1.5rem' : '1rem'
    };

    return { style };
  };

  // For mobile, use vertical stacking
  if (layout.useCompactMode) {
    return (
      <div className={cn('space-y-3', className)}>
        {children}
      </div>
    );
  }

  // For tablet and desktop, use responsive grid
  const responsiveProps = getResponsiveClasses();
  
  return (
    <div 
      className={cn(
        'grid',
        gridCols,
        gap,
        className
      )}
      {...(typeof responsiveProps === 'object' && 'style' in responsiveProps ? responsiveProps : {})}
    >
      {children}
    </div>
  );
}

// Specialized grid variants for common use cases
export function DashboardGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveGrid className={className} priority="high" minCardWidth={320}>
      {children}
    </ResponsiveGrid>
  );
}

export function TaskGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveGrid className={className} priority="medium" minCardWidth={280}>
      {children}
    </ResponsiveGrid>
  );
}

export function CalendarGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveGrid className={className} priority="low" minCardWidth={400}>
      {children}
    </ResponsiveGrid>
  );
}