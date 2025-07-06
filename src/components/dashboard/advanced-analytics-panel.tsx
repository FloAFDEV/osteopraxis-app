import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedStatsService, AdvancedStats } from "@/services/stats/advanced-stats-service";
import { api } from "@/services/api";
import { AlertCircle, TrendingUp, TrendingDown, Clock, Calendar, Users, DollarSign, FileX } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RevenueChart } from "./revenue-chart";

export function AdvancedAnalyticsPanel() {
  const [stats, setStats] = useState<AdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAdvancedStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const currentOsteopath = await api.getCurrentOsteopath();
        if (!currentOsteopath) {
          setError("Impossible de récupérer les informations de l'ostéopathe");
          return;
        }

        const statsService = new AdvancedStatsService();
        const advancedStats = await statsService.calculateAdvancedStats(currentOsteopath.id);
        setStats(advancedStats);
        
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques avancées:", err);
        setError("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    loadAdvancedStats();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Statistiques Avancées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Statistiques Avancées</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || "Impossible de charger les statistiques avancées"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.thisMonth.toFixed(2)} €</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.revenue.monthlyTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {stats.revenue.monthlyTrend.toFixed(1)}% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus annuels</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.thisYear.toFixed(2)} €</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.revenue.yearlyTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {stats.revenue.yearlyTrend.toFixed(1)}% vs année dernière
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu moyen/RDV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.averagePerAppointment.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">Par consultation</p>
          </CardContent>
        </Card>
      </div>

      {/* Section No-Show */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileX className="h-5 w-5" />
              Taux de No-Show
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Taux global</span>
                <span className="text-sm text-muted-foreground">{stats.noShow.rate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.noShow.rate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold">{stats.noShow.thisMonth}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mois dernier</p>
                <p className="text-2xl font-bold">{stats.noShow.lastMonth}</p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Revenu perdu estimé</p>
              <p className="text-lg font-semibold text-red-600">{stats.noShow.totalLost.toFixed(2)} €</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Heures de Pointe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.activity.busyHours.slice(0, 5).map(({ hour, count }) => (
                <div key={hour} className="flex justify-between items-center">
                  <span className="text-sm">{hour}h - {hour + 1}h</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / stats.activity.busyHours[0]?.count || 1) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Top Patients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Patients (Revenus)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.patients.topPatients.slice(0, 5).map((patient, index) => (
              <div key={patient.patientId} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.count} consultations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{patient.totalSpent.toFixed(2)} €</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section Jours de la Semaine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Répartition par Jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {stats.activity.busyDays.map(({ day, count }) => (
              <div key={day} className="text-center p-3 bg-secondary/50 rounded">
                <p className="text-xs font-medium uppercase">{day.slice(0, 3)}</p>
                <p className="text-lg font-bold">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Graphique des revenus */}
      <RevenueChart data={stats.revenue.monthlyBreakdown} />
    </div>
  );
}