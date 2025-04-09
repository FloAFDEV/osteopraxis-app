
import React from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="relative flex flex-col gap-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl shadow-sm">
              <Activity className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600">
                Tableau de bord
              </h1>
              <p className="text-blue-500/70 dark:text-blue-400/70 text-sm">
                Suivez vos activités et consultez vos statistiques
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
        
        <GradientBackground 
          variant="subtle" 
          className="p-6 rounded-xl shadow-md bg-white dark:bg-slate-800/60"
        >
          <Dashboard />
        </GradientBackground>
      </div>
    </Layout>
  );
};

export default DashboardPage;
