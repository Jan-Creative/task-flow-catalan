import { ReactNode } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useDeviceType } from '@/hooks/device';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  action: () => void;
}

interface SwipeableItemProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SwipeableItem({
  children,
  leftAction,
  rightAction,
  onEdit,
  onDelete,
  disabled = false,
  className
}: SwipeableItemProps) {
  const { type, isTouch } = useDeviceType();
  
  // Only enable swipe gestures on touch devices
  const isSwipeEnabled = isTouch && !disabled;

  // Default actions if not provided
  const defaultLeftAction: SwipeAction = {
    icon: <Trash2 className="h-5 w-5" />,
    label: 'Eliminar',
    color: 'bg-destructive',
    action: onDelete || (() => {})
  };

  const defaultRightAction: SwipeAction = {
    icon: <Edit2 className="h-5 w-5" />,
    label: 'Editar',
    color: 'bg-primary',
    action: onEdit || (() => {})
  };

  const finalLeftAction = leftAction || (onDelete ? defaultLeftAction : undefined);
  const finalRightAction = rightAction || (onEdit ? defaultRightAction : undefined);

  const { swipeState, touchHandlers } = useSwipeGestures({
    threshold: 60,
    maxDistance: 120,
    onSwipeEnd: (direction, distance) => {
      if (!isSwipeEnabled) return;
      
      // Execute action if swipe distance is sufficient
      if (distance >= 100) {
        if (direction === 'left' && finalLeftAction) {
          finalLeftAction.action();
        } else if (direction === 'right' && finalRightAction) {
          finalRightAction.action();
        }
      }
    }
  });

  // Don't render swipe wrapper for non-touch devices
  if (!isSwipeEnabled) {
    return <div className={className}>{children}</div>;
  }

  const { isActive, direction, progress } = swipeState;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left Action Background */}
      {finalLeftAction && (
        <div 
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-center transition-all duration-200 ease-out",
            finalLeftAction.color,
            "text-white font-medium"
          )}
          style={{
            width: direction === 'left' && isActive ? `${Math.min(progress * 120, 120)}px` : '0px',
            opacity: direction === 'left' && isActive ? Math.min(progress, 1) : 0
          }}
        >
          <div className="flex items-center gap-2 px-4">
            {finalLeftAction.icon}
            {progress > 0.5 && (
              <span className="text-sm whitespace-nowrap">
                {finalLeftAction.label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Right Action Background */}
      {finalRightAction && (
        <div 
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-center transition-all duration-200 ease-out",
            finalRightAction.color,
            "text-white font-medium"
          )}
          style={{
            width: direction === 'right' && isActive ? `${Math.min(progress * 120, 120)}px` : '0px',
            opacity: direction === 'right' && isActive ? Math.min(progress, 1) : 0
          }}
        >
          <div className="flex items-center gap-2 px-4">
            {finalRightAction.icon}
            {progress > 0.5 && (
              <span className="text-sm whitespace-nowrap">
                {finalRightAction.label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "relative transition-transform duration-200 ease-out",
          isActive && "z-10"
        )}
        style={{
          transform: isActive && direction ? 
            `translateX(${direction === 'left' ? -progress * 120 : progress * 120}px)` : 
            'translateX(0px)'
        }}
        {...touchHandlers}
      >
        {children}
      </div>
    </div>
  );
}