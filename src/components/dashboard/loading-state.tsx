
import React from 'react';
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Chargement des données..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export const ErrorState: React.FC<{ error: string }> = ({ error }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Erreur
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Réessayer
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
