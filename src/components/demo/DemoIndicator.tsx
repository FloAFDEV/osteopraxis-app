import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Crown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface DemoIndicatorProps {
  className?: string;
  showCTA?: boolean;
}

export const DemoIndicator = ({ className = "", showCTA = true }: DemoIndicatorProps) => {
  return (
    <div className={`bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-500/20 rounded-full p-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/50">
                MODE DÉMO
              </Badge>
              <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-200">
              Vous explorez PatientHub avec des données fictives.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-300/80 mt-1">
              Les modifications sont limitées et les données sont réinitialisées quotidiennement.
            </p>
          </div>
        </div>
        
        {showCTA && (
          <div className="flex flex-col gap-2 ml-auto">
            <Button 
              asChild
              size="sm" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 whitespace-nowrap"
            >
              <Link to="/register" className="flex items-center gap-2">
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-amber-600 dark:text-amber-300/70 text-center">
              100% gratuit • Aucun engagement
            </p>
          </div>
        )}
      </div>
    </div>
  );
};