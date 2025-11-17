import { useEffect, useState } from "react";
import { Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { DemoService } from "@/services/demo-service";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const DemoSessionTimer = () => {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<{
    remainingTime: number;
    sessionId: string;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    // Ne s'afficher que pour les utilisateurs démo
    if (!user?.email || !DemoService.isDemoUser(user.email)) {
      return;
    }

    const updateSessionInfo = async () => {
      const session = await DemoService.getCurrentDemoSession();
      const isExpired = await DemoService.isSessionExpired();
      
      if (session) {
        setSessionInfo({
          remainingTime: session.remainingTime,
          sessionId: session.sessionId,
          isExpired
        });
      }
    };

    // Mise à jour immédiate
    updateSessionInfo();

    // Mise à jour chaque seconde
    const interval = setInterval(updateSessionInfo, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRefresh = async () => {
    window.location.reload();
  };

  if (!sessionInfo || !user?.email || !DemoService.isDemoUser(user.email)) {
    return null;
  }

  const isLowTime = sessionInfo.remainingTime < 5 * 60 * 1000; // Moins de 5 minutes

  return (
    <div className={`
      fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border z-50 min-w-[280px]
      ${sessionInfo.isExpired 
        ? 'bg-destructive text-destructive-foreground' 
        : isLowTime 
          ? 'bg-warning text-warning-foreground' 
          : 'bg-card text-card-foreground'
      }
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {sessionInfo.isExpired ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="font-medium">
            {sessionInfo.isExpired ? 'Session expirée' : 'Session démo temporaire'}
          </div>
          
          <div className="text-sm opacity-90">
            ID: {sessionInfo.sessionId}
          </div>
          
          {sessionInfo.isExpired ? (
            <div className="space-y-2">
              <div className="text-sm">
                Votre session de démonstration a expiré. Les données ont été supprimées automatiquement.
              </div>
              <Button 
                size="sm" 
                onClick={handleRefresh}
                className="w-full"
                variant="secondary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Nouvelle session
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-sm">
                Temps restant: <span className="font-mono">{formatTime(sessionInfo.remainingTime)}</span>
              </div>
              {isLowTime && (
                <div className="text-xs opacity-80">
                  Votre session expire bientôt
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};