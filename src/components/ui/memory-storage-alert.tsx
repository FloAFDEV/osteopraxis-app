import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { isUsingMemoryFallback } from '@/services/hybrid-data-adapter/local-adapters';

export function MemoryStorageAlert() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkMemoryMode = async () => {
      try {
        const usingMemory = isUsingMemoryFallback();
        const dismissed = sessionStorage.getItem('memory-storage-alert-dismissed') === 'true';
        setIsVisible(usingMemory && !dismissed);
        setIsDismissed(dismissed);
      } catch (error) {
        console.warn('Error checking memory fallback mode:', error);
      }
    };

    checkMemoryMode();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('memory-storage-alert-dismissed', 'true');
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-4 border-warning/20 bg-warning/5">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <div className="pr-4">
          <strong className="text-warning">Mode Récupération Actif:</strong>{' '}
          Le stockage local sécurisé n'est pas disponible. L'application utilise un stockage temporaire. 
          Les données seront perdues au rechargement. 
          <a href="/storage-diagnostic" className="underline ml-1">Diagnostiquer</a>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="flex-shrink-0 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}