
import { Check, Clock, Save, X } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export function AutoSaveIndicator({ status, className = "" }: AutoSaveIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm transition-opacity ${className}`}>
      {status === 'saving' && (
        <>
          <Clock className="h-3.5 w-3.5 animate-pulse text-amber-500" />
          <span className="text-amber-500">Sauvegarde en cours...</span>
        </>
      )}
      
      {status === 'saved' && (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span className="text-green-500">Sauvegardé</span>
        </>
      )}
      
      {status === 'error' && (
        <>
          <X className="h-3.5 w-3.5 text-destructive" />
          <span className="text-destructive">Erreur de sauvegarde</span>
        </>
      )}
    </div>
  );
}
