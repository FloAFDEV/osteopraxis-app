
/**
 * Date formatting utilities for the application
 */

/**
 * Format a date object to YYYY-MM-DD string format for input elements
 * @param date Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a time string for input elements
 * @param time Time string to format
 * @returns Formatted time string in HH:MM format
 */
export function formatTimeForInput(time: string): string {
  if (!time) return '';
  // If time already has the correct format, return it
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return time.substring(0, 5); // Return only HH:MM part
  }
  return time;
}
