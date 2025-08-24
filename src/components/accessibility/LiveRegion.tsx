import React, { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  polite?: boolean;
  clearDelay?: number;
}

/**
 * Composant Live Region pour les annonces aux lecteurs d'écran
 * Utilisé pour notifier les changements d'état aux utilisateurs malvoyants
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({ 
  message, 
  polite = true, 
  clearDelay = 5000 
}) => {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      
      if (clearDelay > 0) {
        const timer = setTimeout(() => {
          setCurrentMessage('');
        }, clearDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [message, clearDelay]);

  return (
    <div
      role="status"
      aria-live={polite ? 'polite' : 'assertive'}
      aria-atomic="true"
      className="sr-only"
      aria-label="Annonces système"
    >
      {currentMessage}
    </div>
  );
};