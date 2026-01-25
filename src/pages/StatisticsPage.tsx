import { Layout } from "@/components/ui/layout";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useState } from "react";
import { ConsultationsChart } from "@/components/dashboard/consultations-chart";
import { DemographicsCard } from "@/components/dashboard/demographics-card";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { AdvancedAnalyticsPanel } from "@/components/dashboard/advanced-analytics-panel";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { DemoIndicator } from "@/components/demo/DemoIndicator";

const StatisticsPage = () => {
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);

  const { dashboardData, allPatients, loading, error } = useDashboardStats(selectedCabinetId);

  if (loading) {
    return (
      <Layout>
        <GradientBackground variant="subtle" className="p-3 md:p-6 rounded-xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </GradientBackground>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <GradientBackground variant="subtle" className="p-3 md:p-6 rounded-xl">
          <div className="text-center py-8">
            <p className="text-destructive">Erreur lors du chargement des statistiques</p>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        </GradientBackground>
      </Layout>
    );
  }

  return (
    <Layout>
      <GradientBackground variant="subtle" className="p-3 md:p-6 rounded-xl animate-fade-in">
        {/* Badge démo */}
        {isDemoMode && (
          <div className="mb-6">
            <DemoIndicator />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold">Statistiques</h1>
            </div>
          </div>
        </div>

        {isDemoMode && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Mode démo :</strong> Ces statistiques sont basées sur des données fictives pour illustrer les fonctionnalités de l'application.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {/* Section Consultations et Démographie */}
          <CollapsibleSection
            title="Consultations & Démographie"
            icon={<TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
            defaultOpen={true}
            storageKey="stats-consultations-section"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Consultations
                </h3>
                <ConsultationsChart data={dashboardData} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Démographie
                </h3>
                <DemographicsCard
                  patients={allPatients}
                  data={dashboardData}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Section Évolution de l'activité - Le composant a déjà son propre CollapsibleSection */}
          <DashboardContent dashboardData={dashboardData} />

          {/* Analytics Avancées - Le composant a déjà son propre CollapsibleSection */}
          <AdvancedAnalyticsPanel selectedCabinetId={selectedCabinetId} />
        </div>
      </GradientBackground>
    </Layout>
  );
};

export default StatisticsPage;
