
// Liste des mois en français pour l'affichage des données
export const FRENCH_MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

// Données initiales pour la croissance mensuelle
export const initialMonthlyGrowth = FRENCH_MONTHS.map((month) => ({
  month,
  patients: 0,
  prevPatients: 0,
  growthText: "0%",
  hommes: 0,
  femmes: 0,
  enfants: 0,
  mineurs: 0, // Ajouter la clé mineurs aussi
}));

// Structure des données initiales du tableau de bord
export const initialDashboardData = {
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
  nextAppointment: null,
  patientsLastYearEnd: 0,
  newPatientsLast30Days: 0,
  thirtyDayGrowthPercentage: 0,
  annualGrowthPercentage: 0,
  childrenCount: 0,
  monthlyGrowth: initialMonthlyGrowth,
};
