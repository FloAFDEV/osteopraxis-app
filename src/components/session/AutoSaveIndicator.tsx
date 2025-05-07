
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, RefreshCw } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function AutoSaveIndicator({ isSaving, lastSaved }: AutoSaveIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center text-xs text-muted-foreground">
            {isSaving ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="h-3 w-3 mr-1 text-green-500" />
                <span>Sauvegardé à {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : (
              <span>Pas encore sauvegardé</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isSaving ? (
            "Sauvegarde automatique en cours..."
          ) : lastSaved ? (
            `Dernière sauvegarde: ${lastSaved.toLocaleDateString()} ${lastSaved.toLocaleTimeString()}`
          ) : (
            "Aucune sauvegarde effectuée"
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
