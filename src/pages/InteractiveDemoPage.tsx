import { useEffect, useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { DemoService } from "@/services/demo-service";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InteractiveDemoPage() {
  const { isDemoMode } = useDemo();
  const { isAuthenticated, user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartDemo = async () => {
    setIsLoading(true);
    try {
      // Directement se connecter avec les identifiants démo (pas besoin de créer)
      await login("demo@patienthub.com", "demo123456");
      
      toast.success("Connexion en mode démo réussie !");
    } catch (error) {
      console.error("Erreur connexion démo:", error);
      toast.error("Erreur lors de la connexion en mode démo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Rediriger si déjà connecté (notamment en mode démo)
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Démo Interactive PatientHub
            </CardTitle>
            <p className="text-muted-foreground mt-4">
              Découvrez toutes les fonctionnalités de PatientHub avec des données de démonstration.
              L'application sera identique à la version réelle, mais avec des données fictives.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button 
                onClick={handleStartDemo}
                disabled={isLoading}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Commencer la démo"
                )}
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Que contient cette démo ?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gestion complète des patients</li>
                <li>• Planning des rendez-vous</li>
                <li>• Facturation et suivi</li>
                <li>• Outils d'analyse et rapports</li>
                <li>• Interface complète d'administration</li>
              </ul>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              <p>
                Toutes les données sont fictives et seront réinitialisées à chaque session.
                Aucune donnée réelle ne sera utilisée ou stockée.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}