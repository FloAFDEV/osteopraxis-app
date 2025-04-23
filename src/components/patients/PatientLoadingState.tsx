
import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientLoadingStateProps {
  isLoading: boolean;
  error: Error | string | null | unknown;
  onRetry?: () => void;
  children?: React.ReactNode; // Add support for children
}

export function PatientLoadingState({ isLoading, error, onRetry, children }: PatientLoadingStateProps) {
  // If not loading and no error, render children
  if (!isLoading && !error) {
    return <>{children}</>;
  }
  
  // Convert error to string if it's an Error object
  const errorMessage = error instanceof Error ? error.message : 
                      typeof error === 'string' ? error : 
                      'Une erreur est survenue';
  
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-muted-foreground">Chargement des patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="font-medium text-lg mb-1">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  return null;
}
