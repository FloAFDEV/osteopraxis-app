
import React, { useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { useAuth } from "@/contexts/AuthContext";

const DashboardPage = () => {
  const { user, redirectToSetupIfNeeded } = useAuth();
  
  // Vérifier si l'utilisateur a besoin de configurer son profil
  useEffect(() => {
    if (user && !user.osteopathId) {
      console.log("Utilisateur sans profil ostéopathe détecté, redirection vers la configuration");
      redirectToSetupIfNeeded("/dashboard");
    }
  }, [user, redirectToSetupIfNeeded]);

  return (
    <Layout>
      <GradientBackground 
        variant="subtle" 
        className="p-3 md:p-6 rounded-xl animate-fade-in"
      >
        <Dashboard />
      </GradientBackground>
    </Layout>
  );
};

export default DashboardPage;
