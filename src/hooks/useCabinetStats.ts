import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { DashboardData, Patient, Appointment } from "@/types";
import {
  calculateAppointmentStats,
  calculateConsultationMetrics,
  calculateDemographics,
  calculateGrowthMetrics,
  calculateMonthlyBreakdown,
  calculateRevenueMetrics,
} from "@/components/dashboard/utils/dashboard-calculations";
import { formatAppointmentDate } from "@/utils/date-utils";
import { useDemo } from "@/contexts/DemoContext";

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
  completedAppointments: 0,
  consultationsThisMonth: 0,
  consultationsLastMonth: 0,
  averageConsultationsPerDay: 0,
  averageConsultationsPerMonth: 0,
  consultationsTrend: 0,
  consultationsLast7Days: [],
  consultationsLast12Months: [],
};

export function useCabinetStats(selectedCabinetId: number | null) {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode } = useDemo();

  useEffect(() => {
    const loadCabinetStats = async () => {
      console.log('📊 [useCabinetStats] === DÉBUT CHARGEMENT ===', { selectedCabinetId });
      setLoading(true);
      setError(null);
      
      try {
        // Services utilisent automatiquement le StorageRouter
        // Mode démo → demo-local-storage
        // Mode connecté → HDS local + Non-HDS Supabase

        // Récupération des données (réelles ou démo selon le contexte)
        // Avec gestion d'erreur gracieuse pour l'environnement iframe
        let patientsData, appointmentsData, invoicesData;
        
        try {
          // Essayer de charger les données HDS (patients, RDV) - silencieux si non configuré
          [patientsData, appointmentsData] = await Promise.all([
            api.getPatients().catch((error) => {
              // Gestion silencieuse pour stockage HDS non configuré
              if (error.message?.includes('Stockage HDS sécurisé non configuré')) {
                console.info('ℹ️ Stockage HDS non configuré - données vides utilisées');
                return [];
              }
              console.warn('⚠️ Erreur patients:', error);
              return [];
            }),
            api.getAppointments().catch((error) => {
              if (error.message?.includes('Stockage HDS sécurisé non configuré')) {
                console.info('ℹ️ Stockage HDS non configuré - données vides utilisées');
                return [];
              }
              console.warn('⚠️ Erreur appointments:', error);
              return [];
            }),
          ]);
          
          // Charger les factures (non-HDS) séparément car toujours disponibles
          invoicesData = await api.getInvoices();
          
        } catch (storageError) {
          console.warn('⚠️ Erreur de stockage détectée, utilisation de données vides:', storageError);
          patientsData = [];
          appointmentsData = [];
          invoicesData = [];
        }

        // Filtrer les données par cabinet si sélectionné
        let filteredPatients = patientsData || [];
        let filteredAppointments = appointmentsData || [];
        let filteredInvoices = invoicesData || [];

        if (selectedCabinetId !== null) {
          // Filtrer les patients par cabinet
          filteredPatients = (patientsData || []).filter(
            patient => patient.cabinetId === selectedCabinetId
          );

          // Filtrer les rendez-vous par patients du cabinet sélectionné
          const patientIds = filteredPatients.map(p => p.id);
          filteredAppointments = (appointmentsData || []).filter(
            appointment => patientIds.includes(appointment.patientId)
          );

          // Filtrer les factures par patients du cabinet sélectionné
          filteredInvoices = (invoicesData || []).filter(
            invoice => patientIds.includes(invoice.patientId)
          );
        }

        setAllPatients(filteredPatients);

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Calculer les différentes métriques avec les données filtrées
        const demographics = calculateDemographics(filteredPatients, currentYear);
        const growthMetrics = calculateGrowthMetrics(
          filteredPatients,
          currentYear,
          currentMonth
        );
        const appointmentStats = calculateAppointmentStats(filteredAppointments, today);
        const consultationMetrics = calculateConsultationMetrics(
          filteredAppointments,
          currentYear,
          currentMonth
        );
        const monthlyGrowthData = calculateMonthlyBreakdown(
          filteredPatients,
          currentYear
        );
        const revenueMetrics = calculateRevenueMetrics(
          filteredInvoices,
          currentYear,
          currentMonth
        );

        // Formatter le prochain rendez-vous pour l'affichage
        const formattedNextAppointment =
          appointmentStats.nextAppointment
            ? formatAppointmentDate(
                appointmentStats.nextAppointment.date,
                "EEEE d MMMM yyyy 'à' HH:mm"
              )
            : "Aucune séance prévue";

        // Assembler toutes les données pour le tableau de bord
        // Calcul du revenu moyen par RDV en utilisant les données existantes
        const paidInvoicesWithAppointment = filteredInvoices.filter(
          invoice => invoice.paymentStatus === "PAID" && invoice.appointmentId
        );
        const averageRevenuePerAppointment = paidInvoicesWithAppointment.length > 0 
          ? paidInvoicesWithAppointment.reduce((sum, invoice) => sum + invoice.amount, 0) / paidInvoicesWithAppointment.length
          : 0;

        const finalDashboardData = {
          totalPatients: filteredPatients.length,
          ...demographics,
          ...growthMetrics,
          appointmentsToday: appointmentStats.appointmentsToday,
          nextAppointment: formattedNextAppointment,
          monthlyGrowth: monthlyGrowthData,
          ...revenueMetrics,
          averageRevenuePerAppointment,
          weeklyAppointments: [0, 0, 0, 0, 0, 0, 0],
          completedAppointments: filteredAppointments.filter(
            (a) => a.status === "COMPLETED"
          ).length,
          ...consultationMetrics,
        };

        setDashboardData(finalDashboardData);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques du cabinet:", err);
        setError("Impossible de charger les statistiques. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    loadCabinetStats();
  }, [selectedCabinetId, isDemoMode]);

  return {
    dashboardData,
    allPatients,
    loading,
    error
  };
}