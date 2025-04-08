
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { GrowthChart } from "@/components/dashboard/growth-chart";

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header Image Banner */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg mb-8">
        <img 
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1600&h=400"
          alt="Cabinet Médical" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center">
          <div className="px-6 md:px-10 max-w-2xl">
            <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-2">
              Tableau de bord
            </h1>
            <p className="text-white/90 text-sm md:text-base lg:text-lg max-w-md">
              Bienvenue sur votre espace de gestion. Suivez vos activités et consultez vos statistiques en temps réel.
            </p>
          </div>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AppointmentsOverview />
        <DemographicsCard />
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Évolution de l'activité</h2>
          <div className="h-80">
            <GrowthChart />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
