import { DashboardData } from "@/types";
import { DashboardStats } from "./dashboard-stats";
import { DemographicsCard } from "./demographics-card";
import { GrowthChart } from "./growth-chart";
import { AppointmentsOverview } from "./appointments-overview";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { differenceInYears, parseISO, format, subMonths, subYears } from "date-fns";
import { toast } from "sonner";

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
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  
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
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return date >= thirtyDaysAgo && date <= today;
    } catch (e) {
      return false;
    }
  };
  
  const newPatientsThisMonth = patients.filter(p => isThisMonth(p.createdAt)).length;
  const newPatientsThisYear = patients.filter(p => isThisYear(p.createdAt)).length;
  const newPatientsLastYear = patients.filter(p => isLastYear(p.createdAt)).length;
  const newPatientsLast30Days = patients.filter(p => isLast30Days(p.createdAt)).length;
  
  // Pour les rendez-vous, on utilise maintenant les données réelles
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
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
      return aptDate >= today && apt.status === 'SCHEDULED';
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
        toast.error("Impossible de charger les données du tableau de bord");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="p-4 border rounded-md bg-muted/50">
        <p className="text-center text-muted-foreground">
          Impossible de charger les données du tableau de bord
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardStats data={dashboardData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemographicsCard patients={patients} data={dashboardData} />
        <GrowthChart data={dashboardData} />
        <AppointmentsOverview data={dashboardData} className="lg:col-span-2" />
      </div>
    </div>
  );
}
