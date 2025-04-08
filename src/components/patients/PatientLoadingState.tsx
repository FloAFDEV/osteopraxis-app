
import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PatientLoadingStateProps {
  isLoading: boolean;
  error: any;
  onRetry: () => void;
}

const PatientLoadingState: React.FC<PatientLoadingStateProps> = ({
  isLoading,
  error,
  onRetry
}) => {
  if (isLoading) {
    return (
      <Card className="w-full p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg">Chargement des patients...</p>
          </div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-10 bg-red-50 dark:bg-red-950/20 rounded-lg border border-dashed border-red-300 dark:border-red-800">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-red-800 dark:text-red-300 mb-2">Erreur de chargement</h3>
            <p className="text-red-600/70 dark:text-red-400/70 mb-6 max-w-md mx-auto">
              {error instanceof Error 
                ? `${error.message}` 
                : "Impossible de récupérer les patients depuis la base de données."}
            </p>
            <Button 
              variant="outline" 
              onClick={onRetry} 
              className="border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
};

export default PatientLoadingState;
