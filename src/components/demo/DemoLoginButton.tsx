import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { DemoService } from "@/services/demo-service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { withRateLimit } from "@/services/security/rate-limiting";

interface DemoLoginButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
}

export const DemoLoginButton = ({ 
  variant = "outline", 
  size = "default", 
  className = "",
  showIcon = true 
}: DemoLoginButtonProps) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = withRateLimit(
    'demo_login',
    async () => {
      setIsLoading(true);
      try {
        console.log('🎭 Début connexion démo');
        
        // Créer directement une session demo locale (mode pur)
        const { demoLocalStorage } = await import('@/services/demo-local-storage');
        
        // Créer une session démo locale directement
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
        
        console.log('🎭 Session démo locale créée avec succès');
        toast.success("Mode démo activé !");
        
        // Forcer le rechargement pour que la détection de mode fonctionne
        window.location.href = '/dashboard';
        
      } catch (error) {
        console.error('❌ Erreur connexion démo:', error);
        toast.error("Erreur lors de l'activation du mode démo");
      } finally {
        setIsLoading(false);
      }
    },
    { maxRequests: 3, windowMs: 60_000, blockDurationMs: 2 * 60_000 }
  );

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDemoLogin}
      disabled={isLoading}
      className={`${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
          Connexion...
        </>
      ) : (
        <>
          {showIcon && <Eye className="w-4 h-4 mr-2" />}
          Démo gratuite
        </>
      )}
    </Button>
  );
};