import { useMemo } from "react";
import { useDadesApp } from "./useDadesApp";
import type { Tasca } from "@/types";

export const useProjectTasks = (projectId: string) => {
  const { tasks: allTasks, loading, error } = useDadesApp();

  const projectTasks = useMemo(() => {
    if (!allTasks || !projectId) return [];
    
    // For now, we'll filter by folder that contains project name
    // This is a temporary solution until we add project_id to tasks table
    return allTasks.filter(task => 
      task.folder?.name?.toLowerCase().includes('projecte') ||
      task.title?.toLowerCase().includes(projectId.slice(-8)) // Use last 8 chars of project ID as identifier
    );
  }, [allTasks, projectId]);

  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return projectTasks.filter(task => 
      task.due_date === today || 
      (task.status !== "completat" && !task.due_date)
    );
  }, [projectTasks]);

  const completedTasks = useMemo(() => {
    return projectTasks.filter(task => task.status === "completat");
  }, [projectTasks]);

  const urgentTasks = useMemo(() => {
    return projectTasks.filter(task => 
      task.priority === 'alta' && task.status !== 'completat'
    );
  }, [projectTasks]);

  const taskStats = useMemo(() => {
    const total = projectTasks.length;
    const completed = completedTasks.length;
    const pending = projectTasks.filter(task => task.status === "pendent").length;
    const inProgress = projectTasks.filter(task => task.status === "en_proces").length;
    
    return {
      total,
      completed,
      pending,
      inProgress,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [projectTasks, completedTasks]);

  return {
    projectTasks,
    todayTasks,
    completedTasks,
    urgentTasks,
    taskStats,
    loading,
    error
  };
};