import { Appointment, DashboardData, Patient, Invoice } from "@/types";
import { FRENCH_MONTHS } from "./constants";
import { isMinor } from "../demographics/gender-chart-utils";

/**
 * Calcule les statistiques démographiques des patients
 */
export function calculateDemographics(patients: Patient[], currentYear: number) {
  const maleCount = patients.filter((p) => p.gender === "Homme").length;
  const femaleCount = patients.filter((p) => p.gender === "Femme").length;
  const childrenCount = patients.filter(isMinor).length;

  const calculateAverageAge = (patientList: Patient[]): number => {
    const patientsWithBirthDate = patientList.filter((p) => p.birthDate);
    if (patientsWithBirthDate.length === 0) return 0;

    const totalAge = patientsWithBirthDate.reduce((sum, patient) => {
      const birthDate = new Date(patient.birthDate);
      let age = currentYear - birthDate.getFullYear();
      const monthDiff = new Date().getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && new Date().getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return sum + Math.max(0, age); // S'assurer que l'âge n'est pas négatif
    }, 0);
    return Math.round(totalAge / patientsWithBirthDate.length);
  };

  return {
    maleCount,
    femaleCount,
    childrenCount,
    averageAge: calculateAverageAge(patients),
    averageAgeMale: calculateAverageAge(
      patients.filter((p) => p.gender === "Homme")
    ),
    averageAgeFemale: calculateAverageAge(
      patients.filter((p) => p.gender === "Femme")
    ),
  };
}

/**
 * Calcule les métriques de croissance
 */
export function calculateGrowthMetrics(
  patientsData: Patient[],
  currentYear: number,
  currentMonth: number
) {
  const newPatientsThisMonth = patientsData.filter((p) => {
    const createdAt = new Date(p.createdAt);
    return (
      createdAt.getMonth() === currentMonth &&
      createdAt.getFullYear() === currentYear
    );
  }).length;

  const newPatientsThisYear = patientsData.filter(
    (p) => new Date(p.createdAt).getFullYear() === currentYear
  ).length;
  const newPatientsLastYear = patientsData.filter(
    (p) => new Date(p.createdAt).getFullYear() === currentYear - 1
  ).length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newPatientsLast30Days = patientsData.filter(
    (p) => new Date(p.createdAt) >= thirtyDaysAgo
  ).length;

  const patientsAtStartOf30DayPeriod = patientsData.filter(
    (p) => new Date(p.createdAt) < thirtyDaysAgo
  ).length;
  const thirtyDayGrowthPercentage =
    patientsAtStartOf30DayPeriod > 0
      ? Math.round(
          (newPatientsLast30Days / patientsAtStartOf30DayPeriod) * 100
        )
      : newPatientsLast30Days > 0
      ? 100
      : 0; // Si pas de patients avant, mais des nouveaux, croissance de 100%

  const patientsLastYearEnd = patientsData.filter(
    (p) => new Date(p.createdAt).getFullYear() < currentYear
  ).length;
  const annualGrowthPercentage =
    patientsLastYearEnd > 0
      ? Math.round((newPatientsThisYear / patientsLastYearEnd) * 100) // Croissance par rapport à la base de l'année dernière
      : newPatientsThisYear > 0
      ? 100
      : 0;

  return {
    newPatientsThisMonth,
    newPatientsThisYear,
    newPatientsLastYear,
    newPatientsLast30Days,
    thirtyDayGrowthPercentage,
    annualGrowthPercentage,
    patientsLastYearEnd,
  };
}

/**
 * Calcule les statistiques des rendez-vous
 */
export function calculateAppointmentStats(appointments: Appointment[], today: Date) {
  const appointmentsToday = appointments.filter(
    (a) => new Date(a.date).toDateString() === today.toDateString()
  ).length;

  const futureAppointments = appointments
    .filter((a) => {
      const appDate = new Date(a.date);
      return (
        appDate >= today &&
        a.status !== "CANCELED" &&
        a.status !== "COMPLETED" &&
        a.status !== "NO_SHOW"
      );
    })
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  const nextAppointment = futureAppointments.length > 0 ? futureAppointments[0] : null;

  return { appointmentsToday, nextAppointment };
}

/**
 * Calcule les métriques de consultation (rendez-vous terminés)
 */
export function calculateConsultationMetrics(appointments: Appointment[], currentYear: number, currentMonth: number) {
  const now = new Date();
  const currentMonthStart = new Date(currentYear, currentMonth, 1);
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthEnd = new Date(currentYear, currentMonth, 0);

  // Consultations terminées ce mois
  const consultationsThisMonth = appointments.filter((a) => {
    const appDate = new Date(a.date);
    return (
      a.status === "COMPLETED" &&
      appDate >= currentMonthStart &&
      appDate.getMonth() === currentMonth &&
      appDate.getFullYear() === currentYear
    );
  }).length;

  // Consultations terminées le mois dernier
  const consultationsLastMonth = appointments.filter((a) => {
    const appDate = new Date(a.date);
    return (
      a.status === "COMPLETED" &&
      appDate >= lastMonthStart &&
      appDate <= lastMonthEnd
    );
  }).length;

  // Calcul de la tendance (pourcentage de variation)
  const consultationsTrend = consultationsLastMonth > 0
    ? Math.round(((consultationsThisMonth - consultationsLastMonth) / consultationsLastMonth) * 100)
    : consultationsThisMonth > 0 ? 100 : 0;

  // Consultations des 30 derniers jours pour calculer la moyenne quotidienne
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const consultationsLast30Days = appointments.filter((a) => {
    const appDate = new Date(a.date);
    return a.status === "COMPLETED" && appDate >= thirtyDaysAgo;
  }).length;

  const averageConsultationsPerDay = consultationsLast30Days / 30;

  // Consultations des 12 derniers mois pour calculer la moyenne mensuelle
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const consultationsLast12Months = appointments.filter((a) => {
    const appDate = new Date(a.date);
    return a.status === "COMPLETED" && appDate >= twelveMonthsAgo;
  }).length;

  const averageConsultationsPerMonth = consultationsLast12Months / 12;

  // Données pour graphique des 7 derniers jours
  const consultationsLast7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayConsultations = appointments.filter((a) => {
      const appDate = new Date(a.date);
      return (
        a.status === "COMPLETED" &&
        appDate.toDateString() === date.toDateString()
      );
    }).length;

    consultationsLast7Days.push({
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      consultations: dayConsultations,
    });
  }

  // Données pour graphique des 12 derniers mois
  const consultationsLast12MonthsData = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthConsultations = appointments.filter((a) => {
      const appDate = new Date(a.date);
      return (
        a.status === "COMPLETED" &&
        appDate.getMonth() === month &&
        appDate.getFullYear() === year
      );
    }).length;

    consultationsLast12MonthsData.push({
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      consultations: monthConsultations,
    });
  }

  return {
    consultationsThisMonth,
    consultationsLastMonth,
    consultationsTrend,
    averageConsultationsPerDay: Math.round(averageConsultationsPerDay * 10) / 10,
    averageConsultationsPerMonth: Math.round(averageConsultationsPerMonth * 10) / 10,
    consultationsLast7Days,
    consultationsLast12Months: consultationsLast12MonthsData,
  };
}

/**
 * Calcule la répartition mensuelle des patients
 */
export function calculateMonthlyBreakdown(
  patients: Patient[],
  currentYear: number
) {
  const patientsByMonthThisYear: Patient[][] = Array(12)
    .fill(null)
    .map(() => []);
  const patientsByMonthLastYear: Patient[][] = Array(12)
    .fill(null)
    .map(() => []);

  patients.forEach((patient) => {
    const createdAt = new Date(patient.createdAt);
    const year = createdAt.getFullYear();
    const month = createdAt.getMonth();
    if (year === currentYear) {
      patientsByMonthThisYear[month].push(patient);
    } else if (year === currentYear - 1) {
      patientsByMonthLastYear[month].push(patient);
    }
  });

  return FRENCH_MONTHS.map((monthName, index) => {
    const thisMonthPatientsList = patientsByMonthThisYear[index];
    const lastYearPatientsCount = patientsByMonthLastYear[index].length;

    const hommes = thisMonthPatientsList.filter(
      (p) => p.gender === "Homme"
    ).length;
    const femmes = thisMonthPatientsList.filter(
      (p) => p.gender === "Femme"
    ).length;
    // Remplacer enfants → mineurs (clé)
    const mineurs = thisMonthPatientsList.filter(isMinor).length;

    const growthRate =
      lastYearPatientsCount > 0
        ? Math.round(
            ((thisMonthPatientsList.length -
              lastYearPatientsCount) /
              lastYearPatientsCount) *
              100
          )
        : thisMonthPatientsList.length > 0
        ? 100
        : 0;

    // Pour compatibilité avec l'ancien type qui attend "enfants", ramener les deux pour l'instant
    return {
      month: monthName,
      patients: thisMonthPatientsList.length,
      prevPatients: lastYearPatientsCount,
      growthText: `${growthRate}%`,
      hommes,
      femmes,
      mineurs, // nouvelle clé sémantique
      enfants: mineurs, // clé legacy pour la compatibilité typage
    };
  });
}

/**
 * Calcule les métriques de revenus
 */
export function calculateRevenueMetrics(invoices: Invoice[], currentYear: number, currentMonth: number) {
  const currentMonthStart = new Date(currentYear, currentMonth, 1);
  const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthEnd = new Date(currentYear, currentMonth, 0);

  // Revenus de ce mois (factures payées)
  const revenueThisMonth = invoices
    .filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (
        invoice.paymentStatus === "PAID" &&
        invoiceDate >= currentMonthStart &&
        invoiceDate <= currentMonthEnd
      );
    })
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Revenus du mois dernier
  const revenueLastMonth = invoices
    .filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (
        invoice.paymentStatus === "PAID" &&
        invoiceDate >= lastMonthStart &&
        invoiceDate <= lastMonthEnd
      );
    })
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Factures en attente (non payées)
  const pendingInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "PENDING"
  ).length;

  // Montant total en attente
  const pendingAmount = invoices
    .filter((invoice) => invoice.paymentStatus === "PENDING")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  // Revenus des 12 derniers mois pour graphique
  const monthlyRevenue = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthRevenue = invoices
      .filter((invoice) => {
        const invoiceDate = new Date(invoice.date);
        return (
          invoice.paymentStatus === "PAID" &&
          invoiceDate.getMonth() === month &&
          invoiceDate.getFullYear() === year
        );
      })
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    monthlyRevenue.push(monthRevenue);
  }

  // Tendance de revenus (comparaison avec le mois dernier)
  const revenueTrend = revenueLastMonth > 0
    ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
    : revenueThisMonth > 0 ? 100 : 0;

  return {
    revenueThisMonth,
    revenueLastMonth,
    revenueTrend,
    pendingInvoices,
    pendingAmount,
    monthlyRevenue,
  };
}
