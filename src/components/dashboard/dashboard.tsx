
import React, { useEffect, useState } from "react";
import { DashboardStats } from "./dashboard-stats";
import { DemographicsCard } from "./demographics-card";
import { AppointmentsOverview } from "./appointments-overview";
import { DashboardHeader } from "./dashboard-header";
import { DashboardContent } from "./dashboard-content";
import { LoadingState, ErrorState } from "./loading-state";
import { api } from "@/services/api";
import { DashboardData, Patient } from "@/types";
import { 
  calculateDemographics, 
  calculateGrowthMetrics, 
  calculateAppointmentStats, 
  calculateMonthlyBreakdown 
} from "./utils/dashboard-calculations";
import { formatAppointmentDate } from "@/utils/date-utils";

// Initial dashboard data with all required properties
const initialDashboardData: DashboardData = {
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
  nextAppointment: "Aucune séance prévue",
  patientsLastYearEnd: 0,
  newPatientsLast30Days: 0,
  thirtyDayGrowthPercentage: 0,
  annualGrowthPercentage: 0,
  monthlyGrowth: [],
  childrenCount: 0,
  revenueThisMonth: 0,
  pendingInvoices: 0,
  weeklyAppointments: [0, 0, 0, 0, 0, 0, 0],
  monthlyRevenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  completedAppointments: 0
};

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Récupération des données réelles
        const [patientsData, appointmentsData] = await Promise.all([
          api.getPatients(),
          api.getAppointments(),
        ]);

        setAllPatients(patientsData); // Stocker tous les patients pour DemographicsCard

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Calculer les différentes métriques
        const demographics = calculateDemographics(patientsData, currentYear);
        const growthMetrics = calculateGrowthMetrics(patientsData, currentYear, currentMonth);
        const appointmentStats = calculateAppointmentStats(appointmentsData, today);
        const monthlyGrowthData = calculateMonthlyBreakdown(patientsData, currentYear);

        // Formatter le prochain rendez-vous pour l'affichage
        const formattedNextAppointment = appointmentStats.nextAppointment 
          ? formatAppointmentDate(appointmentStats.nextAppointment.date, "EEEE d MMMM yyyy 'à' HH:mm")
          : "Aucune séance prévue";

        // Assembler toutes les données pour le tableau de bord
        setDashboardData({
          totalPatients: patientsData.length,
          ...demographics,
          ...growthMetrics,
          appointmentsToday: appointmentStats.appointmentsToday,
          nextAppointment: formattedNextAppointment,
          monthlyGrowth: monthlyGrowthData,
          // Add missing properties with default values
          revenueThisMonth: 0,
          pendingInvoices: 0,
          weeklyAppointments: [0, 0, 0, 0, 0, 0, 0],
          monthlyRevenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          completedAppointments: appointmentsData.filter(a => a.status === 'COMPLETED').length
        });
      } catch (err) {
        console.error("Erreur lors du chargement des données du tableau de bord:", err);
        setError("Impossible de charger les données du tableau de bord. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Image Banner */}
      <DashboardHeader />
      
      {/* Main content */}
      <div className="animate-fade-in">
        <DashboardStats data={dashboardData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="animate-fade-in animate-delay-100">
          <AppointmentsOverview data={dashboardData} />
        </div>
        <div className="animate-fade-in animate-delay-200">
          <DemographicsCard
            patients={allPatients}
            data={dashboardData}
          />
        </div>
      </div>

      <DashboardContent dashboardData={dashboardData} />
    </div>
  );
}
