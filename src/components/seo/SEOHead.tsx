import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = "PatientHub - Logiciel de gestion pour ostéopathes",
  description = "Solution complète pour ostéopathes avec gestion des patients, rendez-vous, facturation et optimisation automatique. Essai gratuit 14 jours.",
  keywords = "logiciel ostéopathe, gestion cabinet ostéopathie, patients, rendez-vous, facturation, RGPD",
  canonicalUrl,
  ogImage = "/lovable-uploads/3b270ea6-782e-4b52-880c-9c999d2379bf.png",
  ogType = "website",
  articlePublishedTime,
  articleModifiedTime,
  noIndex = false,
  noFollow = false,
  structuredData
}) => {
  const fullTitle = title.includes("PatientHub") ? title : `${title} | PatientHub`;
  const robots = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="PatientHub" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Article specific */}
      {articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};