
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface LiveClockProps {
  className?: string;
  showDate?: boolean;
  showSeconds?: boolean;
}

export function LiveClock({ 
  className, 
  showDate = true, 
  showSeconds = false 
}: LiveClockProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const timeZone = 'Europe/Paris';

  useEffect(() => {
    // Mettre à jour l'heure chaque seconde
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Nettoyer l'intervalle lors du démontage
    return () => clearInterval(interval);
  }, []);

  // Convertir en heure locale de Paris
  const localTime = toZonedTime(currentTime, timeZone);
  
  // Format pour l'heure avec ou sans secondes
  const timeFormat = showSeconds ? 'HH:mm:ss' : 'HH:mm';
  
  // Format pour la date et l'heure
  const dateTimeFormat = showDate 
    ? `EEEE d MMMM${showSeconds ? ' à ' + timeFormat : ' à ' + timeFormat}`
    : timeFormat;

  return (
    <div className={cn(
      "flex items-center space-x-1 text-muted-foreground transition-colors", 
      className
    )}>
      <time 
        className="tabular-nums"
        dateTime={currentTime.toISOString()}
        aria-label="Date et heure actuelles"
      >
        {format(localTime, dateTimeFormat, { locale: fr })}
      </time>
    </div>
  );
}
