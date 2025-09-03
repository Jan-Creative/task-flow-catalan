import { useMemo } from 'react';
import { DailyReflection } from '@/types/reflection';
import { format, startOfMonth, endOfMonth, isWithinInterval, subDays, differenceInDays } from 'date-fns';
import { ca } from 'date-fns/locale';

export const useReflectionAnalytics = (reflections: DailyReflection[]) => {
  const analytics = useMemo(() => {
    if (reflections.length === 0) {
      return {
        totalReflections: 0,
        currentMonthReflections: 0,
        averageRatings: {
          day_rating: 0,
          work_satisfaction: 0,
          energy_level: 0,
          stress_level: 0,
          tasks_completed_percentage: 0
        },
        moodTrends: [],
        streakDays: 0,
        monthlyStats: [],
        topMoodTags: [],
        topObstacles: [],
        topAccomplishments: []
      };
    }

    const now = new Date();
    const currentMonth = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    // Basic counts
    const totalReflections = reflections.length;
    const currentMonthReflections = reflections.filter(r => 
      isWithinInterval(new Date(r.reflection_date), { start: currentMonth, end: currentMonthEnd })
    ).length;

    // Average ratings
    const averageRatings = {
      day_rating: reflections.reduce((sum, r) => sum + r.day_rating, 0) / totalReflections,
      work_satisfaction: reflections.reduce((sum, r) => sum + r.work_satisfaction, 0) / totalReflections,
      energy_level: reflections.reduce((sum, r) => sum + r.energy_level, 0) / totalReflections,
      stress_level: reflections.reduce((sum, r) => sum + r.stress_level, 0) / totalReflections,
      tasks_completed_percentage: reflections.reduce((sum, r) => sum + r.tasks_completed_percentage, 0) / totalReflections
    };

    // Mood trends (last 30 days)
    const last30Days = subDays(now, 30);
    const recentReflections = reflections
      .filter(r => new Date(r.reflection_date) >= last30Days)
      .sort((a, b) => new Date(a.reflection_date).getTime() - new Date(b.reflection_date).getTime());

    const moodTrends = recentReflections.map(r => ({
      date: r.reflection_date,
      day_rating: r.day_rating,
      energy_level: r.energy_level,
      stress_level: r.stress_level,
      work_satisfaction: r.work_satisfaction
    }));

    // Calculate streak (consecutive days with reflections)
    const sortedDates = reflections
      .map(r => new Date(r.reflection_date))
      .sort((a, b) => b.getTime() - a.getTime());

    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const date of sortedDates) {
      const reflectionDate = new Date(date);
      reflectionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = differenceInDays(currentDate, reflectionDate);
      
      if (daysDiff === streakDays) {
        streakDays++;
      } else if (daysDiff === streakDays + 1) {
        streakDays++;
      } else {
        break;
      }
      
      currentDate = new Date(reflectionDate);
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Monthly statistics
    const monthlyStats = reflections.reduce((acc, reflection) => {
      const monthKey = format(new Date(reflection.reflection_date), 'yyyy-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          avgDayRating: 0,
          avgEnergyLevel: 0,
          avgStressLevel: 0,
          avgTasksCompleted: 0,
          totalDayRating: 0,
          totalEnergyLevel: 0,
          totalStressLevel: 0,
          totalTasksCompleted: 0
        };
      }
      
      acc[monthKey].count++;
      acc[monthKey].totalDayRating += reflection.day_rating;
      acc[monthKey].totalEnergyLevel += reflection.energy_level;
      acc[monthKey].totalStressLevel += reflection.stress_level;
      acc[monthKey].totalTasksCompleted += reflection.tasks_completed_percentage;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(monthlyStats).forEach((month: any) => {
      month.avgDayRating = month.totalDayRating / month.count;
      month.avgEnergyLevel = month.totalEnergyLevel / month.count;
      month.avgStressLevel = month.totalStressLevel / month.count;
      month.avgTasksCompleted = month.totalTasksCompleted / month.count;
    });

    // Top mood tags
    const moodTagCounts = reflections.reduce((acc, r) => {
      r.mood_tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topMoodTags = Object.entries(moodTagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Top obstacles
    const obstacleCounts = reflections.reduce((acc, r) => {
      r.obstacles?.forEach(obstacle => {
        acc[obstacle] = (acc[obstacle] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topObstacles = Object.entries(obstacleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([obstacle, count]) => ({ obstacle, count }));

    // Top accomplishments
    const accomplishmentCounts = reflections.reduce((acc, r) => {
      r.accomplishments?.forEach(accomplishment => {
        acc[accomplishment] = (acc[accomplishment] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topAccomplishments = Object.entries(accomplishmentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([accomplishment, count]) => ({ accomplishment, count }));

    return {
      totalReflections,
      currentMonthReflections,
      averageRatings,
      moodTrends,
      streakDays,
      monthlyStats: Object.values(monthlyStats).sort((a: any, b: any) => b.month.localeCompare(a.month)),
      topMoodTags,
      topObstacles,
      topAccomplishments
    };
  }, [reflections]);

  return analytics;
};