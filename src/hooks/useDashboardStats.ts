/**
 * 📊 Hook unifié pour les statistiques du dashboard
 * 
 * Gère automatiquement :
 * - Mode démo vs connecté
 * - Stockage HDS vs Supabase
 * - Filtrage par cabinet
 * - Gestion d'erreurs gracieuse
 * - Performance optimale (DRY)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardData, Patient } from '@/types';
import { useStorageMode } from './useStorageMode';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import {
  calculateAppointmentStats,
  calculateConsultationMetrics,
  calculateDemographics,
  calculateGrowthMetrics,
  calculateMonthlyBreakdown,
  calculateRevenueMetrics,
} from '@/components/dashboard/utils/dashboard-calculations';
import { formatAppointmentDate } from '@/utils/date-utils';

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

export function useDashboardStats(selectedCabinetId: number | null) {
  const { user } = useAuth();
  const { isDemoMode, isLoading: modeLoading } = useStorageMode();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<'SETUP' | 'UNLOCK' | null>(null);
  
  // ⚡ Guard pour éviter les appels multiples simultanés
  const isLoadingRef = useRef(false);

  const loadStats = useCallback(async () => {
    // 🛡️ Protection contre les appels simultanés
    if (isLoadingRef.current) {
      console.log('⏭️ Chargement déjà en cours, skip');
      return;
    }

    console.log('📊 Chargement stats dashboard', {
      cabinetId: selectedCabinetId,
      osteopathId: user?.osteopathId 
    });

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Chargement des données avec gestion d'erreur silencieuse
      const [patientsData, appointmentsData, invoicesData] = await Promise.allSettled([
        api.getPatients(),
        api.getAppointments(),
        api.getInvoices()
      ]);

      // ⚠️ VÉRIFIER LES ERREURS PIN EN PRIORITÉ (avant d'extraire les données)
      for (const result of [patientsData, appointmentsData, invoicesData]) {
        if (result.status === 'rejected' && result.reason instanceof Error) {
          if (result.reason.message === 'PIN_SETUP_REQUIRED') {
            console.log('🔐 Configuration PIN requise');
            setPinError('SETUP');
            setLoading(false);
            isLoadingRef.current = false;
            return;
          }
          if (result.reason.message === 'PIN_UNLOCK_REQUIRED') {
            console.log('🔓 Déverrouillage PIN requis');
            setPinError('UNLOCK');
            setLoading(false);
            isLoadingRef.current = false;
            return;
          }
        }
      }

      // Extraire les données ou tableaux vides (seulement si pas d'erreur PIN)
      const patients = patientsData.status === 'fulfilled' ? patientsData.value : [];
      const appointments = appointmentsData.status === 'fulfilled' ? appointmentsData.value : [];
      const invoices = invoicesData.status === 'fulfilled' ? invoicesData.value : [];

      // Logs silencieux en cas d'échec (normal si HDS non configuré)
      if (patientsData.status === 'rejected') {
        console.debug('ℹ️ Patients non disponibles (stockage HDS peut-être non configuré)');
      }
      if (appointmentsData.status === 'rejected') {
        console.debug('ℹ️ Rendez-vous non disponibles (stockage HDS peut-être non configuré)');
      }

      // Filtrage par cabinet si sélectionné
      let filteredPatients = patients;
      let filteredAppointments = appointments;
      let filteredInvoices = invoices;

      if (selectedCabinetId !== null) {
        filteredPatients = patients.filter(p => p.cabinetId === selectedCabinetId);
        const patientIds = filteredPatients.map(p => p.id);
        filteredAppointments = appointments.filter(a => patientIds.includes(a.patientId));
        filteredInvoices = invoices.filter(i => patientIds.includes(i.patientId));
      }

      setAllPatients(filteredPatients);

      // Calculs des métriques
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      const demographics = calculateDemographics(filteredPatients, currentYear);
      const growthMetrics = calculateGrowthMetrics(filteredPatients, currentYear, currentMonth);
      const appointmentStats = calculateAppointmentStats(filteredAppointments, today);
      const consultationMetrics = calculateConsultationMetrics(filteredAppointments, currentYear, currentMonth);
      const monthlyGrowthData = calculateMonthlyBreakdown(filteredPatients, currentYear);
      const revenueMetrics = calculateRevenueMetrics(filteredInvoices, currentYear, currentMonth);

      const formattedNextAppointment = appointmentStats.nextAppointment
        ? formatAppointmentDate(appointmentStats.nextAppointment.date, "EEEE d MMMM yyyy 'à' HH:mm")
        : "Aucune séance prévue";

      const paidInvoicesWithAppointment = filteredInvoices.filter(
        inv => inv.paymentStatus === "PAID" && inv.appointmentId
      );
      const averageRevenuePerAppointment = paidInvoicesWithAppointment.length > 0
        ? paidInvoicesWithAppointment.reduce((sum, inv) => sum + inv.amount, 0) / paidInvoicesWithAppointment.length
        : 0;

      const finalData = {
        totalPatients: filteredPatients.length,
        ...demographics,
        ...growthMetrics,
        appointmentsToday: appointmentStats.appointmentsToday,
        nextAppointment: formattedNextAppointment,
        monthlyGrowth: monthlyGrowthData,
        ...revenueMetrics,
        averageRevenuePerAppointment,
        weeklyAppointments: [0, 0, 0, 0, 0, 0, 0],
        completedAppointments: filteredAppointments.filter(a => a.status === "COMPLETED").length,
        ...consultationMetrics,
      };

      setDashboardData(finalData);
      console.log('✅ Stats dashboard chargées avec succès');

    } catch (err) {
      console.error('❌ Erreur chargement dashboard:', err);
      
      // Gérer les erreurs PIN spécifiques
      if (err instanceof Error) {
        if (err.message === 'PIN_SETUP_REQUIRED') {
          setPinError('SETUP');
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }
        if (err.message === 'PIN_UNLOCK_REQUIRED') {
          setPinError('UNLOCK');
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }
      }
      
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      isLoadingRef.current = false; // ✅ Libérer le guard
    }
  }, [selectedCabinetId, user?.osteopathId]);

  // ⚡ Charger UNE SEULE FOIS au montage ou quand les dépendances changent
  useEffect(() => {
    loadStats();
  }, [selectedCabinetId, user?.osteopathId]);

  return { 
    dashboardData, 
    allPatients,
    loading, 
    error,
    pinError,
    reload: loadStats
  };
}
