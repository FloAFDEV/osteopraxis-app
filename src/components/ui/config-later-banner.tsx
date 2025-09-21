import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Settings, Shield, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";

interface ConfigLaterBannerProps {
  onConfigureNow?: () => void;
  onDismiss?: () => void;
}

export function ConfigLaterBanner({ onConfigureNow, onDismiss }: ConfigLaterBannerProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const { isDemoMode } = useDemo();

  const handleConfigureNow = () => {
    if (onConfigureNow) {
      onConfigureNow();
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  // Ne pas afficher en mode démo
  if (dismissed || isDemoMode) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100">
      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Configuration du stockage local sécurisé recommandée pour une meilleure sécurité des données
          </span>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleConfigureNow}
            className="border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-200 dark:hover:bg-blue-900/50"
          >
            <Settings className="h-3 w-3 mr-1" />
            Configurer maintenant
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}