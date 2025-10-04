
import React, { useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { DemoGuide } from "@/components/demo/DemoGuide";
import { WelcomeMessage } from "@/components/welcome/WelcomeMessage";
import { HDSStatusBanner } from "@/components/storage/HDSStatusBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { isDemoSession } from "@/utils/demo-detection";
import { useCabinets } from "@/hooks/useCabinets";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: cabinets, isLoading: cabinetsLoading } = useCabinets();
  
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

  return (
    <Layout>
      <GradientBackground 
        variant="subtle" 
        className="p-3 md:p-6 rounded-xl animate-fade-in"
      >
        <DemoGuide />
        
        {/* Bannière de statut HDS pour utilisateurs connectés */}
        <HDSStatusBanner />
        
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
