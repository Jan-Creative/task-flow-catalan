import React, { useMemo } from 'react';
import { useDadesApp } from '@/hooks/useDadesApp';
import { CompletedTasksTodayCard } from './CompletedTasksTodayCard';
import { IncompleteTasksCard } from './IncompleteTasksCard';
import { format, startOfDay } from 'date-fns';
import { Tasca } from '@/types';

interface ExtendedTask extends Tasca {
  completed_at?: string;
  folder?: {
    id: string;
    name: string;
    color: string;
  };
}

export const TaskStatusCardsSection = () => {
  const { tasks } = useDadesApp();

  // Calculate task status for intelligent rendering
  const taskStatus = useMemo(() => {
    const today = new Date();
    
    // Completed tasks today
    const completedTasksToday = (tasks as ExtendedTask[]).filter(task => {
      if (task.status !== 'completat' || !task.completed_at) return false;
      
      const completedDate = new Date(task.completed_at);
      return (
        completedDate.getDate() === today.getDate() &&
        completedDate.getMonth() === today.getMonth() &&
        completedDate.getFullYear() === today.getFullYear()
      );
    });

    // Incomplete tasks (overdue, today, or in progress without date)
    const incompleteTasksToday = (tasks as ExtendedTask[]).filter(task => {
      const todayStart = startOfDay(today);
      const taskDate = task.due_date ? startOfDay(new Date(task.due_date)) : null;
      
      // Tasks due today that are not completed
      const isDueToday = taskDate && taskDate.getTime() === todayStart.getTime() && task.status !== 'completat';
      
      // Overdue tasks that are not completed
      const isOverdue = taskDate && taskDate.getTime() < todayStart.getTime() && task.status !== 'completat';
      
      // Tasks in progress without due date (potentially worked on today)
      const isInProgressWithoutDate = task.status === 'en_proces' && !task.due_date;
      
      return isDueToday || isOverdue || isInProgressWithoutDate;
    });

    return {
      hasCompletedTasks: completedTasksToday.length > 0,
      hasIncompleteTasks: incompleteTasksToday.length > 0,
      completedCount: completedTasksToday.length,
      incompleteCount: incompleteTasksToday.length
    };
  }, [tasks]);

  const { hasCompletedTasks, hasIncompleteTasks } = taskStatus;

  // Determine layout strategy
  const getLayoutClasses = () => {
    if (hasCompletedTasks && hasIncompleteTasks) {
      // Both cards visible - 2 column grid
      return {
        container: "grid grid-cols-1 lg:grid-cols-2 gap-6",
        completedCard: "",
        incompleteCard: ""
      };
    } else if (hasCompletedTasks || hasIncompleteTasks) {
      // Only one card visible - single centered column
      return {
        container: "grid grid-cols-1 gap-6",
        completedCard: "max-w-4xl mx-auto",
        incompleteCard: "max-w-4xl mx-auto"
      };
    } else {
      // No cards visible - minimal space (development mode shows empty cards)
      return {
        container: "grid grid-cols-1 lg:grid-cols-2 gap-6",
        completedCard: "",
        incompleteCard: ""
      };
    }
  };

  const layoutClasses = getLayoutClasses();

  // For development: always show both cards
  // For production: show based on hasCompletedTasks and hasIncompleteTasks
  const showCompletedCard = true; // hasCompletedTasks || import.meta.env.DEV;
  const showIncompleteCard = true; // hasIncompleteTasks || import.meta.env.DEV;

  // Don't render anything if no cards should be shown (production mode with no tasks)
  if (!showCompletedCard && !showIncompleteCard) {
    return null;
  }

  return (
    <div className={`${layoutClasses.container} animate-fade-in transition-all duration-500 ease-out`}>
      {showCompletedCard && (
        <div className={`${layoutClasses.completedCard} animate-scale-in transition-all duration-300 delay-100`}>
          <CompletedTasksTodayCard />
        </div>
      )}
      
      {showIncompleteCard && (
        <div className={`${layoutClasses.incompleteCard} animate-scale-in transition-all duration-300 delay-200`}>
          <IncompleteTasksCard />
        </div>
      )}
    </div>
  );
};