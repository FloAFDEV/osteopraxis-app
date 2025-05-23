
import { Appointment, DashboardData, Patient } from "@/types";
import { FRENCH_MONTHS } from "./constants";
import { isChild } from "../demographics/gender-chart-utils";

/**
 * Calcule les statistiques démographiques des patients
 */
export function calculateDemographics(patients: Patient[], currentYear: number) {
  const maleCount = patients.filter((p) => p.gender === "Homme").length;
  const femaleCount = patients.filter((p) => p.gender === "Femme").length;
  const childrenCount = patients.filter(isChild).length;

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
    const enfants = thisMonthPatientsList.filter(isChild).length;

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

    return {
      month: monthName,
      patients: thisMonthPatientsList.length,
      prevPatients: lastYearPatientsCount,
      growthText: `${growthRate}%`,
      hommes,
      femmes,
      enfants,
    };
  });
}
