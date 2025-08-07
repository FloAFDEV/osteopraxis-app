import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Globe,
  BarChart3,
  PieChart,
  Download,
  Calendar
} from "lucide-react";

interface BusinessMetrics {
  mrr: number;
  arr: number;
  totalRevenue: number;
  newCustomers: number;
  churnRate: number;
  ltv: number;
  cac: number;
  activeUsers: number;
  engagementRate: number;
}

interface GeographicData {
  country: string;
  users: number;
  revenue: number;
  percentage: number;
}

interface UsageMetrics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
}

export function BusinessAnalytics() {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    mrr: 0,
    arr: 0,
    totalRevenue: 0,
    newCustomers: 0,
    churnRate: 0,
    ltv: 0,
    cac: 0,
    activeUsers: 0,
    engagementRate: 0
  });

  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    dailyActiveUsers: 0,
    monthlyActiveUsers: 0,
    sessionDuration: 0,
    pagesPerSession: 0,
    bounceRate: 0
  });

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    loadBusinessData();
  }, [selectedPeriod]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Charger les métriques de base
      const { data: subscribers } = await supabase
        .from("subscribers")
        .select("*");

      const { data: businessMetricsData } = await supabase
        .from("business_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // Calculer les métriques financières
      const activeSubscribers = subscribers?.filter(s => s.subscribed) || [];
      const premiumUsers = activeSubscribers.filter(s => s.subscription_tier === "Premium");
      const enterpriseUsers = activeSubscribers.filter(s => s.subscription_tier === "Entreprise");
      
      const mrr = (premiumUsers.length * 29.99) + (enterpriseUsers.length * 99.99);
      const arr = mrr * 12;

      // Simuler d'autres métriques
      const newCustomers = Math.floor(Math.random() * 50) + 20;
      const churnRate = Math.random() * 5 + 2;
      const ltv = mrr > 0 ? (mrr / churnRate) * 24 : 0;
      const cac = Math.random() * 100 + 50;
      const activeUsers = Math.floor(Math.random() * 1000) + 500;
      const engagementRate = Math.random() * 30 + 60;

      setMetrics({
        mrr,
        arr,
        totalRevenue: arr * 0.8, // Simulation
        newCustomers,
        churnRate,
        ltv,
        cac,
        activeUsers,
        engagementRate
      });

      // Données géographiques simulées
      const geoData: GeographicData[] = [
        { country: "France", users: 450, revenue: 12500, percentage: 65 },
        { country: "Belgique", users: 120, revenue: 3200, percentage: 18 },
        { country: "Suisse", users: 80, revenue: 2800, percentage: 12 },
        { country: "Canada", users: 35, revenue: 980, percentage: 5 }
      ];
      setGeographicData(geoData);

      // Métriques d'usage simulées
      setUsageMetrics({
        dailyActiveUsers: Math.floor(Math.random() * 200) + 100,
        monthlyActiveUsers: Math.floor(Math.random() * 800) + 400,
        sessionDuration: Math.random() * 10 + 15, // minutes
        pagesPerSession: Math.random() * 3 + 4,
        bounceRate: Math.random() * 20 + 30 // pourcentage
      });

    } catch (error) {
      console.error("Erreur lors du chargement des analytics:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsReport = () => {
    const reportData = {
      metrics,
      geographicData,
      usageMetrics,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `business-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Business</h2>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Année</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalyticsReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList>
          <TabsTrigger value="financial">KPIs Financiers</TabsTrigger>
          <TabsTrigger value="usage">Métriques d'Usage</TabsTrigger>
          <TabsTrigger value="geographic">Analyse Géographique</TabsTrigger>
          <TabsTrigger value="reports">Rapports Exportables</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <div className="space-y-6">
            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-600">€{metrics.mrr.toFixed(0)}</div>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +12% vs mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">ARR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-blue-600">€{metrics.arr.toFixed(0)}</div>
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenus récurrents annuels
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">LTV</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">€{metrics.ltv.toFixed(0)}</div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valeur vie client
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">CAC</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-orange-600">€{metrics.cac.toFixed(0)}</div>
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coût acquisition client
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Métriques secondaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Nouveaux Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metrics.newCustomers}</div>
                  <p className="text-xs text-green-600 mt-1">+8% vs période précédente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taux de Churn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{metrics.churnRate.toFixed(1)}%</div>
                  <p className="text-xs text-red-600 mt-1">-2% vs période précédente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Ratio LTV/CAC</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {metrics.cac > 0 ? (metrics.ltv / metrics.cac).toFixed(1) : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Objectif: &gt; 3.0</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">DAU</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageMetrics.dailyActiveUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Utilisateurs actifs/jour</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">MAU</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageMetrics.monthlyActiveUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Utilisateurs actifs/mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Durée Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageMetrics.sessionDuration.toFixed(1)}m</div>
                  <p className="text-xs text-muted-foreground mt-1">Durée moyenne</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pages/Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageMetrics.pagesPerSession.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pages consultées</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taux de Rebond</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{usageMetrics.bounceRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Sessions courtes</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Taux d'Engagement par Fonctionnalité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { feature: "Gestion Patients", usage: 85, users: 340 },
                    { feature: "Rendez-vous", usage: 78, users: 312 },
                    { feature: "Facturation", usage: 65, users: 260 },
                    { feature: "Rapports", usage: 45, users: 180 },
                    { feature: "Paramètres", usage: 32, users: 128 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.feature}</span>
                          <span className="text-sm text-muted-foreground">{item.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.usage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-4 text-sm text-muted-foreground">{item.users} users</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Répartition Géographique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {geographicData.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                            {country.country.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{country.users} users</div>
                          <div className="text-sm text-muted-foreground">€{country.revenue}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Revenus par Région
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {geographicData.map((country, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{country.country}</span>
                          <span>{country.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${country.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rapports Exportables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Rapport Financier</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      MRR, ARR, LTV, CAC et métriques de revenus
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Analyse d'Usage</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      DAU, MAU, engagement et comportement utilisateurs
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger Excel
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Données Géographiques</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Répartition géographique et revenus par région
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger CSV
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Rapport Exécutif</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Synthèse complète pour la direction
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Données Brutes</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Export complet des données pour analyse
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger JSON
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Rapport Personnalisé</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Créer un rapport sur mesure
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Configurer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}