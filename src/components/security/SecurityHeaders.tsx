import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Composant pour les en-têtes de sécurité
 * Améliore la sécurité de l'application via les meta tags
 */
export const SecurityHeaders: React.FC = () => {
  return (
    <Helmet>
      {/* Protection contre le clickjacking */}
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      
      {/* Protection MIME type sniffing */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      
      {/* Protection XSS */}
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Politique de référent */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Permissions Policy */}
      <meta 
        httpEquiv="Permissions-Policy" 
        content="geolocation=(), microphone=(), camera=(), payment=(), usb=()" 
      />
      
      {/* Préchargement DNS sécurisé */}
      <link rel="dns-prefetch" href="//jpjuvzpqfirymtjwnier.supabase.co" />
      
      {/* Protection contre les attaques de timing */}
      <meta name="format-detection" content="telephone=no" />
    </Helmet>
  );
};