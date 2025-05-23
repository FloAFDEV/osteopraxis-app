
import { DashboardData } from "@/types";

/**
 * Traduit les mois en anglais vers le français
 */
export const monthMap: Record<string, string> = {
  January: "Janvier",
  February: "Février",
  March: "Mars",
  April: "Avril",
  May: "Mai",
  June: "Juin",
  July: "Juillet",
  August: "Août",
  September: "Septembre",
  October: "Octobre",
  November: "Novembre",
  December: "Décembre",
};

/**
 * Traduction des noms de séries pour l'affichage
 */
export const nameMap: Record<string, string> = {
  total: "Total",
  hommes: "Hommes",
  femmes: "Femmes",
  enfants: "Enfants",
};

/**
 * Transforme les données brutes du dashboard en format adapté pour le graphique
 * en calculant les proportions homme/femme/enfants de manière cohérente
 */
export const prepareChartData = (data: DashboardData | undefined) => {
  if (!data || !data.monthlyGrowth) return [];

  // Formater les données
  return data.monthlyGrowth.map((item) => {
    const total = item.patients || 0;
    
    // Obtention des valeurs réelles à partir des données du dashboard
    const malePercentage = data.totalPatients > 0 
      ? data.maleCount / data.totalPatients 
      : 0.4;
    const childPercentage = data.totalPatients > 0 
      ? data.childrenCount / data.totalPatients 
      : 0.2;
    
    // Calcul des proportions basé sur les pourcentages réels
    const maleCount = Math.round(total * malePercentage);
    const childCount = Math.round(total * childPercentage);
    const femaleCount = total - maleCount - childCount;

    return {
      month: monthMap[item.month] || item.month,
      total: total,
      hommes: maleCount,
      femmes: femaleCount,
      enfants: childCount,
      growthText: item.growthText,
    };
  });
};

/**
 * Formate le nom des séries pour l'affichage dans les tooltip/légendes
 */
export const formatSeriesName = (value: string) => {
  return nameMap[value] || value;
};
