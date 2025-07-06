import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
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
}

interface AdvancedAnalyticsDashboardProps {
  data?: AnalyticsData;
  isLoading?: boolean;
}

export const AdvancedAnalyticsDashboard = ({ 
  data, 
  isLoading = false 
}: AdvancedAnalyticsDashboardProps) => {
  
  // Mock data for demonstration
  const mockData: AnalyticsData = {
    totalPatients: 234,
    totalAppointments: 1456,
    totalRevenue: 87450,
    averageNoShowRate: 8.5,
    averageCompletionRate: 89.2,
    monthlyTrends: [
      { month: 'Jan 2024', appointments: 120, revenue: 7200, noShowRate: 12 },
      { month: 'Fév 2024', appointments: 135, revenue: 8100, noShowRate: 9 },
      { month: 'Mar 2024', appointments: 142, revenue: 8520, noShowRate: 7 },
      { month: 'Avr 2024', appointments: 158, revenue: 9480, noShowRate: 6 },
      { month: 'Mai 2024', appointments: 134, revenue: 8040, noShowRate: 8 },
      { month: 'Juin 2024', appointments: 167, revenue: 10020, noShowRate: 5 },
    ]
  };

  const analyticsData = data || mockData;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getNoShowBadge = (rate: number) => {
    if (rate < 5) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rate < 10) return <Badge className="bg-yellow-100 text-yellow-800">Correct</Badge>;
    return <Badge className="bg-red-100 text-red-800">À améliorer</Badge>;
  };

  const getCompletionBadge = (rate: number) => {
    if (rate > 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rate > 80) return <Badge className="bg-yellow-100 text-yellow-800">Bon</Badge>;
    return <Badge className="bg-red-100 text-red-800">À améliorer</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Séances</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +5% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalRevenue.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">
              +8% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réalisation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageCompletionRate.toFixed(1)}%</div>
            {getCompletionBadge(analyticsData.averageCompletionRate)}
          </CardContent>
        </Card>
      </div>

      {/* Analyse des no-shows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Analyse des absences (No-show)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-amber-600">
                {analyticsData.averageNoShowRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Taux moyen d'absence</p>
            </div>
            {getNoShowBadge(analyticsData.averageNoShowRate)}
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Recommandations :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {analyticsData.averageNoShowRate > 10 && (
                <li>• Taux élevé - Implémentez des rappels SMS/email</li>
              )}
              {analyticsData.averageNoShowRate > 15 && (
                <li>• Considérez une politique d'annulation avec pénalités</li>
              )}
              <li>• Analysez les créneaux les plus touchés</li>
              <li>• Demandez confirmation 24h avant le rendez-vous</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Tendances mensuelles */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.monthlyTrends.slice(-6).map((trend, index) => (
              <div key={trend.month} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">{trend.month}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {trend.appointments} séances
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    {trend.revenue.toLocaleString()} €
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {trend.noShowRate < 10 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">{trend.noShowRate}% no-show</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};