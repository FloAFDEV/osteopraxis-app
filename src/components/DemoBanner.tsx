
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

  useEffect(() => {
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
  }, [user]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 animate-pulse" />
          <div>
            <span className="font-semibold">
              {isTemporaryDemo ? 'Session Démo Temporaire' : 'Mode Démonstration'}
            </span>
            <span className="ml-2 text-blue-100">
              {isTemporaryDemo 
                ? `Données isolées pour votre test • Expire dans ${formatTime(remainingTime)}`
                : 'Toutes les données sont fictives et les modifications ne sont pas sauvegardées'
              }
            </span>
          </div>
          {isTemporaryDemo && (
            <Clock className="h-4 w-4 text-blue-200" />
          )}
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
