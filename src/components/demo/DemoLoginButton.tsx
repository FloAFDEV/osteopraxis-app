import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const { setDemoMode } = useDemo();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await setDemoMode(true);
      navigate('/dashboard');
      toast.success("Mode démo activé", {
        description: "Vous pouvez maintenant tester toutes les fonctionnalités avec des données fictives"
      });
    } catch (error: any) {
      console.error("Erreur activation démo:", error);
      toast.error("Erreur lors de l'activation du mode démo");
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