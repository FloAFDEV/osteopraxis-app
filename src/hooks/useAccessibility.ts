import { useEffect, useState } from 'react';

interface AccessibilityState {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'xl';
  focusVisible: boolean;
}

/**
 * Hook pour gérer les préférences d'accessibilité
 */
export const useAccessibility = () => {
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    isHighContrast: false,
    isReducedMotion: false,
    fontSize: 'normal',
    focusVisible: false
  });

  // Détecter les préférences du système
  useEffect(() => {
    const detectSystemPreferences = () => {
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      setAccessibility(prev => ({
        ...prev,
        isReducedMotion,
        isHighContrast
      }));
    };

    detectSystemPreferences();

    // Écouter les changements de préférences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    motionQuery.addListener(detectSystemPreferences);
    contrastQuery.addListener(detectSystemPreferences);

    return () => {
      motionQuery.removeListener(detectSystemPreferences);
      contrastQuery.removeListener(detectSystemPreferences);
    };
  }, []);

  // Gérer la visibilité du focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setAccessibility(prev => ({ ...prev, focusVisible: true }));
      }
    };

    const handleMouseDown = () => {
      setAccessibility(prev => ({ ...prev, focusVisible: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Appliquer les styles d'accessibilité
  useEffect(() => {
    const root = document.documentElement;
    
    if (accessibility.isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibility.isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (accessibility.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    root.setAttribute('data-font-size', accessibility.fontSize);
  }, [accessibility]);

  const toggleHighContrast = () => {
    setAccessibility(prev => ({
      ...prev,
      isHighContrast: !prev.isHighContrast
    }));
  };

  const toggleReducedMotion = () => {
    setAccessibility(prev => ({
      ...prev,
      isReducedMotion: !prev.isReducedMotion
    }));
  };

  const setFontSize = (size: 'normal' | 'large' | 'xl') => {
    setAccessibility(prev => ({
      ...prev,
      fontSize: size
    }));
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return {
    accessibility,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    announceToScreenReader
  };
};