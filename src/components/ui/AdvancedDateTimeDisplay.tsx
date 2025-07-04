import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

const timeZone = "Europe/Paris";

interface LocationInfo {
  city?: string;
  loading: boolean;
  error?: string;
}

interface FlipDigitProps {
  value: string;
  label: string;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ value, label }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      // Délai pour l'animation flip
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className="relative inline-block" aria-label={`${label}: ${value}`}>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={displayValue}
            initial={{ rotateX: isAnimating ? -90 : 0, opacity: isAnimating ? 0 : 1 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeInOut",
              type: "spring",
              stiffness: 200
            }}
            className="inline-block font-mono text-lg font-bold"
            style={{ transformOrigin: "center center" }}
          >
            {displayValue}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

interface TimeSegmentProps {
  hours: string;
  minutes: string;
  seconds: string;
}

const TimeSegment: React.FC<TimeSegmentProps> = ({ hours, minutes, seconds }) => {
  return (
    <div className="flex items-center gap-1 font-mono text-lg font-bold" role="timer" aria-live="polite">
      <FlipDigit value={hours} label="heures" />
      <span className="animate-pulse text-muted-foreground">:</span>
      <FlipDigit value={minutes} label="minutes" />
      <span className="animate-pulse text-muted-foreground">:</span>
      <FlipDigit value={seconds} label="secondes" />
    </div>
  );
};

const useGeolocation = () => {
  const [location, setLocation] = useState<LocationInfo>({ loading: false });

  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      // Utilisation de BigDataCloud (gratuit, sans clé API)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`
      );
      
      if (!response.ok) throw new Error('Géolocalisation échouée');
      
      const data = await response.json();
      const city = data.city || data.locality || data.principalSubdivision;
      
      setLocation({ 
        city: city || undefined, 
        loading: false 
      });
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      setLocation({ 
        loading: false, 
        error: 'Localisation indisponible' 
      });
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ loading: false, error: 'Géolocalisation non supportée' });
      return;
    }

    setLocation({ loading: true });
    
    const options = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000 // Cache pendant 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocation({ 
          loading: false, 
          error: 'Permission refusée' 
        });
      },
      options
    );
  }, [reverseGeocode]);

  return location;
};

export function AdvancedDateTimeDisplay() {
  const [now, setNow] = useState<Date>(() => toZonedTime(new Date(), timeZone));
  const location = useGeolocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(toZonedTime(new Date(), timeZone));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const dateDisplay = useMemo(() => 
    format(now, "PPPP", { locale: fr }), 
    [now]
  );

  const timeComponents = useMemo(() => {
    const timeStr = format(now, "HH:mm:ss", { locale: fr });
    const [hours, minutes, seconds] = timeStr.split(':');
    return { hours, minutes, seconds };
  }, [now]);

  const LocationBadge = () => {
    if (location.loading) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground"
        >
          <MapPin className="h-3 w-3 animate-pulse" />
          <span>Localisation...</span>
        </motion.div>
      );
    }

    if (location.city) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
        >
          <MapPin className="h-3 w-3" />
          <span>{location.city}</span>
        </motion.div>
      );
    }

    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>Heure de Paris</span>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden md:flex flex-col items-center gap-2 p-4 rounded-lg bg-card border shadow-sm select-none"
      role="banner"
      aria-label="Affichage de la date et heure actuelles"
    >
      {/* Date complète */}
      <div className="text-sm font-medium text-muted-foreground text-center">
        {dateDisplay} à
      </div>
      
      {/* Heure avec animation flip */}
      <TimeSegment 
        hours={timeComponents.hours}
        minutes={timeComponents.minutes}
        seconds={timeComponents.seconds}
      />
      
      {/* Badge de localisation */}
      <LocationBadge />
    </motion.div>
  );
}

// Version compacte pour usage dans header/navbar
export function CompactAdvancedDateTime() {
  const [now, setNow] = useState<Date>(() => toZonedTime(new Date(), timeZone));
  const location = useGeolocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(toZonedTime(new Date(), timeZone));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const timeComponents = useMemo(() => {
    const timeStr = format(now, "HH:mm:ss", { locale: fr });
    const [hours, minutes, seconds] = timeStr.split(':');
    return { hours, minutes, seconds };
  }, [now]);

  const dateDisplay = useMemo(() => 
    format(now, "PPPP 'à'", { locale: fr }), 
    [now]
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 text-sm select-none"
      title={`${dateDisplay} ${format(now, "HH:mm:ss")} - Timezone: Europe/Paris`}
    >
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-xs">
          {location.city || "Paris"}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">{dateDisplay}</span>
        <TimeSegment 
          hours={timeComponents.hours}
          minutes={timeComponents.minutes}
          seconds={timeComponents.seconds}
        />
      </div>
    </motion.div>
  );
}