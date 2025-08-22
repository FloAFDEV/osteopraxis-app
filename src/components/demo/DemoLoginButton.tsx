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
        // Créer un compte démo temporaire unique
        const { email, password, sessionId } = await DemoService.createDemoAccount();
        
        // Se connecter avec le compte démo temporaire
        await login(email, password);
        
        toast.success(`Session démo créée (${sessionId})`, {
          description: "Vos données sont isolées et expireront dans 30 minutes"
        });
      } catch (error: any) {
        console.error("Erreur connexion démo:", error);
        toast.error(error?.message || "Erreur lors de la création de la session démo");
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