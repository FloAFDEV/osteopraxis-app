
import { DashboardData } from "@/types";

export interface ProcessedGrowthData {
  month: string;
  total: number;
  hommes: number;
  femmes: number;
  mineurs: number;
  growthText: string;
}

export function processGrowthData(data: DashboardData): ProcessedGrowthData[] {
  if (!data || !data.monthlyGrowth) return [];

  // Traduction des mois
  const monthMap: Record<string, string> = {
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

  // Formater les données
  return data.monthlyGrowth.map((item) => {
    const total = item.patients || 0;

    // Obtention des valeurs réelles à partir des données du dashboard
    const malePercentage =
      data.totalPatients > 0 ? data.maleCount / data.totalPatients : 0.4;
    const childPercentage =
      data.totalPatients > 0 ? data.childrenCount / data.totalPatients : 0.2;

    // Calcul des proportions basé sur les pourcentages réels
    const maleCount = Math.round(total * malePercentage);
    const mineurCount = Math.round(total * childPercentage);
    const femaleCount = total - maleCount - mineurCount;

    return {
      month: monthMap[item.month] || item.month,
      total: total,
      hommes: maleCount,
      femmes: femaleCount,
      mineurs: mineurCount,
      growthText: item.growthText,
    };
  });
}

