import { useMemo } from 'react';
import { useTasksData } from '@/contexts/TasksProvider';
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
  if (task.status === 'completat') return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const hasDueDateToday = task.due_date === today;
  const hasNoSpecificDate = !task.due_date;
  const isOverdue = task.due_date && task.due_date < today;
  
  let score = 0;
  
  // CRITERI 1: Tasques vençudes (sempre urgents)
  if (isOverdue) {
    score = 80; // Base per vençudes
    
    // Bonus segons prioritat
    switch (task.priority) {
      case 'urgent':
        score += 20; // 100 total
        break;
      case 'alta':
        score += 15; // 95 total
        break;
      case 'mitjana':
        score += 10; // 90 total
        break;
      case 'baixa':
        score += 5;  // 85 total
        break;
    }
  }
  // CRITERI 2: Venciment avui NOMÉS si prioritat alta/urgent
  else if (hasDueDateToday) {
    // Només considerar urgent si la prioritat ho justifica
    if (task.priority === 'urgent') {
      score = 95; // Urgent + venc avui
    } else if (task.priority === 'alta') {
      score = 85; // Alta + venc avui
    }
    // mitjana i baixa amb venciment avui NO són urgents
    // (probablement són tasques marcades "Avui" sense voler-les urgent)
  }
  // CRITERI 3: Tasques generals sense data específica
  else if (hasNoSpecificDate) {
    if (task.priority === 'urgent') {
      score = 90; // Urgent general
    } else if (task.priority === 'alta') {
      score = 75; // Alta general
    }
    // mitjana i baixa sense data no són urgents
  }
  // CRITERI 4: Tasques futures amb data específica = NO URGENTS AVUI
  else {
    return 0; // Apareixeran el seu dia programat
  }
  
  // Petit bonus per estat pendent (només si ja hi ha urgència base)
  if (score > 0 && task.status === 'pendent') {
    score += 5;
  }
  
  return Math.min(score, 100);
}

function getUrgencyLevel(score: number): 'critical' | 'high' | 'moderate' {
  if (score >= 90) return 'critical';  // urgent priority
  if (score >= 75) return 'high';      // alta priority o avui+alta
  return 'moderate';                   // avui+mitjana/baixa
}

function getUrgencyReason(task: Tasca, score: number): string {
  const today = new Date().toISOString().split('T')[0];
  const hasDueDateToday = task.due_date === today;
  const isOverdue = task.due_date && task.due_date < today;
  
  if (isOverdue) {
    return 'Vençuda';
  } else if (task.priority === 'urgent') {
    return hasDueDateToday ? 'Urgent · Venc avui' : 'Prioritat urgent';
  } else if (task.priority === 'alta') {
    return hasDueDateToday ? 'Alta · Venc avui' : 'Prioritat alta';
  } else {
    return 'Urgent';
  }
}

export const useUrgentTasksIntelligent = () => {
  const { tasks, loading, error } = useTasksData();
  
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