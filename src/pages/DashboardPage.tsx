
import React, { useEffect } from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/services/supabase-api/utils";
import { toast } from "sonner";

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour accéder au tableau de bord");
        navigate('/login');
      }
    };
    
    checkAuthentication();
  }, [navigate]);
  
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
