
import React, { useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { DemoGuide } from "@/components/demo/DemoGuide";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { isDemoSession } from "@/utils/demo-detection";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur connecté normal a besoin de configurer son profil
  useEffect(() => {
    const checkUserProfile = async () => {
      console.log("DashboardPage - Vérification du profil utilisateur:", user);
      
      // Vérifier si on est en mode démo
      const isDemo = await isDemoSession();
      
      // Seulement pour les utilisateurs connectés NON-démo
      if (user && !isDemo && !user.osteopathId) {
        console.log("Utilisateur connecté normal sans profil ostéopathe détecté, redirection vers la configuration");
        navigate("/osteopath-profile");
      } else {
        console.log("Utilisateur avec profil ostéopathe, en mode démo, ou non connecté:", { 
          osteopathId: user?.osteopathId, 
          isDemo,
          userEmail: user?.email 
        });
      }
    };
    
    if (user) {
      checkUserProfile();
    }
  }, [user, navigate]);

  return (
    <Layout>
      <GradientBackground 
        variant="subtle" 
        className="p-3 md:p-6 rounded-xl animate-fade-in"
      >
        <DemoGuide />
        <Dashboard />
      </GradientBackground>
    </Layout>
  );
};

export default DashboardPage;
