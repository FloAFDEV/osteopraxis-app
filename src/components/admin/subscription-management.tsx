import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Filter,
  Download
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionStats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  conversionRate: number;
  churnRate: number;
  trialExpiringCount: number;
}

export function SubscriptionManagement() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    churnRate: 0,
    trialExpiringCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("all");

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Charger les abonnés
      const { data: subscribersData, error: subscribersError } = await supabase
        .from("subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (subscribersError) throw subscribersError;
      setSubscribers(subscribersData || []);

      // Calculer les statistiques
      const total = subscribersData?.length || 0;
      const active = subscribersData?.filter(s => s.subscribed).length || 0;
      
      // Revenus mensuels (simulation basée sur les plans)
      const monthlyRevenue = subscribersData?.reduce((sum, sub) => {
        if (!sub.subscribed) return sum;
        switch (sub.subscription_tier) {
          case 'Premium': return sum + 29.99;
          case 'Entreprise': return sum + 99.99;
          default: return sum;
        }
      }, 0) || 0;

      // Calculs de conversion et churn (simulations)
      const conversionRate = total > 0 ? (active / total) * 100 : 0;
      const churnRate = Math.random() * 5; // Simulation

      // Abonnements expirant bientôt
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const trialExpiring = subscribersData?.filter(sub => {
        if (!sub.subscription_end) return false;
        const endDate = new Date(sub.subscription_end);
        return endDate <= nextWeek && endDate > now;
      }).length || 0;

      setStats({
        totalSubscribers: total,
        activeSubscribers: active,
        monthlyRevenue,
        conversionRate,
        churnRate,
        trialExpiringCount: trialExpiring
      });

    } catch (error) {
      console.error("Erreur lors du chargement des données d'abonnement:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (subscriberId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("subscribers")
        .update({ 
          subscribed: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", subscriberId);

      if (error) throw error;
      
      toast.success(`Abonnement ${!currentStatus ? "activé" : "suspendu"}`);
      loadSubscriptionData();
    } catch (error) {
      console.error("Erreur lors de la modification de l'abonnement:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const exportSubscriberData = () => {
    const csvData = subscribers.map(sub => ({
      Email: sub.email,
      Statut: sub.subscribed ? "Actif" : "Inactif",
      Plan: sub.subscription_tier || "Gratuit",
      "Date de fin": sub.subscription_end || "N/A",
      "Date de création": new Date(sub.created_at).toLocaleDateString('fr-FR')
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === "all" || 
      (filterTier === "free" && !sub.subscribed) ||
      (filterTier === "premium" && sub.subscription_tier === "Premium") ||
      (filterTier === "enterprise" && sub.subscription_tier === "Entreprise");
    
    return matchesSearch && matchesTier;
  });

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
        <h2 className="text-2xl font-bold">Gestion des Abonnements</h2>
        <Button onClick={exportSubscriberData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Abonnés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeSubscribers}</div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus Mensuels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-green-600">€{stats.monthlyRevenue.toFixed(0)}</div>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-red-600">{stats.churnRate.toFixed(1)}%</div>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expirant Bientôt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-orange-600">{stats.trialExpiringCount}</div>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">Tous les plans</option>
            <option value="free">Gratuit</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Entreprise</option>
          </select>
        </div>
      </div>

      {/* Liste des abonnés */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnés ({filteredSubscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubscribers.map((subscriber) => (
              <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{subscriber.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Créé le {new Date(subscriber.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge variant={subscriber.subscribed ? "default" : "secondary"}>
                    {subscriber.subscription_tier || "Gratuit"}
                  </Badge>
                  
                  {subscriber.subscription_end && (
                    <div className="text-sm text-muted-foreground">
                      Expire le {new Date(subscriber.subscription_end).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant={subscriber.subscribed ? "destructive" : "default"}
                    onClick={() => toggleSubscription(subscriber.id, subscriber.subscribed)}
                  >
                    {subscriber.subscribed ? "Suspendre" : "Activer"}
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredSubscribers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun abonné trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}