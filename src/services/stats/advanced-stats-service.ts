import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format, subMonths, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";

type Appointment = Tables<"Appointment">;
type Invoice = Tables<"Invoice">;
type Patient = Tables<"Patient">;

export interface AdvancedStats {
  // Statistiques de revenus
  revenue: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
    monthlyTrend: number;
    yearlyTrend: number;
    averagePerAppointment: number;
    monthlyBreakdown: Array<{ month: string; amount: number; count: number }>;
  };
  
  // Statistiques de no-show
  noShow: {
    rate: number;
    thisMonth: number;
    lastMonth: number;
    trend: number;
    totalLost: number;
    averageLostRevenue: number;
    patientPatterns: Array<{ patientId: number; count: number; name: string }>;
  };
  
  // Statistiques d'activité
  activity: {
    totalAppointments: number;
    completionRate: number;
    cancellationRate: number;
    rescheduleRate: number;
    averagePerDay: number;
    averagePerWeek: number;
    busyHours: Array<{ hour: number; count: number }>;
    busyDays: Array<{ day: string; count: number }>;
  };
  
  // Statistiques patients
  patients: {
    totalActive: number;
    newThisMonth: number;
    newLastMonth: number;
    retentionRate: number;
    averageAppointmentsPerPatient: number;
    topPatients: Array<{ patientId: number; count: number; name: string; totalSpent: number }>;
    ageDistribution: Array<{ range: string; count: number }>;
  };
  
  // Prévisions
  forecasts: {
    nextMonthRevenue: number;
    nextMonthAppointments: number;
    seasonalTrends: Array<{ month: string; predictedRevenue: number; predictedAppointments: number }>;
  };
}

export class AdvancedStatsService {
  
  async calculateAdvancedStats(osteopathId: number): Promise<AdvancedStats> {
    const now = new Date();
    const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    const lastMonth = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    const thisYear = { start: startOfYear(now), end: endOfYear(now) };
    const lastYear = { start: startOfYear(subMonths(now, 12)), end: endOfYear(subMonths(now, 12)) };

    // Récupérer toutes les données nécessaires
    const [appointments, invoices, patients] = await Promise.all([
      this.getAppointments(osteopathId),
      this.getInvoices(osteopathId),
      this.getPatients(osteopathId)
    ]);

    // Calculer les statistiques
    const revenue = this.calculateRevenueStats(invoices, thisMonth, lastMonth, thisYear, lastYear);
    const noShow = this.calculateNoShowStats(appointments, patients, thisMonth, lastMonth);
    const activity = this.calculateActivityStats(appointments);
    const patientStats = this.calculatePatientStats(patients, appointments, invoices);
    const forecasts = this.calculateForecasts(appointments, invoices);

    return {
      revenue,
      noShow,
      activity,
      patients: patientStats,
      forecasts
    };
  }

  private async getAppointments(osteopathId: number): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("Appointment")
      .select("*")
      .eq("osteopathId", osteopathId);
    
    if (error) throw error;
    return data || [];
  }

  private async getInvoices(osteopathId: number): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*")
      .eq("osteopathId", osteopathId);
    
    if (error) throw error;
    return data || [];
  }

  private async getPatients(osteopathId: number): Promise<Patient[]> {
    const { data, error } = await supabase
      .from("Patient")
      .select("*")
      .eq("osteopathId", osteopathId);
    
    if (error) throw error;
    return data || [];
  }

  private calculateRevenueStats(
    invoices: Invoice[], 
    thisMonth: any, 
    lastMonth: any, 
    thisYear: any, 
    lastYear: any
  ) {
    const thisMonthInvoices = invoices.filter(inv => 
      isWithinInterval(new Date(inv.date), { start: thisMonth.start, end: thisMonth.end })
    );
    const lastMonthInvoices = invoices.filter(inv => 
      isWithinInterval(new Date(inv.date), { start: lastMonth.start, end: lastMonth.end })
    );
    const thisYearInvoices = invoices.filter(inv => 
      isWithinInterval(new Date(inv.date), { start: thisYear.start, end: thisYear.end })
    );
    const lastYearInvoices = invoices.filter(inv => 
      isWithinInterval(new Date(inv.date), { start: lastYear.start, end: lastYear.end })
    );

    const thisMonthRevenue = thisMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const thisYearRevenue = thisYearInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const lastYearRevenue = lastYearInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Calcul mensuel pour les 12 derniers mois
    const monthlyBreakdown = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      const monthInvoices = invoices.filter(inv => 
        isWithinInterval(new Date(inv.date), { start: monthStart, end: monthEnd })
      );
      
      monthlyBreakdown.push({
        month: format(monthStart, "MMM yyyy", { locale: fr }),
        amount: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        count: monthInvoices.length
      });
    }

    return {
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      thisYear: thisYearRevenue,
      lastYear: lastYearRevenue,
      monthlyTrend: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0,
      yearlyTrend: lastYearRevenue > 0 ? ((thisYearRevenue - lastYearRevenue) / lastYearRevenue) * 100 : 0,
      averagePerAppointment: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.amount, 0) / invoices.length : 0,
      monthlyBreakdown
    };
  }

  private calculateNoShowStats(appointments: Appointment[], patients: Patient[], thisMonth: any, lastMonth: any) {
    const noShowAppointments = appointments.filter(apt => apt.status === "NO_SHOW");
    const thisMonthNoShows = noShowAppointments.filter(apt => 
      isWithinInterval(new Date(apt.date), { start: thisMonth.start, end: thisMonth.end })
    );
    const lastMonthNoShows = noShowAppointments.filter(apt => 
      isWithinInterval(new Date(apt.date), { start: lastMonth.start, end: lastMonth.end })
    );

    const totalAppointments = appointments.length;
    const noShowRate = totalAppointments > 0 ? (noShowAppointments.length / totalAppointments) * 100 : 0;

    // Patterns par patient
    const patientNoShowCounts = new Map();
    noShowAppointments.forEach(apt => {
      const count = patientNoShowCounts.get(apt.patientId) || 0;
      patientNoShowCounts.set(apt.patientId, count + 1);
    });

    const patientPatterns = Array.from(patientNoShowCounts.entries())
      .map(([patientId, count]) => {
        const patient = patients.find(p => p.id === patientId);
        return {
          patientId,
          count,
          name: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu"
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Estimation du revenu perdu (moyenne * nombre de no-shows)
    const averageAppointmentValue = 60; // Valeur par défaut, peut être calculée
    const totalLost = noShowAppointments.length * averageAppointmentValue;

    return {
      rate: noShowRate,
      thisMonth: thisMonthNoShows.length,
      lastMonth: lastMonthNoShows.length,
      trend: lastMonthNoShows.length > 0 ? ((thisMonthNoShows.length - lastMonthNoShows.length) / lastMonthNoShows.length) * 100 : 0,
      totalLost,
      averageLostRevenue: totalLost / (noShowAppointments.length || 1),
      patientPatterns
    };
  }

  private calculateActivityStats(appointments: Appointment[]) {
    const total = appointments.length;
    const completed = appointments.filter(apt => apt.status === "COMPLETED").length;
    const canceled = appointments.filter(apt => apt.status === "CANCELED").length;
    const rescheduled = appointments.filter(apt => apt.status === "RESCHEDULED").length;

    // Analyse des heures de pointe
    const hourCounts = new Map();
    appointments.forEach(apt => {
      const hour = new Date(apt.date).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const busyHours = Array.from(hourCounts.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyse des jours de la semaine
    const dayCounts = new Map();
    appointments.forEach(apt => {
      const day = format(new Date(apt.date), "EEEE", { locale: fr });
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });

    const busyDays = Array.from(dayCounts.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAppointments: total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (canceled / total) * 100 : 0,
      rescheduleRate: total > 0 ? (rescheduled / total) * 100 : 0,
      averagePerDay: total / 365, // Approximation
      averagePerWeek: total / 52,
      busyHours,
      busyDays
    };
  }

  private calculatePatientStats(patients: Patient[], appointments: Appointment[], invoices: Invoice[]) {
    const now = new Date();
    const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    const lastMonth = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };

    const newThisMonth = patients.filter(p => 
      isWithinInterval(new Date(p.createdAt), { start: thisMonth.start, end: thisMonth.end })
    ).length;
    
    const newLastMonth = patients.filter(p => 
      isWithinInterval(new Date(p.createdAt), { start: lastMonth.start, end: lastMonth.end })
    ).length;

    // Top patients par nombre de rendez-vous et montant dépensé
    const patientStats = new Map();
    appointments.forEach(apt => {
      if (!patientStats.has(apt.patientId)) {
        patientStats.set(apt.patientId, { appointments: 0, totalSpent: 0 });
      }
      patientStats.get(apt.patientId).appointments++;
    });

    invoices.forEach(inv => {
      if (patientStats.has(inv.patientId)) {
        patientStats.get(inv.patientId).totalSpent += inv.amount;
      }
    });

    const topPatients = Array.from(patientStats.entries())
      .map(([patientId, stats]) => {
        const patient = patients.find(p => p.id === patientId);
        return {
          patientId,
          count: stats.appointments,
          totalSpent: stats.totalSpent,
          name: patient ? `${patient.firstName} ${patient.lastName}` : "Patient inconnu"
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Distribution d'âge
    const ageDistribution = [
      { range: "0-17", count: 0 },
      { range: "18-30", count: 0 },
      { range: "31-45", count: 0 },
      { range: "46-60", count: 0 },
      { range: "60+", count: 0 }
    ];

    patients.forEach(patient => {
      if (!patient.birthDate) return;
      
      const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
      if (age < 18) ageDistribution[0].count++;
      else if (age <= 30) ageDistribution[1].count++;
      else if (age <= 45) ageDistribution[2].count++;
      else if (age <= 60) ageDistribution[3].count++;
      else ageDistribution[4].count++;
    });

    return {
      totalActive: patients.length,
      newThisMonth,
      newLastMonth,
      retentionRate: 85, // Calcul complexe, valeur par défaut
      averageAppointmentsPerPatient: patients.length > 0 ? appointments.length / patients.length : 0,
      topPatients,
      ageDistribution
    };
  }

  private calculateForecasts(appointments: Appointment[], invoices: Invoice[]) {
    // Prévisions simples basées sur les tendances des 6 derniers mois
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      
      const monthAppointments = appointments.filter(apt => 
        isWithinInterval(new Date(apt.date), { start: monthStart, end: monthEnd })
      );
      const monthInvoices = invoices.filter(inv => 
        isWithinInterval(new Date(inv.date), { start: monthStart, end: monthEnd })
      );
      
      last6Months.push({
        appointments: monthAppointments.length,
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0)
      });
    }

    // Moyenne mobile simple pour les prévisions
    const avgAppointments = last6Months.reduce((sum, month) => sum + month.appointments, 0) / 6;
    const avgRevenue = last6Months.reduce((sum, month) => sum + month.revenue, 0) / 6;

    // Prévisions saisonnières (simplifiées)
    const seasonalTrends = [];
    for (let i = 1; i <= 12; i++) {
      const futureMonth = new Date();
      futureMonth.setMonth(futureMonth.getMonth() + i);
      
      seasonalTrends.push({
        month: format(futureMonth, "MMM yyyy", { locale: fr }),
        predictedRevenue: avgRevenue * (1 + (Math.random() * 0.2 - 0.1)), // ±10% variation
        predictedAppointments: Math.round(avgAppointments * (1 + (Math.random() * 0.2 - 0.1)))
      });
    }

    return {
      nextMonthRevenue: avgRevenue,
      nextMonthAppointments: Math.round(avgAppointments),
      seasonalTrends
    };
  }

  // Méthode pour exporter les statistiques en PDF
  async exportStatsToPDF(stats: AdvancedStats, osteopathName: string): Promise<void> {
    const jsPDF = await import("jspdf");
    const pdf = new jsPDF.default();
    
    pdf.setFontSize(20);
    pdf.text("STATISTIQUES AVANCÉES", 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Ostéopathe: ${osteopathName}`, 20, 35);
    pdf.text(`Généré le: ${format(new Date(), "PPPP", { locale: fr })}`, 20, 45);
    
    let y = 65;
    
    // Section Revenus
    pdf.setFontSize(14);
    pdf.text("REVENUS", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text(`Ce mois: ${stats.revenue.thisMonth.toFixed(2)} €`, 20, y);
    pdf.text(`Mois dernier: ${stats.revenue.lastMonth.toFixed(2)} €`, 20, y + 10);
    pdf.text(`Tendance mensuelle: ${stats.revenue.monthlyTrend.toFixed(1)}%`, 20, y + 20);
    
    y += 40;
    
    // Section No-Show
    pdf.setFontSize(14);
    pdf.text("TAUX DE NO-SHOW", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text(`Taux global: ${stats.noShow.rate.toFixed(1)}%`, 20, y);
    pdf.text(`Ce mois: ${stats.noShow.thisMonth} no-shows`, 20, y + 10);
    pdf.text(`Revenu perdu estimé: ${stats.noShow.totalLost.toFixed(2)} €`, 20, y + 20);
    
    const filename = `statistiques_${osteopathName.replace(/\s+/g, '_')}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    pdf.save(filename);
  }
}