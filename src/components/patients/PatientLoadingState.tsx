
import React from "react";
import { AlertCircle, RefreshCw, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PatientFancyLoader from "./PatientFancyLoader";
import { Link } from "react-router-dom";

interface PatientLoadingStateProps {
  isLoading: boolean;
  error: any;
  onRetry: () => void;
  isEmpty?: boolean;
}

const PatientLoadingState: React.FC<PatientLoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
  isEmpty = false
}) => {
  if (isLoading) {
    return (
      <Card className="w-full p-6">
        <PatientFancyLoader message="Chargement des patients..." />
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
  
  if (isEmpty) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-10 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-dashed border-blue-300 dark:border-blue-800">
            <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-blue-800 dark:text-blue-300 mb-2">Aucun patient trouvé</h3>
            <p className="text-blue-600/70 dark:text-blue-400/70 mb-6 max-w-md mx-auto">
              Vous n'avez pas encore de patients dans votre base de données.
              Commencez par en ajouter un !
            </p>
            <Button 
              variant="default" 
              asChild
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Link to="/patients/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter un patient
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
};

export default PatientLoadingState;
