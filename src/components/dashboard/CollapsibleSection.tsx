import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  storageKey?: string; // Pour persister l'état dans localStorage
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
  className = '',
  storageKey,
}) => {
  // Initialiser l'état depuis localStorage si storageKey est fourni
  const getInitialState = () => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return defaultOpen;
  };

  const [isOpen, setIsOpen] = useState(getInitialState);

  const toggleSection = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    // Sauvegarder l'état dans localStorage si storageKey est fourni
    if (storageKey) {
      localStorage.setItem(storageKey, String(newState));
    }
  };

  return (
    <Card className={`hover-scale ${className}`}>
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
        onClick={toggleSection}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection();
          }
        }}
        aria-expanded={isOpen}
        aria-label={`${title} - ${isOpen ? 'Cliquer pour réduire' : 'Cliquer pour déplier'}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            {icon}
            {title}
          </h2>
          <div className="flex items-center">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};
