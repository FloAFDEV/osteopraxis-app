
import React, { useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { DemoGuide } from "@/components/demo/DemoGuide";
import { WelcomeMessage } from "@/components/welcome/WelcomeMessage";
import { HDSStatusWidget } from "@/components/dashboard/HDSStatusWidget";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSessionMode } from "@/contexts/SessionModeContext";
import { useCabinets } from "@/hooks/useCabinets";
import { useHybridStorageContext } from "@/contexts/HybridStorageContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConfigured, isLoading: storageLoading } = useHybridStorageContext();
  const { isDemoMode } = useSessionMode();

  // 🆘 Ne plus rediriger - Utilisation du stockage survivant si non configuré
  // Le HDSStatusBanner se chargera d'informer et d'inviter à configurer
  
  // Log diagnostic simple pour tracer le parcours utilisateur
  useEffect(() => {
    if (user) {
      console.log("📊 DashboardPage - Utilisateur connecté:", {
        email: user.email,
        osteopathId: user.osteopathId,
        hasFirstName: !!user.firstName
      });
    }
  }, [user]);

  // Afficher un loader seulement pendant le chargement initial
  if (storageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // ✅ ÉTAPE 1 : Charger les cabinets UNIQUEMENT après validation de la configuration HDS
  const { data: cabinets, isLoading: cabinetsLoading } = useCabinets();

  return (
    <Layout>
      <GradientBackground 
        variant="subtle" 
        className="p-3 md:p-6 rounded-xl animate-fade-in"
      >
        <DemoGuide />
        
        {/* Widget HDS pour utilisateurs connectés */}
        {!isDemoMode && (
          <div className="mb-6">
            <HDSStatusWidget />
          </div>
        )}

        {/* Message de bienvenue pour nouveaux utilisateurs */}
        {!cabinetsLoading && (
          <WelcomeMessage 
            hasCabinets={!!(cabinets && cabinets.length > 0)}
            hasPatients={false} // TODO: Ajouter le check des patients quand nécessaire
            userName={user?.firstName}
          />
        )}
        
        <Dashboard />
      </GradientBackground>
    </Layout>
  );
};

export default DashboardPage;
