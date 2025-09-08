import { useMemo } from 'react';
import { DailyChallenge } from '@/types/challenges';
import { format, startOfMonth, endOfMonth, isWithinInterval, subDays, differenceInDays, getDay } from 'date-fns';
import { ca } from 'date-fns/locale';

export const useChallengesAnalytics = (challenges: DailyChallenge[]) => {
  const analytics = useMemo(() => {
    if (challenges.length === 0) {
      return {
        totalChallenges: 0,
        completedChallenges: 0,
        completionRate: 0,
        currentMonthChallenges: 0,
        currentMonthCompleted: 0,
        streakDays: 0,
        completionTrends: [],
        categoryStats: [],
        difficultyStats: [],
        monthlyStats: [],
        weekdayStats: [],
        averageCompletionTime: 0
      };
    }

    const now = new Date();
    const currentMonth = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Basic stats
    const totalChallenges = challenges.length;
    const completedChallenges = challenges.filter(c => c.is_completed).length;
    const completionRate = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;

    // Current month stats
    const currentMonthChallenges = challenges.filter(c => 
      isWithinInterval(new Date(c.challenge_date), { start: currentMonth, end: currentMonthEnd })
    );
    const currentMonthCompleted = currentMonthChallenges.filter(c => c.is_completed).length;

    // Completion trends (last 30 days)
    const last30Days = subDays(now, 30);
    const recentChallenges = challenges
      .filter(c => new Date(c.challenge_date) >= last30Days)
      .sort((a, b) => new Date(a.challenge_date).getTime() - new Date(b.challenge_date).getTime());

    const completionTrends = recentChallenges.reduce((acc, challenge) => {
      const date = challenge.challenge_date;
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.total++;
        if (challenge.is_completed) existing.completed++;
      } else {
        acc.push({
          date,
          total: 1,
          completed: challenge.is_completed ? 1 : 0
        });
      }
      
      return acc;
    }, [] as Array<{ date: string; total: number; completed: number }>);

    // Calculate streak (consecutive days with completed challenges)
    const completedChallengesByDate = challenges
      .filter(c => c.is_completed)
      .map(c => new Date(c.challenge_date))
      .sort((a, b) => b.getTime() - a.getTime());

    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const uniqueDates = [...new Set(completedChallengesByDate.map(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }))].map(time => new Date(time));

    for (const date of uniqueDates) {
      const daysDiff = differenceInDays(currentDate, date);
      
      if (daysDiff === streakDays) {
        streakDays++;
      } else if (daysDiff === streakDays + 1) {
        streakDays++;
      } else {
        break;
      }
      
      currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Category statistics
    const categoryStats = challenges.reduce((acc, challenge) => {
      const existing = acc.find(item => item.category === challenge.category);
      
      if (existing) {
        existing.total++;
        if (challenge.is_completed) existing.completed++;
      } else {
        acc.push({
          category: challenge.category,
          total: 1,
          completed: challenge.is_completed ? 1 : 0,
          completionRate: 0
        });
      }
      
      return acc;
    }, [] as Array<{ category: string; total: number; completed: number; completionRate: number }>);

    // Add completion rates to category stats
    categoryStats.forEach(stat => {
      stat.completionRate = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
    });

    // Difficulty statistics
    const difficultyStats = challenges.reduce((acc, challenge) => {
      const existing = acc.find(item => item.difficulty === challenge.difficulty);
      
      if (existing) {
        existing.total++;
        if (challenge.is_completed) existing.completed++;
      } else {
        acc.push({
          difficulty: challenge.difficulty,
          total: 1,
          completed: challenge.is_completed ? 1 : 0,
          completionRate: 0
        });
      }
      
      return acc;
    }, [] as Array<{ difficulty: string; total: number; completed: number; completionRate: number }>);

    // Add completion rates to difficulty stats
    difficultyStats.forEach(stat => {
      stat.completionRate = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
    });

    // Monthly statistics
    const monthlyStats = challenges.reduce((acc, challenge) => {
      const monthKey = format(new Date(challenge.challenge_date), 'yyyy-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          total: 0,
          completed: 0
        };
      }
      
      acc[monthKey].total++;
      if (challenge.is_completed) {
        acc[monthKey].completed++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Add completion rates to monthly stats
    Object.values(monthlyStats).forEach((month: any) => {
      month.completionRate = month.total > 0 ? (month.completed / month.total) * 100 : 0;
    });

    // Weekday statistics (0 = Sunday, 1 = Monday, etc.)
    const weekdayStats = Array.from({ length: 7 }, (_, i) => ({
      weekday: i,
      total: 0,
      completed: 0,
      completionRate: 0
    }));

    challenges.forEach(challenge => {
      const weekday = getDay(new Date(challenge.challenge_date));
      weekdayStats[weekday].total++;
      if (challenge.is_completed) {
        weekdayStats[weekday].completed++;
      }
    });

    weekdayStats.forEach(stat => {
      stat.completionRate = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
    });

    // Average completion time (days between creation and completion)
    const completedWithTimes = challenges.filter(c => c.is_completed && c.completed_at);
    const averageCompletionTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, challenge) => {
          const created = new Date(challenge.created_at);
          const completed = new Date(challenge.completed_at!);
          return sum + differenceInDays(completed, created);
        }, 0) / completedWithTimes.length
      : 0;

    return {
      totalChallenges,
      completedChallenges,
      completionRate,
      currentMonthChallenges: currentMonthChallenges.length,
      currentMonthCompleted,
      streakDays,
      completionTrends,
      categoryStats: categoryStats.sort((a, b) => b.completionRate - a.completionRate),
      difficultyStats: difficultyStats.sort((a, b) => b.completionRate - a.completionRate),
      monthlyStats: Object.values(monthlyStats).sort((a: any, b: any) => b.month.localeCompare(a.month)),
      weekdayStats,
      averageCompletionTime
    };
  }, [challenges]);

  return analytics;
};