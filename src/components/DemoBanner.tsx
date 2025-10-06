
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DemoService } from "@/services/demo-service";
import { useEffect, useState } from "react";

export const DemoBanner = () => {
  const { user } = useAuth();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isTemporaryDemo, setIsTemporaryDemo] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);

  useEffect(() => {
    const checkDemoSession = async () => {
      try {
        // Vérifier d'abord le mode démo éphémère local
        const { isDemoSession } = await import('@/utils/demo-detection');
        const isDemoMode = await isDemoSession();
        
        if (isDemoMode) {
          const { demoLocalStorage } = await import('@/services/demo-local-storage');
          const stats = demoLocalStorage.getSessionStats();
          setSessionStats(stats);
          setIsTemporaryDemo(true);
          setRemainingTime(stats.timeRemaining);
          
          const interval = setInterval(() => {
            const currentStats = demoLocalStorage.getSessionStats();
            setSessionStats(currentStats);
            setRemainingTime(currentStats.timeRemaining);
            
            // Si la session a expiré, nettoyer
            if (currentStats.timeRemaining <= 0) {
              demoLocalStorage.clearSession();
              setIsTemporaryDemo(false);
              window.location.reload();
            }
          }, 1000);

          return () => clearInterval(interval);
        }
        
        // Fallback vers ancienne méthode si pas de session locale
        if (user?.email && DemoService.isDemoUser(user.email)) {
          const session = DemoService.getCurrentDemoSession();
          if (session) {
            setIsTemporaryDemo(true);
            setRemainingTime(session.remainingTime);
            
            const interval = setInterval(() => {
              const currentSession = DemoService.getCurrentDemoSession();
              if (currentSession) {
                setRemainingTime(currentSession.remainingTime);
              }
            }, 1000);

            return () => clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session démo:', error);
      }
    };

    checkDemoSession();
  }, [user]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start md:items-center gap-3 flex-1">
          <AlertCircle className="h-5 w-5 animate-pulse flex-shrink-0 mt-0.5 md:mt-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm md:text-base">
              {isTemporaryDemo ? 'Session Démo Temporaire' : 'Mode Démonstration'}
            </div>
            <div className="text-xs md:text-sm text-blue-100 mt-1 break-words">
              {isTemporaryDemo 
                ? (
                  <>
                    <span className="block md:inline">Session isolée • {sessionStats?.patientsCount || 0} patients</span>
                    <span className="block md:inline md:ml-2 mt-1 md:mt-0">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Expire dans {formatTime(remainingTime)}
                    </span>
                  </>
                )
                : 'Toutes les données sont fictives et les modifications ne sont pas sauvegardées'
              }
            </div>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          asChild
          className="bg-white text-blue-600 hover:bg-blue-50 w-full md:w-auto flex-shrink-0"
        >
          <Link to="/register" className="flex items-center justify-center gap-2">
            <span className="text-xs md:text-sm">Créer mon compte</span>
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
