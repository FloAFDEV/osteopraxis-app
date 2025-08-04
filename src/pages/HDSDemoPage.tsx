import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Calendar, FileText, BarChart3, Clock, Database } from "lucide-react";
import { toast } from "sonner";
import { hdsDemoService } from "@/services/hds-demo-service";

export default function HDSDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si une session est déjà active
    setSessionActive(hdsDemoService.isDemoModeActive());
  }, []);

  const handleStartDemo = async () => {
    setIsLoading(true);
    try {
      console.log("🎭 Démarrage de la session démo HDS...");
      
      // Créer une nouvelle session démo avec des données fictives
      const session = await hdsDemoService.createDemoSession();
      
      console.log("✅ Session démo créée:", {
        sessionId: session.sessionId,
        patients: session.patients.length,
        appointments: session.appointments.length,
        invoices: session.invoices.length
      });
      
      setSessionActive(true);
      toast.success("Mode démo activé ! Vous pouvez maintenant explorer l'application.");
      
      // Rediriger vers le dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Erreur lors du démarrage de la démo:", error);
      toast.error("Erreur lors du démarrage de la démo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueDemo = () => {
    navigate("/dashboard");
  };

  const handleClearDemo = async () => {
    try {
      await hdsDemoService.clearCurrentSession();
      setSessionActive(false);
      toast.success("Session démo terminée");
    } catch (error) {
      console.error("Erreur lors de la suppression de la session:", error);
      toast.error("Erreur lors de la suppression de la session");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <Badge variant="outline" className="text-sm">
                Architecture HDS
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold">
              Démo Interactive PatientHub
            </CardTitle>
            <p className="text-muted-foreground mt-4 text-lg">
              Découvrez l'interface complète avec des données de démonstration stockées localement.
              Architecture sécurisée conforme aux exigences HDS (Hébergement de Données de Santé).
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {sessionActive ? (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    Session démo active
                  </h3>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    Vos données de démonstration sont chargées et prêtes à être explorées.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleContinueDemo}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Continuer la démo
                  </Button>
                  <Button 
                    onClick={handleClearDemo}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Terminer la démo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <Button 
                  onClick={handleStartDemo}
                  disabled={isLoading}
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initialisation...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Démarrer la démo HDS
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Création d'une session temporaire avec données fictives (auto-suppression après 30 min)
                </p>
              </div>
            )}

            {/* Fonctionnalités disponibles */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Fonctionnalités démo
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: User, label: "5 patients fictifs", color: "text-blue-500" },
                    { icon: Calendar, label: "8 rendez-vous", color: "text-green-500" },
                    { icon: FileText, label: "Facturation", color: "text-purple-500" },
                    { icon: BarChart3, label: "Statistiques", color: "text-orange-500" }
                  ].map(({ icon: Icon, label, color }, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Architecture HDS
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Stockage local sécurisé (SQLite dans le navigateur)</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Données sensibles jamais envoyées vers le cloud</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Auto-suppression après 30 minutes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations importantes */}
            <div className="bg-muted/30 p-6 rounded-lg border border-dashed">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold">À propos de cette démo</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Toutes les données sont fictives et générées automatiquement</li>
                    <li>• La session se supprime automatiquement après 30 minutes d'inactivité</li>
                    <li>• Aucune donnée réelle n'est utilisée ou stockée de manière permanente</li>
                    <li>• L'architecture HDS garantit la sécurité des données en production</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}