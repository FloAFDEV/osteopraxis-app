import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Calendar, FileText, BarChart3, Database, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { hdsDemoService } from "@/services/hds-demo-service";

export default function DebugPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    const status = {
      auth: {
        isAuthenticated,
        user: user ? { id: user.id, email: user.email } : null,
        hasOsteopathId: user?.osteopathId ? true : false
      },
      demo: {
        isDemoModeActive: hdsDemoService.isDemoModeActive(),
        sessionData: hdsDemoService.getCurrentSession()
      },
      localStorage: {
        available: !!window.localStorage,
        quotaUsed: 0
      }
    };

    // Calculer l'usage du localStorage
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      status.localStorage.quotaUsed = Math.round(totalSize / 1024); // KB
    } catch (e) {
      status.localStorage.quotaUsed = -1;
    }

    setSystemStatus(status);
    setSessionActive(hdsDemoService.isDemoModeActive());
  };

  const handleCreateDemoSession = async () => {
    setIsLoading(true);
    try {
      console.log("🎭 Création session démo diagnostic...");
      const session = await hdsDemoService.createDemoSession();
      
      console.log("✅ Session créée:", {
        sessionId: session.sessionId,
        patients: session.patients.length,
        appointments: session.appointments.length
      });
      
      setSessionActive(true);
      await checkSystemStatus();
      toast.success("Session démo créée avec succès");
    } catch (error) {
      console.error("❌ Erreur création session:", error);
      toast.error("Erreur lors de la création de la session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    try {
      await hdsDemoService.clearCurrentSession();
      setSessionActive(false);
      await checkSystemStatus();
      toast.success("Session supprimée");
    } catch (error) {
      console.error("Erreur suppression session:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToPatients = () => {
    navigate("/patients");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Diagnostic Système HDS
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Statut du système */}
            {systemStatus && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Authentification */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Authentification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      {systemStatus.auth.isAuthenticated ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {systemStatus.auth.isAuthenticated ? "Connecté" : "Non connecté"}
                      </span>
                    </div>
                    {systemStatus.auth.user && (
                      <p className="text-xs text-muted-foreground">
                        Email: {systemStatus.auth.user.email}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {systemStatus.auth.hasOsteopathId ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm">
                        {systemStatus.auth.hasOsteopathId ? "Profil ostéopathe configuré" : "Profil ostéopathe manquant"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Session démo */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Session Démo HDS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      {systemStatus.demo.isDemoModeActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm">
                        {systemStatus.demo.isDemoModeActive ? "Session active" : "Aucune session"}
                      </span>
                    </div>
                    {systemStatus.demo.sessionData && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Patients: {systemStatus.demo.sessionData.patients?.length || 0}</p>
                        <p>RDV: {systemStatus.demo.sessionData.appointments?.length || 0}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold">Actions de diagnostic</h3>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {!sessionActive ? (
                  <Button 
                    onClick={handleCreateDemoSession}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Créer session démo
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleClearSession}
                    variant="outline"
                    className="w-full"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Supprimer session
                  </Button>
                )}
                
                <Button 
                  onClick={() => checkSystemStatus()}
                  variant="outline"
                  className="w-full"
                >
                  Actualiser diagnostic
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <Button 
                  onClick={handleGoToDashboard}
                  variant="secondary"
                  className="w-full"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Tester Dashboard
                </Button>
                
                <Button 
                  onClick={handleGoToPatients}
                  variant="secondary"
                  className="w-full"
                >
                  <User className="mr-2 h-4 w-4" />
                  Tester Patients
                </Button>
              </div>
            </div>

            {/* Informations importantes */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Architecture HDS</strong>: Les données sensibles sont stockées localement dans votre navigateur. 
                Si vous n'avez pas de patients locaux, une session démo temporaire sera créée automatiquement.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}