/**
 * Utility functions for time calculations and formatting
 */

/**
 * Calculates intelligent default start and end times based on current time
 * Rounds to the nearest 15-minute interval and adds 1 hour for end time
 * Now supports full 24-hour range with cross-midnight blocks
 */
export const getIntelligentDefaultTimes = (): { startTime: string; endTime: string } => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Round up to next 15-minute interval
  const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;
  
  let startHour = currentHour;
  let startMinutes = roundedMinutes;
  
  // Handle overflow when rounding up (e.g., 59 minutes becomes 60)
  if (startMinutes >= 60) {
    startHour += 1;
    startMinutes = 0;
  }
  
  // Handle hour overflow (24:00 becomes 00:00)
  if (startHour >= 24) {
    startHour = 0;
  }
  
  // Calculate end time (1 hour later)
  let endHour = startHour + 1;
  let endMinutes = startMinutes;
  
  // Handle hour overflow for end time
  if (endHour >= 24) {
    endHour = endHour - 24;
  }
  
  const formatTime = (hour: number, minutes: number): string => {
    return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return {
    startTime: formatTime(startHour, startMinutes),
    endTime: formatTime(endHour, endMinutes)
  };
};

/**
 * Generates a list of 24-hour time options with 15-minute intervals
 */
export const generateTimeOptions = (): string[] => {
  return Array.from({ length: 24 * 4 }, (_, i) => {
    const totalMinutes = i * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });
};

/**
 * Validates if end time is after start time (supporting cross-midnight)
 */
export const validateTimeRange = (startTime: string, endTime: string): { isValid: boolean; durationMinutes: number } => {
  const [startHour, startMinutes] = startTime.split(':').map(Number);
  const [endHour, endMinutes] = endTime.split(':').map(Number);
  const startTotalMinutes = startHour * 60 + startMinutes;
  let endTotalMinutes = endHour * 60 + endMinutes;
  
  // If end time is earlier than start time, assume it's the next day
  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }
  
  const durationMinutes = endTotalMinutes - startTotalMinutes;
  
  return {
    isValid: durationMinutes >= 15, // Minimum 15 minutes
    durationMinutes
  };
};