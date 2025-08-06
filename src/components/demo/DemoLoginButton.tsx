import { Button } from "@/components/ui/button";
import { Play, Eye } from "lucide-react";
import { DemoService } from "@/services/demo-service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

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

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Créer/vérifier le compte démo
      const credentials = await DemoService.createDemoAccount();
      
      // Se connecter avec le compte démo
      await login(credentials.email, credentials.password);
      
      toast.success("Connexion démo réussie ! Explorez PatientHub.");
    } catch (error) {
      console.error("Erreur connexion démo:", error);
      toast.error("Erreur lors de la connexion démo");
    } finally {
      setIsLoading(false);
    }
  };

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