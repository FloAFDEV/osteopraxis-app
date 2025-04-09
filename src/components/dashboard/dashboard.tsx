
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { GrowthChart } from "@/components/dashboard/growth-chart";
import { api } from "@/services/api";
import { DashboardData } from "@/types";
import { Loader2, BarChart4 } from "lucide-react";
import { differenceInYears, parseISO, format } from "date-fns";

// Fonction pour calculer les données du tableau de bord à partir des patients et des rendez-vous réels
const calculateDashboardData = (patients: any[], appointments: any[] = []): DashboardData => {
  // Nombre total de patients
  const totalPatients = patients.length;
  
  // Compter les hommes et les femmes
  const maleCount = patients.filter(p => p.gender === "Homme").length;
  const femaleCount = patients.filter(p => p.gender === "Femme").length;
  
  // Calculer l'âge moyen
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    try {
      return differenceInYears(new Date(), parseISO(birthDateStr));
    } catch (e) {
      console.error("Erreur lors du calcul de l'âge:", e);
      return 0;
    }
  };
  
  const ages = patients.map(p => calculateAge(p.birthDate)).filter(age => age > 0);
  const maleAges = patients.filter(p => p.gender === "Homme").map(p => calculateAge(p.birthDate)).filter(age => age > 0);
  const femaleAges = patients.filter(p => p.gender === "Femme").map(p => calculateAge(p.birthDate)).filter(age => age > 0);
  
  const averageAge = ages.length ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;
  const averageAgeMale = maleAges.length ? Math.round(maleAges.reduce((sum, age) => sum + age, 0) / maleAges.length) : 0;
  const averageAgeFemale = femaleAges.length ? Math.round(femaleAges.reduce((sum, age) => sum + age, 0) / femaleAges.length) : 0;
  
  // Données sur les nouveaux patients (basé sur createdAt)
  const currentDate = new Date();
  const thisMonth = currentDate.getMonth();
  const thisYear = currentDate.getFullYear();
  
  const isThisMonth = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    } catch (e) {
      return false;
    }
  };
  
  const isThisYear = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return date.getFullYear() === thisYear;
    } catch (e) {
      return false;
    }
  };
  
  const isLastYear = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return date.getFullYear() === thisYear - 1;
    } catch (e) {
      return false;
    }
  };
  
  const isLast30Days = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      return date >= thirtyDaysAgo && date <= currentDate;
    } catch (e) {
      return false;
    }
  };
  
  const newPatientsThisMonth = patients.filter(p => isThisMonth(p.createdAt)).length;
  const newPatientsThisYear = patients.filter(p => isThisYear(p.createdAt)).length;
  const newPatientsLastYear = patients.filter(p => isLastYear(p.createdAt)).length;
  const newPatientsLast30Days = patients.filter(p => isLast30Days(p.createdAt)).length;
  
  // Pour les rendez-vous, on utilise maintenant les données réelles
  const todayStr = format(currentDate, 'yyyy-MM-dd');
  
  // Compter les rendez-vous d'aujourd'hui
  const appointmentsToday = appointments.filter(apt => {
    try {
      const aptDate = parseISO(apt.date);
      return format(aptDate, 'yyyy-MM-dd') === todayStr && apt.status === 'SCHEDULED';
    } catch (e) {
      return false;
    }
  }).length;
  
  // Trouver le prochain rendez-vous
  let nextAppointment = "Aucun rendez-vous";
  
  const futureAppointments = appointments.filter(apt => {
    try {
      const aptDate = parseISO(apt.date);
      return aptDate >= currentDate && apt.status === 'SCHEDULED';
    } catch (e) {
      return false;
    }
  }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  
  if (futureAppointments.length > 0) {
    const next = futureAppointments[0];
    const patient = patients.find(p => p.id === next.patientId);
    const time = format(parseISO(next.date), 'HH:mm');
    nextAppointment = `${time} - ${patient?.firstName || ''} ${patient?.lastName || 'Patient #' + next.patientId}`;
  }

  // Données de croissance mensuelle basées sur les données réelles
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  
  // Compter les patients par mois pour cette année et l'année dernière
  const monthlyCounts = Array(12).fill(0);
  const monthlyCountsPrevYear = Array(12).fill(0);
  
  patients.forEach(patient => {
    try {
      const date = parseISO(patient.createdAt);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      if (year === thisYear) {
        monthlyCounts[month] += 1;
      } else if (year === thisYear - 1) {
        monthlyCountsPrevYear[month] += 1;
      }
    } catch (e) {
      console.error("Erreur lors du calcul des données mensuelles:", e);
    }
  });
  
  // Générer les données de croissance mensuelles basées sur les comptes réels
  const monthlyGrowth = monthNames.map((month, index) => {
    const patients = monthlyCounts[index];
    const prevPatients = monthlyCountsPrevYear[index];
    const growth = prevPatients > 0 ? Math.round(((patients - prevPatients) / prevPatients) * 100) : 0;
    
    return {
      month,
      patients: patients,
      prevPatients: prevPatients,
      growthText: `${growth >= 0 ? '+' : ''}${growth}%`
    };
  });
  
  // Calculer la croissance réelle
  const patientsLastYearEnd = newPatientsLastYear;
  const thirtyDayGrowthPercentage = totalPatients > 0 ? Math.round((newPatientsLast30Days / Math.max(totalPatients - newPatientsLast30Days, 1)) * 100 * 10) / 10 : 0;
  const annualGrowthPercentage = patientsLastYearEnd > 0 ? Math.round(((newPatientsThisYear) / Math.max(patientsLastYearEnd, 1)) * 100 * 10) / 10 : 0;
  
  // Retourner les données complètes
  return {
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
  };
};

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des données depuis l'API
        const [patientsData, appointmentsData] = await Promise.all([
          api.getPatients(),
          api.getAppointments()
        ]);
        
        console.log(`Dashboard: ${patientsData.length} patients et ${appointmentsData.length} rendez-vous récupérés`);
        setPatients(patientsData);
        setAppointments(appointmentsData);
        
        // Calcul des données du tableau de bord avec les données réelles
        const data = calculateDashboardData(patientsData, appointmentsData);
        setDashboardData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Header image banner with modern design
  const renderHeaderBanner = () => (
    <div className="relative w-full h-48 md:h-56 overflow-hidden rounded-xl mb-8 animate-fade-in shadow-lg transform hover:scale-[1.01] transition-all duration-500">
      <img 
        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600&h=400" 
        alt="Cabinet d'ostéopathie" 
        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-transparent flex items-center">
        <div className="px-6 md:px-10 max-w-2xl animate-fade-in animate-delay-100">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-2">
            Tableau de bord
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-md">
            Bienvenue sur votre espace de gestion. Suivez vos activités et consultez vos statistiques en temps réel.
          </p>
        </div>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex flex-col space-y-6">
        {renderHeaderBanner()}
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="flex flex-col space-y-6">
        {renderHeaderBanner()}
        <div className="p-4 border rounded-md bg-muted/50">
          <p className="text-center text-muted-foreground">
            Impossible de charger les données du tableau de bord
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {renderHeaderBanner()}
      
      <DashboardStats data={dashboardData} />
      
      <section className="rounded-xl p-0 animate-fade-in animate-delay-100">
        <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
          <BarChart4 className="h-6 w-6" />
          Graphiques et visualisations
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DemographicsCard patients={patients} data={dashboardData} />
          <GrowthChart data={dashboardData} />
        </div>
        
        <div className="mt-6">
          <AppointmentsOverview data={dashboardData} className="w-full" />
        </div>
      </section>
    </div>
  );
}
