import React from 'react';
import { useMode } from '@/contexts/ModeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Cloud, HardDrive } from 'lucide-react';

export function ModeSelector() {
  const { mode, setMode, isDemo, isLocal } = useMode();

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-muted-foreground">Mode:</div>
      
      {isDemo && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Monitor className="h-3 w-3 mr-1" />
          Démo
        </Badge>
      )}
      
      {isLocal && (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <HardDrive className="h-3 w-3 mr-1" />
          Local (HDS)
        </Badge>
      )}
      
      <div className="flex gap-1">
        {!isDemo && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMode('demo')}
            className="text-xs"
          >
            Démo
          </Button>
        )}
        
        {!isLocal && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMode('local')}
            className="text-xs"
          >
            Local
          </Button>
        )}
      </div>
    </div>
  );
}