import React, { useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { DemoGuide } from "@/components/demo/DemoGuide";
import { DemoIndicator } from "@/components/demo/DemoIndicator";
import { WelcomeMessage } from "@/components/welcome/WelcomeMessage";
import { HDSStatusWidget } from "@/components/dashboard/HDSStatusWidget";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDemoSession } from "@/hooks/useDemoSession";
import { useDemoData } from "@/contexts/DemoDataContext";
import { useCabinets } from "@/hooks/useCabinets";
import { useHybridStorageContext } from "@/contexts/HybridStorageContext";

const DashboardPage = () => {
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const { isConfigured, isLoading: storageLoading } = useHybridStorageContext();
  const { patients, appointments } = useDemoData();

  // Log diagnostic
  useEffect(() => {
    if (user) {
      console.log("📊 DashboardPage - Utilisateur connecté:", {
        email: user.email,
        osteopathId: user.osteopathId,
        hasFirstName: !!user.firstName,
        isDemoMode
      });
    }
  }, [user, isDemoMode]);

  // Charger les cabinets (sauf en mode démo)
  const { data: cabinets, isLoading: cabinetsLoading } = useCabinets();

  // En mode démo : toujours considérer qu'il y a un cabinet et des patients
  const hasCabinets = isDemoMode ? true : !!(cabinets && cabinets.length > 0);
  const hasPatients = isDemoMode ? true : false;

  return (
    <Layout>
      <GradientBackground
        variant="subtle"
        className="p-3 md:p-6 rounded-xl animate-fade-in"
      >
        {/* Badge démo affiché en premier */}
        {isDemoMode && (
          <div className="mb-6">
            <DemoIndicator />
          </div>
        )}

        {/* Guide démo */}
        {isDemoMode && <DemoGuide />}

        {/* Widget HDS - seulement si pas en mode démo */}
        {!isDemoMode && (
          <div className="mb-6">
            <HDSStatusWidget />
          </div>
        )}

        {/* Message de bienvenue adapté au contexte */}
        {!cabinetsLoading && (
          <WelcomeMessage
            hasCabinets={hasCabinets}
            hasPatients={hasPatients}
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
