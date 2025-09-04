import React, { memo, useMemo, ReactNode } from 'react';
import { Trash2, Edit, Check, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useDeviceType } from '@/hooks/device';
import type { Task } from '@/types';

interface SwipeAction {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  color: string;
  bgColor: string;
  action: () => void;
}

interface SwipeableItemProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: Task['status']) => void;
  task?: Task;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  disabled?: boolean;
  className?: string;
}

export const SwipeableItem = memo(({
  children,
  onDelete,
  onEdit,
  onStatusChange,
  task,
  leftActions,
  rightActions,
  disabled = false,
  className
}: SwipeableItemProps) => {
  const { type, isTouch } = useDeviceType();
  
  // Only enable swipe gestures on touch devices
  const isSwipeEnabled = isTouch && !disabled;

  // Generate task-specific actions based on task status
  const taskActions = useMemo(() => {
    if (!task || (!leftActions && !rightActions)) {
      // Default folder-style actions
      const defaultLeft: SwipeAction[] = onDelete ? [{
        id: 'delete',
        icon: Trash2,
        label: 'Eliminar',
        color: 'text-white',
        bgColor: 'bg-destructive',
        action: onDelete
      }] : [];

      const defaultRight: SwipeAction[] = onEdit ? [{
        id: 'edit',
        icon: Edit,
        label: 'Editar',
        color: 'text-white',
        bgColor: 'bg-primary',
        action: onEdit
      }] : [];

      return { left: defaultLeft, right: defaultRight };
    }

    // Task-specific actions
    const left: SwipeAction[] = leftActions || [
      ...(onDelete ? [{
        id: 'delete',
        icon: Trash2,
        label: 'Eliminar',
        color: 'text-white',
        bgColor: 'bg-destructive',
        action: onDelete
      }] : []),
      ...(onEdit ? [{
        id: 'edit',
        icon: Edit,
        label: 'Editar',
        color: 'text-white',
        bgColor: 'bg-blue-500',
        action: onEdit
      }] : [])
    ];

    const right: SwipeAction[] = rightActions || (() => {
      if (!onStatusChange) return [];
      
      switch (task.status) {
        case 'pendent':
          return [{
            id: 'start',
            icon: Play,
            label: 'Iniciar',
            color: 'text-white',
            bgColor: 'bg-orange-500',
            action: () => onStatusChange('en_proces')
          }];
        case 'en_proces':
          return [{
            id: 'complete',
            icon: Check,
            label: 'Completar',
            color: 'text-white',
            bgColor: 'bg-green-500',
            action: () => onStatusChange('completat')
          }];
        case 'completat':
          return [{
            id: 'reopen',
            icon: RotateCcw,
            label: 'Reobrir',
            color: 'text-white',
            bgColor: 'bg-gray-500',
            action: () => onStatusChange('pendent')
          }];
        default:
          return [];
      }
    })();

    return { left, right };
  }, [task, leftActions, rightActions, onDelete, onEdit, onStatusChange]);

  const { swipeState, touchHandlers } = useSwipeGestures({
    leftActions: taskActions.left,
    rightActions: taskActions.right,
    threshold: 60,
    maxDistance: 200,
    executeThreshold: 140,
    onSwipeEnd: (direction, distance) => {
      if (!isSwipeEnabled || distance < 60) return;
      
      // Manual execution for shorter swipes (not auto-executed)
      if (distance >= 100 && distance < 140) {
        const actions = direction === 'left' ? taskActions.left : taskActions.right;
        if (actions.length > 0) {
          actions[0].action();
        }
      }
    }
  });

  // Don't render swipe wrapper for non-touch devices
  if (!isSwipeEnabled) {
    return <div className={className}>{children}</div>;
  }

  const { isActive, direction, progress } = swipeState;

  // Calculate which actions to show
  const currentActions = direction === 'left' ? taskActions.left : taskActions.right;
  const showSecondAction = progress > 0.4 && currentActions.length > 1;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left Actions Background */}
      {direction === 'left' && isActive && taskActions.left.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex">
          {/* Primary action (Delete) */}
          <div 
            className={cn(
              "flex items-center justify-center transition-all duration-200 ease-out",
              taskActions.left[0].bgColor,
              taskActions.left[0].color,
              "font-medium"
            )}
            style={{
              width: `${Math.min(progress * 80, 80)}px`,
              opacity: Math.min(progress, 1)
            }}
          >
            <div className="flex items-center gap-2 px-3">
              {React.createElement(taskActions.left[0].icon, { className: "h-5 w-5" })}
              {progress > 0.3 && (
                <span className="text-sm whitespace-nowrap">
                  {taskActions.left[0].label}
                </span>
              )}
            </div>
          </div>

          {/* Secondary action (Edit) */}
          {showSecondAction && taskActions.left[1] && (
            <div 
              className={cn(
                "flex items-center justify-center transition-all duration-200 ease-out",
                taskActions.left[1].bgColor,
                taskActions.left[1].color,
                "font-medium"
              )}
              style={{
                width: `${Math.min((progress - 0.4) * 120, 80)}px`,
                opacity: Math.min(progress - 0.4, 1)
              }}
            >
              <div className="flex items-center gap-2 px-3">
                {React.createElement(taskActions.left[1].icon, { className: "h-5 w-5" })}
                <span className="text-sm whitespace-nowrap">
                  {taskActions.left[1].label}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right Actions Background */}
      {direction === 'right' && isActive && taskActions.right.length > 0 && (
        <div 
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-center transition-all duration-200 ease-out",
            taskActions.right[0].bgColor,
            taskActions.right[0].color,
            "font-medium"
          )}
          style={{
            width: `${Math.min(progress * 120, 120)}px`,
            opacity: Math.min(progress, 1)
          }}
        >
          <div className="flex items-center gap-2 px-4">
            {React.createElement(taskActions.right[0].icon, { className: "h-5 w-5" })}
            {progress > 0.3 && (
              <span className="text-sm whitespace-nowrap">
                {taskActions.right[0].label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "relative transition-transform duration-200 ease-out bg-card",
          isActive && "z-10"
        )}
        style={{
          transform: isActive && direction ? 
            `translateX(${direction === 'left' ? -Math.min(progress * 160, 160) : Math.min(progress * 120, 120)}px)` : 
            'translateX(0px)'
        }}
        {...touchHandlers}
      >
        {children}
      </div>
    </div>
  );
});

SwipeableItem.displayName = 'SwipeableItem';