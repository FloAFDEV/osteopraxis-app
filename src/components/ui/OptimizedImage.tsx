import React, { useState, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/usePerformanceOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
}

/**
 * Composant d'image optimisé pour Lighthouse
 * - Lazy loading automatique
 * - Dimensionnement approprié
 * - Fallback en cas d'erreur
 * - Optimisation LCP pour les images prioritaires
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  priority = false,
  quality = 85,
  className,
  width,
  height,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : '');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const { hasIntersected } = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px 0px', // Précharger 50px avant l'entrée dans le viewport
  });

  // Charger l'image quand elle entre dans le viewport (sauf si prioritaire)
  React.useEffect(() => {
    if ((hasIntersected || priority) && !imageSrc) {
      setImageSrc(src);
    }
  }, [hasIntersected, priority, src, imageSrc]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setImageError(true);
    if (fallbackSrc) {
      setImageSrc(fallbackSrc);
      setImageError(false);
    }
  };

  // Styles pour le lazy loading
  const containerClass = `relative overflow-hidden ${className || ''}`;
  const imgClass = `transition-opacity duration-300 ${
    isLoading ? 'opacity-0' : 'opacity-100'
  }`;

  // Placeholder pendant le chargement
  const placeholder = (
    <div 
      className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center"
      style={{ width, height }}
    >
      <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
    </div>
  );

  return (
    <div ref={imgRef} className={containerClass} style={{ width, height }}>
      {isLoading && placeholder}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={imgClass}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
      
      {imageError && !fallbackSrc && (
        <div 
          className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground text-sm"
          style={{ width, height }}
        >
          Image non disponible
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;