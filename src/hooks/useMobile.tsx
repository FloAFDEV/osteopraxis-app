
import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment 
    if (typeof window === 'undefined') {
      return;
    }

    // Define the media query
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    
    // Initial setup
    setIsMobile(mediaQuery.matches);
    
    // Define the callback
    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleResize);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);
  
  return isMobile;
}
