import React from 'react';

/**
 * Composant Skip to Content pour l'accessibilité
 * Permet aux utilisateurs de lecteurs d'écran de passer directement au contenu principal
 */
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
      aria-label="Passer au contenu principal"
    >
      Aller au contenu principal
    </a>
  );
};