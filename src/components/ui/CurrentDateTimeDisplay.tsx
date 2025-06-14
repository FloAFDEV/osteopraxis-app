
import React from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

const timeZone = "Europe/Paris";

function getCurrentParisDate() {
  const now = new Date();
  return toZonedTime(now, timeZone);
}

export function CurrentDateTimeDisplay() {
  const [now, setNow] = React.useState<Date>(getCurrentParisDate());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(getCurrentParisDate());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Exemple: mardi 11 juin 2025 - 14:25:12
  const display = format(now, "PPPP 'à' HH:mm:ss", { locale: fr });

  return (
    <span 
      className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100/60 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 text-xs font-semibold select-none"
      title="Heure de Paris (été/hiver gérée automatiquement)"
    >
      <span className="i-lucide-clock mr-1" /> {display}
    </span>
  );
}
