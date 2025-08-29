
import React, { useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { DemoGuide } from "@/components/demo/DemoGuide";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur a besoin de configurer son profil
  useEffect(() => {
    console.log("DashboardPage - Vérification du profil utilisateur:", user);
    
    // Pour les utilisateurs démo, rediriger vers la page d'accueil
    if (user && (user.email === 'demo@patienthub.com' || user.email?.startsWith('demo-'))) {
      console.log("🔄 Redirection vers dashboard");
      navigate("/");
      return;
    }
    
    // Ne rediriger que si l'utilisateur est connecté mais n'a pas d'osteopathId
    if (user && !user.osteopathId) {
      console.log("Utilisateur sans profil ostéopathe détecté, redirection vers la configuration");
      navigate("/osteopath-profile");
    } else {
      console.log("Utilisateur avec profil ostéopathe ou non connecté:", user?.osteopathId);
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
