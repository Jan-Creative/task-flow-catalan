/**
 * Kanban View Component
 * Optimized kanban board for folder tasks
 */

import React, { memo } from 'react';
import TaskChecklistItem from "@/components/TaskChecklistItem";
import { useUnifiedProperties } from "@/hooks/useUnifiedProperties";
import type { Task } from '@/types';

interface KanbanViewProps {
  tasks: Task[];
  selectedTasks: string[];
  selectionMode: boolean;
  completingTasks: Set<string>;
  recentlyCompleted: Set<string>;
  onSelectTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: any) => void;
}

export const KanbanView = memo(({
  tasks,
  selectedTasks,
  selectionMode,
  completingTasks,
  recentlyCompleted,
  onSelectTask,
  onEditTask,
  onStatusChange
}: KanbanViewProps) => {
  const { getStatusOptions, getStatusColor } = useUnifiedProperties();

  const getStatusTasks = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  // Function to get dynamic column background style based on status color
  const getColumnBackgroundStyle = (columnId: string) => {
    const statusColor = getStatusColor(columnId);
    if (statusColor && statusColor.startsWith('#')) {
      // Convert hex to RGB and apply with opacity
      const hex = statusColor.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
        backdropFilter: 'blur(8px)'
      };
    }
    // Fallback to default card background
    return {};
  };

  const statusColumns = getStatusOptions().map(option => ({
    id: option.value,
    label: option.label,
    tasks: getStatusTasks(option.value)
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {statusColumns.map((column) => (
        <div key={column.id} className="space-y-3">
          <div 
            className="rounded-lg p-3 border border-border/50"
            style={getColumnBackgroundStyle(column.id)}
          >
            <h3 className="font-medium text-sm mb-2 text-foreground/90">
              {column.label}
            </h3>
            <div className="text-xs text-muted-foreground">
              {column.tasks.length} {column.tasks.length === 1 ? 'tasca' : 'tasques'}
            </div>
          </div>
          
          <div className="space-y-1">
            {column.tasks.map((task) => (
              <TaskChecklistItem
                key={task.id}
                task={task}
                completingTasks={completingTasks}
                viewMode="kanban"
                onEdit={onEditTask}
                onDelete={() => {}} // Will be handled by toolbar actions
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

KanbanView.displayName = 'KanbanView';