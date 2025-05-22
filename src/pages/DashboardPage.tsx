
import React, { useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { useAuth } from "@/contexts/AuthContext";

const DashboardPage = () => {
  const { user, redirectToSetupIfNeeded } = useAuth();
  
  // Vérifier si l'utilisateur a besoin de configurer son profil
  useEffect(() => {
    console.log("DashboardPage - Vérification du profil utilisateur:", user);
    
    // Ne rediriger que si l'utilisateur est connecté mais n'a pas d'osteopathId
    if (user && !user.osteopathId) {
      console.log("Utilisateur sans profil ostéopathe détecté, redirection vers la configuration");
      redirectToSetupIfNeeded("/dashboard");
    } else {
      console.log("Utilisateur avec profil ostéopathe ou non connecté:", user?.osteopathId);
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
