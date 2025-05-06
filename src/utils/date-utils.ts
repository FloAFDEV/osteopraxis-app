
import { format, parseISO } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { fr } from "date-fns/locale";

const timeZone = "Europe/Paris";

// Function to convert UTC date to Paris time for display
export function formatAppointmentDate(dateString: string, formatStr = "EEEE d MMMM yyyy 'à' HH:mm") {
  try {
    // Ensure we have a valid date
    const utcDate = parseISO(dateString);
    if (isNaN(utcDate.getTime())) {
      console.warn(`formatAppointmentDate: Invalid date: "${dateString}"`);
      return "Date invalide";
    }
    
    // Convert to Paris timezone
    const parisDate = toZonedTime(utcDate, timeZone);
    return format(parisDate, formatStr, { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return "Erreur de date";
  }
}

export function formatAppointmentTime(dateString: string) {
  try {
    const utcDate = parseISO(dateString);
    if (isNaN(utcDate.getTime())) {
      return "??:??";
    }
    const parisDate = toZonedTime(utcDate, timeZone);
    return format(parisDate, "HH:mm", { locale: fr });
  } catch (error) {
    console.error("Error formatting time:", error, dateString);
    return "??:??";
  }
}

// Function to convert local time to UTC for storage
export function convertLocalToUTC(date: Date | string): string {
  if (typeof date === 'string') {
    // If it's already a string, parse it first
    date = new Date(date);
  }
  
  // Use fromZonedTime to convert from local timezone to UTC
  return fromZonedTime(date, timeZone).toISOString();
}

// Function to convert UTC time to local time
export function convertUTCToLocal(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Use toZonedTime to convert from UTC to local timezone
  return toZonedTime(dateObj, timeZone);
}

// Format date in French format (jour/mois/année)
export function formatDateFR(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error("Error formatting date in French format:", error);
    return "Date invalide";
  }
}

// Format date and time in French format
export function formatDateTimeFR(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch (error) {
    console.error("Error formatting date and time in French format:", error);
    return "Date/heure invalide";
  }
}
