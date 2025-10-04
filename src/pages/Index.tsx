import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { SmartSkeleton } from "@/components/ui/skeleton-loaders";
import { useOptimization } from "@/contexts/OptimizationContext";
import { FirstLoginWizard } from "@/components/onboarding/FirstLoginWizard";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { loading } = useOptimization();
  const { user } = useAuth();
  const { isDemoMode } = useDemo();
  const navigate = useNavigate();
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [checkingFirstLogin, setCheckingFirstLogin] = useState(true);

  // Vérifier si c'est la première connexion (mode connecté uniquement)
  useEffect(() => {
    const checkFirstLogin = async () => {
      // Ne pas afficher en mode démo
      if (isDemoMode) {
        setCheckingFirstLogin(false);
        return;
      }

      // Vérifier si l'utilisateur a déjà vu le wizard
      const hasSeenWizard = localStorage.getItem(`first-login-wizard-${user?.id}`);
      
      if (!hasSeenWizard && user) {
        setShowFirstLogin(true);
      }
      
      setCheckingFirstLogin(false);
    };

    if (user !== undefined && isDemoMode !== null) {
      checkFirstLogin();
    }
  }, [user, isDemoMode]);

  const handleWizardComplete = () => {
    if (user) {
      localStorage.setItem(`first-login-wizard-${user.id}`, 'true');
    }
    setShowFirstLogin(false);
  };

  const handleConfigureStorage = () => {
    if (user) {
      localStorage.setItem(`first-login-wizard-${user.id}`, 'true');
    }
    setShowFirstLogin(false);
    navigate('/settings/storage');
  };

  const handleSkip = () => {
    if (user) {
      localStorage.setItem(`first-login-wizard-${user.id}`, 'true');
    }
    setShowFirstLogin(false);
    // Forcer la navigation vers le dashboard pour garantir l'affichage
    navigate('/dashboard');
  };

  // Afficher le wizard pour les nouveaux utilisateurs (pas en mode démo)
  if (showFirstLogin && !isDemoMode && user) {
    return (
      <FirstLoginWizard
        userName={user.firstName || user.email.split('@')[0]}
        onComplete={handleWizardComplete}
        onConfigureStorage={handleConfigureStorage}
        onSkip={handleSkip}
      />
    );
  }

  // Affichage normal du dashboard
  return (
    <Layout>
      <div className="space-y-8">
        <div className="animate-fade-in animate-delay-300">
          <Dashboard />
        </div>
      </div>
    </Layout>
  );
};
export default Index;