
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Chargement en cours..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="animate-spin">
        <Loader2 className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
