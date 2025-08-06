import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useMode } from '@/contexts/ModeContext';
import { Dashboard } from "@/components/dashboard/dashboard";
import { DemoBanner } from "@/components/DemoBanner";
import { DemoNavigation } from "@/components/DemoNavigation";
import { GradientBackground } from "@/components/ui/gradient-background";

export default function DemoPage() {
  const { mode, setMode } = useMode();

  useEffect(() => {
    // Forcer le mode démo quand on accède à cette page
    if (mode !== 'demo') {
      setMode('demo');
    }
  }, [mode, setMode]);

  // Si on n'est pas en mode démo, rediriger
  if (mode !== 'demo') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <DemoNavigation />
      <div className="container mx-auto p-6">
        <GradientBackground 
          variant="subtle" 
          className="p-3 md:p-6 rounded-xl animate-fade-in"
        >
          <Dashboard />
        </GradientBackground>
      </div>
    </div>
  );
}