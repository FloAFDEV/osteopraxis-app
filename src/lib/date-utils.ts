
import { format, parse } from "date-fns";

/**
 * Format a date object into a string suitable for date input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

/**
 * Format a time object into a string suitable for time input fields (HH:mm)
 */
export const formatTimeForInput = (date: Date): string => {
  return format(date, "HH:mm");
};

/**
 * Parse a date string from an input field (YYYY-MM-DD) into a Date object
 */
export const parseDateFromInput = (dateString: string): Date => {
  return parse(dateString, "yyyy-MM-dd", new Date());
};

/**
 * Format a date object into a localized string (DD/MM/YYYY)
 */
export const formatDateLocalized = (date: Date): string => {
  return format(date, "dd/MM/yyyy");
};

/**
 * Format a date object into a full localized string with day name (lundi 01 janvier 2024)
 */
export const formatDateFullLocalized = (date: Date): string => {
  return format(date, "PPPP");
};

/**
 * Format a date and time for display (DD/MM/YYYY HH:mm)
 */
export const formatDateTimeLocalized = (date: Date): string => {
  return format(date, "dd/MM/yyyy HH:mm");
};

/**
 * Get only the time part from a date (HH:mm)
 */
export const formatTime = (date: Date): string => {
  return format(date, "HH:mm");
};
