/**
 * Organize View Component
 * Specialized view for tasks without due dates
 */

import React, { memo } from 'react';
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskChecklistItem from "@/components/TaskChecklistItem";
import type { Task } from '@/types';

interface OrganizeViewProps {
  tasks: Task[];
  selectedTasks: string[];
  selectionMode: boolean;
  completingTasks: Set<string>;
  onSelectTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: any) => void;
}

export const OrganizeView = memo(({
  tasks,
  selectedTasks,
  selectionMode,
  completingTasks,
  onSelectTask,
  onEditTask,
  onStatusChange
}: OrganizeViewProps) => {
  return (
    <div className="space-y-3">
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-amber-500/10 p-2 rounded-lg">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-700 dark:text-amber-300">
              Tasques per organitzar
            </h3>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
              Aquestes tasques necessiten una data de venciment
            </p>
          </div>
          <div className="text-sm text-amber-600 font-medium">
            {tasks.length} {tasks.length === 1 ? 'tasca' : 'tasques'}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Programar avui
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Programar demà
          </Button>
        </div>
      </div>

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
    </div>
  );
});

OrganizeView.displayName = 'OrganizeView';