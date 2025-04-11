
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { DashboardData } from "@/types";
import { api } from "@/services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalPatients: 0,
    maleCount: 0,
    femaleCount: 0,
    averageAge: 0,
    averageAgeMale: 0,
    averageAgeFemale: 0,
    newPatientsThisMonth: 0,
    newPatientsThisYear: 0,
    newPatientsLastYear: 0,
    appointmentsToday: 0,
    nextAppointment: "Aucun rendez-vous prévu",
    patientsLastYearEnd: 0,
    newPatientsLast30Days: 0,
    thirtyDayGrowthPercentage: 0,
    annualGrowthPercentage: 0,
    monthlyGrowth: Array(12).fill(0).map((_, index) => {
      const frenchMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
      return {
        month: frenchMonths[index],
        patients: 0,
        prevPatients: 0,
        growthText: "0%"
      };
    })
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Récupération des données réelles uniquement
        const [patients, appointments] = await Promise.all([
          api.getPatients(), 
          api.getAppointments()
        ]);

        // Calcul des statistiques avec uniquement les données réelles
        const totalPatients = patients.length;
        const maleCount = patients.filter(p => p.gender === "Homme").length;
        const femaleCount = patients.filter(p => p.gender === "Femme").length;

        // Calcul des âges et métriques de croissance
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Nouveaux patients ce mois-ci et cette année
        const newPatientsThisMonth = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        }).length;
        
        const newPatientsThisYear = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt.getFullYear() === currentYear;
        }).length;
        
        const newPatientsLastYear = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt.getFullYear() === currentYear - 1;
        }).length;

        // Rendez-vous aujourd'hui
        const appointmentsToday = appointments.filter(a => {
          const appDate = new Date(a.date);
          return appDate.toDateString() === today.toDateString();
        }).length;

        // Prochain rendez-vous
        const futureAppointments = appointments
          .filter(a => new Date(a.date) > today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const nextAppointment = futureAppointments.length > 0 
          ? format(new Date(futureAppointments[0].date), 'HH:mm, dd MMM', { locale: fr })
          : "Aucun rendez-vous prévu";

        // Calcul de la croissance sur 30 jours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newPatientsLast30Days = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= thirtyDaysAgo;
        }).length;
        
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
        const patientsPrevious30Days = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
        }).length;

        // Taux de croissance
        const thirtyDayGrowthPercentage = patientsPrevious30Days > 0 
          ? Math.round((newPatientsLast30Days - patientsPrevious30Days) / patientsPrevious30Days * 100) 
          : newPatientsLast30Days > 0 ? 100 : 0;
        
        const patientsLastYearEnd = patients.filter(p => {
          const createdAt = new Date(p.createdAt);
          return createdAt.getFullYear() < currentYear;
        }).length;
        
        const annualGrowthPercentage = patientsLastYearEnd > 0 
          ? Math.round(newPatientsThisYear / patientsLastYearEnd * 100) 
          : newPatientsThisYear > 0 ? 100 : 0;

        // Données de croissance mensuelle
        const frenchMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const monthlyGrowth = frenchMonths.map((month, index) => {
          const thisYearPatients = patients.filter(p => {
            const createdAt = new Date(p.createdAt);
            return createdAt.getMonth() === index && createdAt.getFullYear() === currentYear;
          }).length;
          
          const lastYearPatients = patients.filter(p => {
            const createdAt = new Date(p.createdAt);
            return createdAt.getMonth() === index && createdAt.getFullYear() === currentYear - 1;
          }).length;
          
          const growthRate = lastYearPatients > 0 
            ? Math.round((thisYearPatients - lastYearPatients) / lastYearPatients * 100) 
            : thisYearPatients > 0 ? 100 : 0;
          
          return {
            month,
            patients: thisYearPatients,
            prevPatients: lastYearPatients,
            growthText: `${growthRate}%`
          };
        });

        // Calcul des âges moyens
        const calculateAverageAge = (patientList: any[]) => {
          const patientsWithBirthDate = patientList.filter(p => p.birthDate);
          if (patientsWithBirthDate.length === 0) return 0;
          
          const totalAge = patientsWithBirthDate.reduce((sum, patient) => {
            const birthDate = new Date(patient.birthDate);
            const age = currentYear - birthDate.getFullYear();
            return sum + age;
          }, 0);
          
          return Math.round(totalAge / patientsWithBirthDate.length);
        };
        
        const averageAge = calculateAverageAge(patients);
        const averageAgeMale = calculateAverageAge(patients.filter(p => p.gender === "Homme"));
        const averageAgeFemale = calculateAverageAge(patients.filter(p => p.gender === "Femme"));

        // Mettre à jour les données du tableau de bord
        setDashboardData({
          totalPatients,
          maleCount,
          femaleCount,
          averageAge,
          averageAgeMale,
          averageAgeFemale,
          newPatientsThisMonth,
          newPatientsThisYear,
          newPatientsLastYear,
          appointmentsToday,
          nextAppointment,
          patientsLastYearEnd,
          newPatientsLast30Days,
          thirtyDayGrowthPercentage,
          annualGrowthPercentage,
          monthlyGrowth
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données du tableau de bord:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Image Banner */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg mb-8 animate-fade-in shadow-lg transform hover:scale-[1.01] transition-all duration-500">
        <img 
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600&h=400" 
          alt="Cabinet d'ostéopathie" 
          className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center">
          <div className="px-6 md:px-10 max-w-2xl animate-fade-in animate-delay-100">
            <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-2">
              Tableau de bord
            </h1>
            <p className="text-white/90 text-sm md:text-base lg:text-lg max-w-md">
              Bienvenue sur votre espace de gestion. Suivez vos activités et consultez vos statistiques en temps réel.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">
              Chargement des données...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="animate-fade-in">
            <DashboardStats data={dashboardData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="animate-fade-in animate-delay-100">
              <AppointmentsOverview data={dashboardData} />
            </div>
            <div className="animate-fade-in animate-delay-200">
              <DemographicsCard data={dashboardData} />
            </div>
          </div>

          <div className="animate-fade-in animate-delay-300">
            <Card className="hover-scale">
              <CardContent className="p-6 bg-inherit">
                <h2 className="text-xl font-bold mb-4">Évolution de l'activité</h2>
                <div className="h-full">
                  <GrowthChart data={dashboardData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
