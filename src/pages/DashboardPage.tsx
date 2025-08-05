
import React from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { LoadingStates } from "@/components/ui/loading-states";

const DashboardPage = () => {
  const { isReady, user, loading } = useAuthGuard();

  if (loading) {
    return <LoadingStates.FullPageLoading message="Vérification de l'authentification..." />;
  }

  if (!isReady) {
    return null; // Le guard redirige vers login
  }

  console.log("DashboardPage - Vérification du profil utilisateur:", user);

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
