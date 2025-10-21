
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

  // 🔒 Le FailFastStorageGuard bloquera l'accès si HDS non configuré
  // Conformité HDS stricte : aucun accès aux données sans chiffrement local
  
  // Log diagnostic simple pour tracer le parcours utilisateur
  useEffect(() => {
    if (user) {
      console.log("📊 DashboardPage - Utilisateur connecté:", {
        email: user.email,
        osteopathId: user.osteopathId,
        hasFirstName: !!user.firstName,
        isDemoMode // 🔍 DEBUG: Vérifier la détection du mode démo
      });
    }
  }, [user, isDemoMode]);

  // ✅ Charger les cabinets (le stockage se configure en arrière-plan)
  const { data: cabinets, isLoading: cabinetsLoading } = useCabinets();

  return (
    <Layout>
      <GradientBackground 
        variant="subtle" 
        className="p-3 md:p-6 rounded-xl animate-fade-in"
      >
        <DemoGuide />
        
        {/* Widget HDS - gère déjà l'affichage conditionnel en interne */}
        <div className="mb-6">
          <HDSStatusWidget />
        </div>

        {/* Message de bienvenue adapté au contexte */}
        {!cabinetsLoading && (
          <WelcomeMessage 
            hasCabinets={!!(cabinets && cabinets.length > 0)}
            hasPatients={false}
            userName={user?.firstName}
            isDemoMode={isDemoMode}
          />
        )}
        
        <Dashboard />
      </GradientBackground>
    </Layout>
  );
};

export default DashboardPage;
