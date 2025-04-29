
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { fr } from "date-fns/locale";

const timeZone = "Europe/Paris";

export function formatAppointmentDate(dateString: string, formatStr = "EEEE d MMMM yyyy 'à' HH:mm") {
  try {
    // Ensure we have a valid date
    const utcDate = new Date(dateString);
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
    const utcDate = new Date(dateString);
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
