
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
      <Card className="w-full p-6 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 transition-all duration-500 animate-fadeIn">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="relative">
              <div className="absolute animate-ping h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-300 opacity-20"></div>
              <div className="absolute animate-spin h-12 w-12 rounded-full border-t-4 border-b-4 border-blue-500 opacity-60"></div>
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-600 relative z-10" />
            </div>
            <p className="text-lg mt-6 animate-pulse">Chargement des patients...</p>
          </div>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 transition-all duration-300">
        <CardContent className="pt-6">
          <div className="text-center py-10 border border-dashed border-red-300 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-medium text-red-800 dark:text-red-300 mb-2">Erreur de chargement</h3>
            <p className="text-red-600/70 dark:text-red-400/70 mb-6 max-w-md mx-auto">
              {error instanceof Error 
                ? `${error.message}` 
                : "Impossible de récupérer les patients depuis la base de données."}
            </p>
            <Button 
              variant="outline" 
              onClick={onRetry} 
              className="border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-transform hover:scale-105"
            >
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
