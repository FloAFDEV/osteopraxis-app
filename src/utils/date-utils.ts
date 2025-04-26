
import { format, toZonedTime } from "date-fns-tz";
import { fr } from "date-fns/locale";

const timeZone = "Europe/Paris";

export function formatAppointmentDate(dateString: string, formatStr = "EEEE d MMMM yyyy 'à' HH:mm") {
  const utcDate = new Date(dateString);
  const parisDate = toZonedTime(utcDate, timeZone);
  return format(parisDate, formatStr, { locale: fr });
}

export function formatAppointmentTime(dateString: string) {
  const utcDate = new Date(dateString);
  const parisDate = toZonedTime(utcDate, timeZone);
  return format(parisDate, "HH:mm", { locale: fr });
}
