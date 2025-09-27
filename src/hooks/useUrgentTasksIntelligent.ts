import { useMemo } from 'react';
import { useDadesApp } from './useDadesApp';
import type { Tasca } from '@/types';

/**
 * Sistema intel·ligent de detecció de tasques urgents
 * Utilitza un algoritme de puntuació múltiple per detectar urgència real
 */

interface UrgentTask extends Tasca {
  urgencyScore: number;
  urgencyLevel: 'critical' | 'high' | 'moderate';
  urgencyReason: string;
  created_at: string;
  updated_at: string;
}

function isDateToday(dateString: string | null): boolean {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString === today;
}

function isDateTomorrow(dateString: string | null): boolean {
  if (!dateString) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];
  return dateString === tomorrowString;
}

function isDateOverdue(dateString: string | null): boolean {
  if (!dateString) return false;
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
}

function isDateThisWeek(dateString: string | null): boolean {
  if (!dateString) return false;
  const today = new Date();
  const taskDate = new Date(dateString);
  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

function calculateUrgencyScore(task: Tasca): number {
  let score = 0;
  const taskDate = task.due_date;
  
  // Factor temporal (60% del pes total)
  if (taskDate) {
    if (isDateOverdue(taskDate)) {
      score += 40; // Tasca endarrerida - màxima urgència temporal
    } else if (isDateToday(taskDate)) {
      score += 35; // Venc avui - alta urgència temporal
    } else if (isDateTomorrow(taskDate)) {
      score += 25; // Venc demà - urgència moderada-alta
    } else if (isDateThisWeek(taskDate)) {
      score += 15; // Venc aquesta setmana - urgència baixa
    }
  }
  
  // Factor prioritat (30% del pes total)
  switch (task.priority) {
    case 'alta':
      score += 30;
      break;
    case 'mitjana':
      score += 20;
      break;
    case 'baixa':
    default:
      score += 10;
      break;
  }
  
  // Factor estat (10% del pes total)
  switch (task.status) {
    case 'pendent':
      score += 10; // Tasques pendents són més urgents
      break;
    case 'en_proces':
      score += 5; // Tasques en procés tenen menys urgència
      break;
    default:
      score += 0;
  }
  
  return Math.min(score, 100);
}

function getUrgencyLevel(score: number): 'critical' | 'high' | 'moderate' {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  return 'moderate';
}

function getUrgencyReason(task: Tasca, score: number): string {
  const isOverdue = isDateOverdue(task.due_date);
  const isToday = isDateToday(task.due_date);
  const isTomorrow = isDateTomorrow(task.due_date);
  const isHighPriority = task.priority === 'alta';
  
  if (isOverdue) {
    return 'Endarrerida';
  } else if (isToday && isHighPriority) {
    return 'Venc avui · Prioritat alta';
  } else if (isToday) {
    return 'Venc avui';
  } else if (isTomorrow && isHighPriority) {
    return 'Venc demà · Prioritat alta';
  } else if (isHighPriority) {
    return 'Prioritat alta';
  } else if (isTomorrow) {
    return 'Venc demà';
  } else {
    return 'Urgent';
  }
}

export const useUrgentTasksIntelligent = () => {
  const { tasks, loading, error } = useDadesApp();
  
  const urgentTasks = useMemo(() => {
    if (!tasks || loading) return [];
    
    // Filtrar només tasques no completades
    const activeTasks = tasks.filter(task => task.status !== 'completat');
    
    // Calcular puntuació d'urgència per cada tasca
    const tasksWithUrgency: UrgentTask[] = activeTasks.map(task => {
      const urgencyScore = calculateUrgencyScore(task);
      const urgencyLevel = getUrgencyLevel(urgencyScore);
      const urgencyReason = getUrgencyReason(task, urgencyScore);
      
      return {
        ...task,
        urgencyScore,
        urgencyLevel,
        urgencyReason
      };
    });
    
    // Filtrar tasques amb puntuació d'urgència >= 60 i ordenar per puntuació
    return tasksWithUrgency
      .filter(task => task.urgencyScore >= 60)
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 6); // Màxim 6 tasques urgents
  }, [tasks, loading]);
  
  const urgencyStats = useMemo(() => {
    if (!urgentTasks.length) {
      return {
        total: 0,
        critical: 0,
        high: 0,
        moderate: 0,
        averageScore: 0
      };
    }
    
    const critical = urgentTasks.filter(t => t.urgencyLevel === 'critical').length;
    const high = urgentTasks.filter(t => t.urgencyLevel === 'high').length;
    const moderate = urgentTasks.filter(t => t.urgencyLevel === 'moderate').length;
    const averageScore = Math.round(
      urgentTasks.reduce((sum, task) => sum + task.urgencyScore, 0) / urgentTasks.length
    );
    
    return {
      total: urgentTasks.length,
      critical,
      high,
      moderate,
      averageScore
    };
  }, [urgentTasks]);
  
  return {
    urgentTasks,
    urgencyStats,
    loading,
    error,
    hasUrgentTasks: urgentTasks.length > 0
  };
};