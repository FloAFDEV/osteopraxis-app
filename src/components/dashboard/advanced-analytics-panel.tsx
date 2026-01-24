import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedStatsService, AdvancedStats } from "@/services/stats/advanced-stats-service";
import { api } from "@/services/api";
import { AlertCircle, TrendingUp, TrendingDown, Clock, Calendar, Users, Euro, FileX, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RevenueChart } from "./revenue-chart";
import { BlurredAmount, BlurredNumber } from "@/components/ui/blurred-amount";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { CollapsibleSection } from "./CollapsibleSection";

interface AdvancedAnalyticsPanelProps {
  selectedCabinetId?: number | null;
}

export function AdvancedAnalyticsPanel({ selectedCabinetId }: AdvancedAnalyticsPanelProps) {
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
        const advancedStats = await statsService.calculateAdvancedStats(
          currentOsteopath.id,
          selectedCabinetId
        );
        setStats(advancedStats);

      } catch (err) {
        console.error("Erreur lors du chargement des statistiques avancées:", err);
        setError("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    loadAdvancedStats();
  }, [selectedCabinetId]);

  if (loading) {
    return (
      <CollapsibleSection
        title="Statistiques Avancées"
        icon={<BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
        defaultOpen={false}
        storageKey="dashboard-advanced-stats-section"
      >
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CollapsibleSection>
    );
  }

  if (error || !stats) {
    return (
      <CollapsibleSection
        title="Statistiques Avancées"
        icon={<BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
        defaultOpen={false}
        storageKey="dashboard-advanced-stats-section"
      >
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Impossible de charger les statistiques avancées"}
          </AlertDescription>
        </Alert>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title="Statistiques Avancées"
      icon={<BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
      defaultOpen={false}
      storageKey="dashboard-advanced-stats-section"
    >
      <div className="space-y-6">
      {/* Section Revenue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Revenus & Analytics</h3>
          <PrivacyToggle />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Revenus ce mois</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <Euro className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              <BlurredAmount amount={stats.revenue.thisMonth} />
            </div>
            <div className="flex items-center text-xs">
              {stats.revenue.monthlyTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={stats.revenue.monthlyTrend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                {stats.revenue.monthlyTrend.toFixed(1)}% vs mois dernier
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Revenus annuels</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <BlurredAmount amount={stats.revenue.thisYear} />
            </div>
            <div className="flex items-center text-xs">
              {stats.revenue.yearlyTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={stats.revenue.yearlyTrend >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500"}>
                {stats.revenue.yearlyTrend.toFixed(1)}% vs année dernière
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Revenu moyen/RDV</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-full">
              <Euro className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              <BlurredAmount amount={stats.revenue.averagePerAppointment} />
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">Par consultation</p>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Section No-Show */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <div className="p-2 bg-red-500/10 rounded-full">
                <FileX className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Taux de No-Show
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Taux global</span>
                <span className="text-sm text-red-600 dark:text-red-400 font-semibold">{stats.noShow.rate.toFixed(1)}%</span>
              </div>
              <Progress value={stats.noShow.rate} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-red-500/5 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-xs">Ce mois</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.noShow.thisMonth}</p>
              </div>
              <div className="p-3 bg-red-500/5 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-xs">Mois dernier</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.noShow.lastMonth}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">Revenu perdu estimé</p>
              <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                <BlurredAmount amount={stats.noShow.totalLost} />
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <div className="p-2 bg-amber-500/10 rounded-full">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Heures de Pointe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.activity.busyHours.slice(0, 5).map(({ hour, count }, index) => (
                <div key={hour} className="flex justify-between items-center p-2 bg-amber-500/5 rounded-lg">
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{hour}h - {hour + 1}h</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(count / stats.activity.busyHours[0]?.count || 1) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-8 text-amber-700 dark:text-amber-300">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Top Patients */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <div className="p-2 bg-indigo-500/10 rounded-full">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Top Patients (Revenus)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.patients.topPatients.slice(0, 5).map((patient, index) => {
              const colors = [
                'bg-yellow-500 text-yellow-50',
                'bg-gray-400 text-gray-50', 
                'bg-amber-600 text-amber-50',
                'bg-indigo-500 text-indigo-50',
                'bg-purple-500 text-purple-50'
              ];
              return (
                <div key={patient.patientId} className="flex items-center justify-between py-3 px-4 bg-indigo-500/5 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-500/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${colors[index] || 'bg-indigo-500 text-indigo-50'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-indigo-900 dark:text-indigo-100">{patient.name}</p>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400">{patient.count} consultations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-700 dark:text-indigo-300">
                      <BlurredAmount amount={patient.totalSpent} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

        {/* Graphique des revenus */}
        <RevenueChart data={stats.revenue.monthlyBreakdown} />
      </div>
    </CollapsibleSection>
  );
}