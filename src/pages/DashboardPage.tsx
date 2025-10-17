
import React, { useEffect, useState } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { DemoGuide } from "@/components/demo/DemoGuide";
import { WelcomeMessage } from "@/components/welcome/WelcomeMessage";
import { HDSStatusBanner } from "@/components/storage/HDSStatusBanner";
import { HDSStatusWidget } from "@/components/dashboard/HDSStatusWidget";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { isDemoSession } from "@/utils/demo-detection";
import { useCabinets } from "@/hooks/useCabinets";
import { useHybridStorageContext } from "@/contexts/HybridStorageContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isConfigured, isLoading: storageLoading } = useHybridStorageContext();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);
  
  // Vérifier le mode démo
  useEffect(() => {
    isDemoSession().then(setIsDemoMode);
  }, []);

  // Vérifier si on doit rediriger vers la configuration
  useEffect(() => {
    const checkStorageConfig = async () => {
      const isDemo = await isDemoSession();
      const skipped = localStorage.getItem('hds-storage-skip') === 'true';
      
      // Rediriger si pas en mode démo, pas configuré, pas ignoré, et chargement terminé
      if (!isDemo && !isConfigured && !skipped && !storageLoading) {
        console.log('📋 Redirection vers /configuration - Stockage non configuré');
        setShouldRedirect(true);
        navigate('/configuration', { replace: true });
      }
    };
    
    if (!storageLoading) {
      checkStorageConfig();
    }
  }, [isConfigured, storageLoading, navigate]);
  
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

  // Afficher un loader pendant la vérification initiale
  if (storageLoading || shouldRedirect) {
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
        
        {/* Bannière de statut HDS pour utilisateurs connectés */}
        <HDSStatusBanner />
        
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
