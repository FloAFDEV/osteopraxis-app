
import React from 'react';
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { GradientBackground } from "@/components/ui/gradient-background";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Activity } from "lucide-react";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="relative flex flex-col gap-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              Tableau de bord
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
        
        <GradientBackground 
          variant="subtle" 
          className="p-6 rounded-xl shadow-md"
        >
          <Dashboard />
        </GradientBackground>
      </div>
    </Layout>
  );
};

export default DashboardPage;
