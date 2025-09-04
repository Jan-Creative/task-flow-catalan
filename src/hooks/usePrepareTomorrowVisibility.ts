import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePrepareTomorrow } from '@/hooks/usePrepareTomorrow';

interface DailyReminderPreferences {
  id: string;
  user_id: string;
  is_enabled: boolean;
  reminder_time: string;
  days_of_week: number[];
  timezone: string;
  last_sent_at: string | null;
  custom_title: string | null;
  custom_message: string | null;
}

export const usePrepareTomorrowVisibility = () => {
  const { user } = useAuth();
  const { preparation } = usePrepareTomorrow();
  const [isVisible, setIsVisible] = useState(false);

  // Fetch user's reminder preferences
  const { data: preferences } = useQuery({
    queryKey: ['daily-reminder-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('daily_reminder_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as DailyReminderPreferences | null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  useEffect(() => {
    if (!preferences || !preferences.is_enabled) {
      setIsVisible(false);
      return;
    }

    const checkVisibility = () => {
      // Get timezone from preferences or default to user's timezone
      const timezone = preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Create dates in the user's timezone
      const now = new Date();
      const currentTimeInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      
      const currentDay = currentTimeInTimezone.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentDayAdjusted = currentDay === 0 ? 7 : currentDay; // Convert to 1-7 format
      
      // Check if today is in the configured days
      if (!preferences.days_of_week.includes(currentDayAdjusted)) {
        console.log(`[PrepareVisibility] Not showing: today (${currentDayAdjusted}) not in configured days [${preferences.days_of_week.join(',')}]`);
        setIsVisible(false);
        return;
      }

      // Parse reminder time (handle both HH:mm and HH:mm:ss formats)
      const timeStr = preferences.reminder_time.split(':');
      const hours = parseInt(timeStr[0]);
      const minutes = parseInt(timeStr[1]);
      
      // Create reminder time for today in user's timezone
      const reminderTime = new Date(currentTimeInTimezone);
      reminderTime.setHours(hours, minutes, 0, 0);

      // Check if current time is at or after reminder time
      const isTimeToShow = currentTimeInTimezone >= reminderTime;

      // Check if preparation is already completed
      const isCompleted = preparation?.is_completed || false;

      // Final visibility decision
      const shouldShow = isTimeToShow && !isCompleted;
      
      console.log(`[PrepareVisibility] Current: ${currentTimeInTimezone.toLocaleTimeString()}, Reminder: ${reminderTime.toLocaleTimeString()}, TimeToShow: ${isTimeToShow}, Completed: ${isCompleted}, ShouldShow: ${shouldShow}`);
      
      setIsVisible(shouldShow);
    };

    // Check immediately
    checkVisibility();

    // Check every minute
    const interval = setInterval(checkVisibility, 60 * 1000);

    return () => clearInterval(interval);
  }, [preferences, preparation]);

  return { 
    isVisible, 
    preferences,
    isPreparationCompleted: preparation?.is_completed || false
  };
};