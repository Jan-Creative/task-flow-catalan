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

function calculateTodayUrgencyScore(task: Tasca): number {
  let score = 0;
  const taskDate = task.due_date;
  const isToday = taskDate === new Date().toISOString().split('T')[0];
  
  // Tasques que vencen avui (puntuació base alta)
  if (isToday) {
    score += 50; // Base per tasques d'avui
    
    // Bonus per prioritat
    switch (task.priority) {
      case 'alta':
        score += 40;
        break;
      case 'mitjana':
        score += 30;
        break;
      case 'baixa':
      default:
        score += 20;
        break;
    }
  }
  
  // Tasques de prioritat alta sense data límit
  else if (!taskDate && task.priority === 'alta') {
    score += 70; // Important però sense urgència temporal
  }
  
  // Si no és d'avui ni prioritat alta sense data, no és urgent
  else {
    return 0;
  }
  
  // Bonus per estat pendent
  if (task.status === 'pendent') {
    score += 10;
  }
  
  return Math.min(score, 100);
}

function getUrgencyLevel(score: number): 'critical' | 'high' | 'moderate' {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  return 'moderate';
}

function getUrgencyReason(task: Tasca, score: number): string {
  const isToday = isDateToday(task.due_date);
  const isHighPriority = task.priority === 'alta';
  
  if (isToday && isHighPriority) {
    return 'Venc avui · Prioritat alta';
  } else if (isToday) {
    return 'Venc avui';
  } else if (!task.due_date && isHighPriority) {
    return 'Prioritat alta';
  } else {
    return 'Urgent avui';
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
      const urgencyScore = calculateTodayUrgencyScore(task);
      const urgencyLevel = getUrgencyLevel(urgencyScore);
      const urgencyReason = getUrgencyReason(task, urgencyScore);
      
      return {
        ...task,
        urgencyScore,
        urgencyLevel,
        urgencyReason
      };
    });
    
    // Filtrar tasques amb puntuació d'urgència > 0 i ordenar per puntuació
    return tasksWithUrgency
      .filter(task => task.urgencyScore > 0)
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 6); // Màxim 6 tasques urgents d'avui
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