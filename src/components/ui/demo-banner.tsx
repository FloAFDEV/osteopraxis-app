import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Database, Trash2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface DemoBannerProps {
  onClearDemo?: () => void;
}

export function DemoBanner({ onClearDemo }: DemoBannerProps) {
  const [remainingTime, setRemainingTime] = useState<string>("");
  const { logout } = useAuth();

  useEffect(() => {
    const updateRemainingTime = async () => {
      try {
        const { demoLocalStorage } = await import('@/services/demo-local-storage');
        const stats = demoLocalStorage.getSessionStats();
        
        if (stats.timeRemaining > 0) {
          const minutes = Math.floor(stats.timeRemaining / (1000 * 60));
          const seconds = Math.floor((stats.timeRemaining % (1000 * 60)) / 1000);
          setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setRemainingTime("Expiré");
        }
      } catch (error) {
        setRemainingTime("--:--");
      }
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClearDemo = async () => {
    try {
      console.log('🗑️ Quitter le mode démo - Début du processus');
      
      // 1️⃣ Nettoyer la session démo locale
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      demoLocalStorage.clearSession();
      console.log('✅ Session démo locale nettoyée');
      
      // 2️⃣ Appeler le callback si fourni (pour nettoyer les queries)
      if (onClearDemo) {
        onClearDemo();
        console.log('✅ Callback onClearDemo exécuté');
      }
      
      // 3️⃣ Déconnexion complète via le contexte d'authentification
      console.log('🔓 Déconnexion utilisateur...');
      await logout();
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage de la session démo:', error);
      // En cas d'erreur, forcer la déconnexion et redirection
      try {
        await logout();
      } catch (logoutError) {
        console.error('❌ Erreur lors de la déconnexion forcée:', logoutError);
        // En dernier recours, redirection manuelle
        window.location.href = '/';
      }
    }
  };

  return (
    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100">
      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 flex-1">
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-600">
            <Database className="h-3 w-3 mr-1" />
            MODE DÉMO
          </Badge>
          <span className="text-sm text-amber-800 dark:text-amber-200">
            Vos données sont temporaires et seront effacées automatiquement
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            <span className="font-mono">{remainingTime}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearDemo}
          className="border-amber-300 text-amber-800 hover:bg-amber-100 ml-3 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900/50"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Quitter le mode démo
        </Button>
      </AlertDescription>
    </Alert>
  );
}