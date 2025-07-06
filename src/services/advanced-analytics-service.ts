import { supabase } from '@/integrations/supabase/client';
import { AdvancedAnalytics } from '@/types';

export class AdvancedAnalyticsService {
  
  async getAdvancedAnalytics(osteopathId?: number): Promise<AdvancedAnalytics[]> {
    const { data, error } = await supabase.rpc('get_advanced_analytics', {
      p_osteopath_id: osteopathId || null
    });

    if (error) {
      console.error('Error fetching advanced analytics:', error);
      throw error;
    }

    return data?.map(this.mapToAdvancedAnalytics) || [];
  }

  async getAnalyticsSummary(osteopathId?: number): Promise<{
    totalPatients: number;
    totalAppointments: number;
    totalRevenue: number;
    averageNoShowRate: number;
    averageCompletionRate: number;
    monthlyTrends: {
      month: string;
      appointments: number;
      revenue: number;
      noShowRate: number;
    }[];
  }> {
    const analytics = await this.getAdvancedAnalytics(osteopathId);
    
    const totalPatients = analytics.reduce((sum, a) => sum + a.newPatients, 0);
    const totalAppointments = analytics.reduce((sum, a) => sum + a.totalAppointments, 0);
    const totalRevenue = analytics.reduce((sum, a) => sum + a.totalRevenue, 0);
    
    const avgNoShowRate = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.noShowRate, 0) / analytics.length
      : 0;
    
    const avgCompletionRate = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.completionRate, 0) / analytics.length
      : 0;

    const monthlyTrends = analytics.slice(0, 12).map(a => ({
      month: new Date(a.month).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      appointments: a.totalAppointments,
      revenue: a.totalRevenue,
      noShowRate: a.noShowRate * 100
    }));

    return {
      totalPatients,
      totalAppointments,
      totalRevenue,
      averageNoShowRate: avgNoShowRate * 100,
      averageCompletionRate: avgCompletionRate * 100,
      monthlyTrends
    };
  }

  async getNoShowAnalysis(osteopathId?: number): Promise<{
    currentMonthRate: number;
    previousMonthRate: number;
    trend: 'up' | 'down' | 'stable';
    suggestions: string[];
  }> {
    const analytics = await this.getAdvancedAnalytics(osteopathId);
    
    if (analytics.length < 2) {
      return {
        currentMonthRate: 0,
        previousMonthRate: 0,
        trend: 'stable',
        suggestions: []
      };
    }

    const currentMonthRate = analytics[0].noShowRate * 100;
    const previousMonthRate = analytics[1].noShowRate * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currentMonthRate > previousMonthRate + 2) trend = 'up';
    else if (currentMonthRate < previousMonthRate - 2) trend = 'down';

    const suggestions = this.getNoShowSuggestions(currentMonthRate, trend);

    return {
      currentMonthRate,
      previousMonthRate,
      trend,
      suggestions
    };
  }

  async getRevenueAnalysis(osteopathId?: number): Promise<{
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    trend: 'up' | 'down' | 'stable';
    yearlyProjection: number;
    unpaidAmount: number;
  }> {
    const analytics = await this.getAdvancedAnalytics(osteopathId);
    
    if (analytics.length === 0) {
      return {
        currentMonthRevenue: 0,
        previousMonthRevenue: 0,
        trend: 'stable',
        yearlyProjection: 0,
        unpaidAmount: 0
      };
    }

    const currentMonthRevenue = analytics[0].totalRevenue;
    const previousMonthRevenue = analytics.length > 1 ? analytics[1].totalRevenue : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currentMonthRevenue > previousMonthRevenue * 1.05) trend = 'up';
    else if (currentMonthRevenue < previousMonthRevenue * 0.95) trend = 'down';

    // Projection basée sur les 6 derniers mois
    const last6Months = analytics.slice(0, 6);
    const avgMonthlyRevenue = last6Months.reduce((sum, a) => sum + a.totalRevenue, 0) / Math.max(last6Months.length, 1);
    const yearlyProjection = avgMonthlyRevenue * 12;

    // Montant impayé (différence entre chiffre d'affaires total et payé)
    const unpaidAmount = analytics.reduce((sum, a) => sum + (a.totalRevenue - a.paidRevenue), 0);

    return {
      currentMonthRevenue,
      previousMonthRevenue,
      trend,
      yearlyProjection,
      unpaidAmount
    };
  }

  async getPatientGrowthAnalysis(osteopathId?: number): Promise<{
    newPatientsThisMonth: number;
    newPatientsLastMonth: number;
    growthRate: number;
    childrenRatio: number;
    monthlyGrowth: { month: string; newPatients: number; children: number }[];
  }> {
    const analytics = await this.getAdvancedAnalytics(osteopathId);
    
    if (analytics.length === 0) {
      return {
        newPatientsThisMonth: 0,
        newPatientsLastMonth: 0,
        growthRate: 0,
        childrenRatio: 0,
        monthlyGrowth: []
      };
    }

    const newPatientsThisMonth = analytics[0].newPatients;
    const newPatientsLastMonth = analytics.length > 1 ? analytics[1].newPatients : 0;
    
    const growthRate = newPatientsLastMonth > 0 
      ? ((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100
      : 0;

    const totalNewPatients = analytics.reduce((sum, a) => sum + a.newPatients, 0);
    const totalNewChildren = analytics.reduce((sum, a) => sum + a.newChildren, 0);
    const childrenRatio = totalNewPatients > 0 ? (totalNewChildren / totalNewPatients) * 100 : 0;

    const monthlyGrowth = analytics.slice(0, 12).map(a => ({
      month: new Date(a.month).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      newPatients: a.newPatients,
      children: a.newChildren
    }));

    return {
      newPatientsThisMonth,
      newPatientsLastMonth,
      growthRate,
      childrenRatio,
      monthlyGrowth
    };
  }

  private getNoShowSuggestions(rate: number, trend: 'up' | 'down' | 'stable'): string[] {
    const suggestions: string[] = [];

    if (rate > 15) {
      suggestions.push('Taux de no-show élevé. Considérez l\'envoi de rappels SMS/email');
      suggestions.push('Implémentez une politique d\'annulation avec pénalités');
      suggestions.push('Demandez confirmation 24h avant le rendez-vous');
    }

    if (trend === 'up') {
      suggestions.push('Le taux de no-show augmente. Analysez les créneaux les plus touchés');
      suggestions.push('Vérifiez la qualité de vos communications avec les patients');
    }

    if (rate > 10) {
      suggestions.push('Considérez des créneaux de rendez-vous plus flexibles');
      suggestions.push('Analysez les raisons fréquentes d\'annulation');
    }

    return suggestions;
  }

  private mapToAdvancedAnalytics(data: any): AdvancedAnalytics {
    return {
      osteopathId: data.osteopath_id,
      month: data.month,
      totalAppointments: parseInt(data.total_appointments),
      completedAppointments: parseInt(data.completed_appointments),
      noShowAppointments: parseInt(data.no_show_appointments),
      canceledAppointments: parseInt(data.canceled_appointments),
      completionRate: parseFloat(data.completion_rate),
      noShowRate: parseFloat(data.no_show_rate),
      totalRevenue: parseFloat(data.total_revenue),
      totalInvoices: parseInt(data.total_invoices),
      avgInvoiceAmount: parseFloat(data.avg_invoice_amount),
      paidInvoices: parseInt(data.paid_invoices),
      paidRevenue: parseFloat(data.paid_revenue),
      newPatients: parseInt(data.new_patients),
      newChildren: parseInt(data.new_children),
    };
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();