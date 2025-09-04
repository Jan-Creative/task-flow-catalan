/**
 * Utility functions for time calculations and formatting
 */

/**
 * Calculates intelligent default start and end times based on current time
 * Rounds to the nearest 15-minute interval and adds 1 hour for end time
 * Falls back to 08:00-09:00 if current time is after 22:00 or before 08:00
 */
export const getIntelligentDefaultTimes = (): { startTime: string; endTime: string } => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // If it's too late (after 22:00) or too early (before 08:00), use morning defaults
  if (currentHour >= 22 || currentHour < 8) {
    return {
      startTime: '08:00',
      endTime: '09:00'
    };
  }
  
  // Round up to next 15-minute interval
  const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;
  
  let startHour = currentHour;
  let startMinutes = roundedMinutes;
  
  // Handle overflow when rounding up (e.g., 59 minutes becomes 60)
  if (startMinutes >= 60) {
    startHour += 1;
    startMinutes = 0;
  }
  
  // Calculate end time (1 hour later)
  let endHour = startHour + 1;
  let endMinutes = startMinutes;
  
  // Handle overflow for end time
  if (endHour >= 23) {
    // If end time would be after 23:00, cap at 22:00-23:00
    return {
      startTime: '22:00',
      endTime: '23:00'
    };
  }
  
  const formatTime = (hour: number, minutes: number): string => {
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return {
    startTime: formatTime(startHour, startMinutes),
    endTime: formatTime(endHour, endMinutes)
  };
};