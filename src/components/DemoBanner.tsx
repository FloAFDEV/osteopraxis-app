
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";

export const DemoBanner = () => {
  const { isDemoMode, setDemoMode } = useDemo();

  const handleExitDemo = () => {
    setDemoMode(false);
    localStorage.removeItem('demo_mode');
  };

  if (!isDemoMode) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 animate-pulse" />
          <div>
            <span className="font-semibold">
              MODE DÉMO - DONNÉES DE TEST UNIQUEMENT
            </span>
            <span className="ml-2 text-amber-100">
              Vos modifications sont sauvegardées localement pour tester toutes les fonctionnalités
            </span>
          </div>
          <Database className="h-4 w-4 text-amber-200" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleExitDemo}
            className="bg-white/20 text-white hover:bg-white/30 border-white/30"
          >
            Quitter la démo
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            asChild
            className="bg-white text-orange-600 hover:bg-orange-50"
          >
            <Link to="/register" className="flex items-center gap-2">
              Créer mon compte
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
