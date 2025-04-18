
import React, { useEffect, useState } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/services/supabase-api/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setAuthChecking(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Vous devez être connecté pour accéder au tableau de bord");
          navigate('/login');
          return;
        }
        
        // Vérifier aussi si l'utilisateur est associé à un ostéopathe
        const { data: osteopath, error } = await supabase
          .from('Osteopath')
          .select('id')
          .eq('userId', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Erreur lors de la vérification du profil d'ostéopathe:", error);
        }
        
        if (!osteopath) {
          setAuthError("Votre profil d'ostéopathe n'est pas configuré. Veuillez compléter votre profil.");
        } else {
          setAuthError(null);
        }
      } catch (error) {
        console.error("Erreur d'authentification:", error);
        toast.error("Problème de vérification d'authentification");
      } finally {
        setAuthChecking(false);
      }
    };
    
    checkAuthentication();
  }, [navigate, retry]);
  
  const handleRetry = () => {
    setRetry(prev => prev + 1);
    toast.info("Nouvelle vérification en cours...");
  };
  
  if (authChecking) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-pulse text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Vérification de l'authentification...
            </p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (authError) {
    return (
      <Layout>
        <Card className="p-8 text-center mt-12">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <h3 className="text-xl font-bold">Configuration requise</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{authError}</p>
            <Button 
              onClick={handleRetry} 
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </Card>
      </Layout>
    );
  }
  
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
