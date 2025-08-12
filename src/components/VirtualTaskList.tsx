import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import OptimizedTaskItem from '@/components/OptimizedTaskItem';
import { TaskItemSkeleton } from '@/components/ui/skeleton';
import type { Tasca } from '@/types';

interface VirtualTaskListProps {
  tasks: Tasca[];
  onTaskClick?: (task: Tasca) => void;
  onTaskStatusChange?: (taskId: string, status: Tasca['status']) => void;
  onTaskDelete?: (taskId: string) => void;
  loading?: boolean;
  height?: number;
  itemHeight?: number;
}

interface TaskRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    tasks: Tasca[];
    onTaskClick?: (task: Tasca) => void;
    onTaskStatusChange?: (taskId: string, status: Tasca['status']) => void;
    onTaskDelete?: (taskId: string) => void;
  };
}

const TaskRow = memo<TaskRowProps>(({ index, style, data }) => {
  const { tasks, onTaskClick, onTaskStatusChange, onTaskDelete } = data;
  const task = tasks[index];

  if (!task) {
    return (
      <div style={style} className="px-1">
        <TaskItemSkeleton />
      </div>
    );
  }

  return (
    <div style={style} className="px-1 pb-2">
      <OptimizedTaskItem
        task={task}
        onEdit={onTaskClick}
        onStatusChange={onTaskStatusChange}
        onDelete={onTaskDelete}
      />
    </div>
  );
});

TaskRow.displayName = 'TaskRow';

export const VirtualTaskList = memo<VirtualTaskListProps>(({
  tasks,
  onTaskClick,
  onTaskStatusChange,
  onTaskDelete,
  loading = false,
  height = 400,
  itemHeight = 120,
}) => {
  const itemData = useMemo(() => ({
    tasks,
    onTaskClick,
    onTaskStatusChange,
    onTaskDelete,
  }), [tasks, onTaskClick, onTaskStatusChange, onTaskDelete]);

  // Show skeleton loading for empty state
  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <TaskItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show regular layout for small lists (< 50 items)
  if (tasks.length < 50) {
    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <OptimizedTaskItem
            key={task.id}
            task={task}
            onEdit={onTaskClick}
            onStatusChange={onTaskStatusChange}
            onDelete={onTaskDelete}
          />
        ))}
      </div>
    );
  }

  // Use virtual scrolling for large lists (>= 50 items)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <List
        height={height}
        itemCount={tasks.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Render 5 extra items for smooth scrolling
        className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-background"
      >
        {TaskRow}
      </List>
    </div>
  );
});

VirtualTaskList.displayName = 'VirtualTaskList';