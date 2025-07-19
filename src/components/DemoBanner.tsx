
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const DemoBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 animate-pulse" />
          <div>
            <span className="font-semibold">Mode Démonstration</span>
            <span className="ml-2 text-blue-100">
              Toutes les données sont fictives et les modifications ne sont pas sauvegardées
            </span>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          asChild
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          <Link to="/register" className="flex items-center gap-2">
            Créer mon compte
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
