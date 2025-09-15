/**
 * List View Component
 * Optimized list rendering for folder tasks
 */

import React, { memo } from 'react';
import TaskChecklistItem from "@/components/TaskChecklistItem";
import type { Task } from '@/types';

interface ListViewProps {
  tasks: Task[];
  selectedTasks: string[];
  selectionMode: boolean;
  completingTasks: Set<string>;
  onSelectTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: any) => void;
}

export const ListView = memo(({
  tasks,
  selectedTasks,
  selectionMode,
  completingTasks,
  onSelectTask,
  onEditTask,
  onStatusChange
}: ListViewProps) => {
  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskChecklistItem
          key={task.id}
          task={task}
          completingTasks={completingTasks}
          onEdit={onEditTask}
          onDelete={() => {}} // Will be handled by toolbar actions
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
});

ListView.displayName = 'ListView';