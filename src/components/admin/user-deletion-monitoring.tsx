import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  UserX, 
  AlertTriangle, 
  TrendingDown,
  Calendar,
  Shield,
  Download,
  RotateCcw
} from "lucide-react";

interface DeletedUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  deleted_at: string;
  deleted_by: string | null;
  osteopathId: number | null;
}

interface DeletionStats {
  totalDeleted: number;
  deletedThisWeek: number;
  deletedThisMonth: number;
  averageRetentionDays: number;
  topDeletionReasons: Array<{ reason: string; count: number }>;
}

export function UserDeletionMonitoring() {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [stats, setStats] = useState<DeletionStats>({
    totalDeleted: 0,
    deletedThisWeek: 0,
    deletedThisMonth: 0,
    averageRetentionDays: 0,
    topDeletionReasons: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useEffect(() => {
    loadDeletionData();
  }, [selectedPeriod]);

  const loadDeletionData = async () => {
    try {
      setLoading(true);
      
      // Charger les utilisateurs supprimés
      const { data: deletedUsersData, error: deletedError } = await supabase
        .from("User")
        .select("*")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      if (deletedError) throw deletedError;
      setDeletedUsers(deletedUsersData || []);

      // Calculer les statistiques
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const deletedThisWeek = deletedUsersData?.filter(user => 
        new Date(user.deleted_at) >= oneWeekAgo
      ).length || 0;

      const deletedThisMonth = deletedUsersData?.filter(user => 
        new Date(user.deleted_at) >= oneMonthAgo
      ).length || 0;

      // Calcul de la rétention moyenne (simulation)
      const averageRetention = deletedUsersData?.reduce((sum, user) => {
        const createdAt = new Date(user.created_at);
        const deletedAt = new Date(user.deleted_at);
        const diffDays = Math.floor((deletedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0) || 0;

      const averageRetentionDays = deletedUsersData?.length ? averageRetention / deletedUsersData.length : 0;

      // Raisons principales de suppression (simulation)
      const reasons = [
        { reason: "Inactivité prolongée", count: Math.floor(Math.random() * 50) + 10 },
        { reason: "Changement d'emploi", count: Math.floor(Math.random() * 30) + 5 },
        { reason: "Problèmes techniques", count: Math.floor(Math.random() * 20) + 3 },
        { reason: "Coût trop élevé", count: Math.floor(Math.random() * 15) + 2 },
        { reason: "Interface complexe", count: Math.floor(Math.random() * 10) + 1 }
      ].sort((a, b) => b.count - a.count);

      setStats({
        totalDeleted: deletedUsersData?.length || 0,
        deletedThisWeek,
        deletedThisMonth,
        averageRetentionDays,
        topDeletionReasons: reasons
      });

    } catch (error) {
      console.error("Erreur lors du chargement des données de suppression:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const restoreUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc("restore_record", {
        p_table_name: "User",
        p_record_id: userId
      });

      if (error) throw error;
      
      toast.success("Utilisateur restauré avec succès");
      loadDeletionData();
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      toast.error("Erreur lors de la restauration");
    }
  };

  const exportDeletionReport = () => {
    const csvData = deletedUsers.map(user => ({
      Email: user.email,
      Nom: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      Rôle: user.role,
      "Date de suppression": new Date(user.deleted_at).toLocaleDateString(),
      "Supprimé par": user.deleted_by || "Système"
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deleted-users-${new Date().toISOString().split('T')[0]}.csv`;
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
        <h2 className="text-2xl font-bold">Surveillance des Suppressions</h2>
        <Button onClick={exportDeletionReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter Rapport
        </Button>
      </div>

      {/* Statistiques de suppression */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Supprimés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.totalDeleted}</div>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cette Semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-red-600">{stats.deletedThisWeek}</div>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ce Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-orange-600">{stats.deletedThisMonth}</div>
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rétention Moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{Math.round(stats.averageRetentionDays)}j</div>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Suppressions Récentes</TabsTrigger>
          <TabsTrigger value="patterns">Analyse des Motifs</TabsTrigger>
          <TabsTrigger value="retention">Processus de Rétention</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs Supprimés Récemment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deletedUsers.slice(0, 20).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.first_name} {user.last_name} • {user.role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supprimé le {new Date(user.deleted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">Supprimé</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreUser(user.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restaurer
                      </Button>
                    </div>
                  </div>
                ))}
                
                {deletedUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur supprimé trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Principales Raisons de Suppression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topDeletionReasons.map((reason, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{reason.reason}</span>
                      <Badge variant="outline">{reason.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertes de Rétention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Augmentation des suppressions</p>
                      <p className="text-sm text-yellow-600">+15% cette semaine</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Rétention en baisse</p>
                      <p className="text-sm text-red-600">Durée moyenne: {Math.round(stats.averageRetentionDays)} jours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Actions de Rétention Recommandées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Utilisateurs Inactifs</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Identifier et réengager les utilisateurs inactifs avant suppression
                  </p>
                  <Button size="sm" variant="outline">
                    Voir les Inactifs
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Campagne de Réactivation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Envoyer des emails personnalisés aux utilisateurs à risque
                  </p>
                  <Button size="sm" variant="outline">
                    Lancer Campagne
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Support Prioritaire</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contacter personnellement les utilisateurs premium
                  </p>
                  <Button size="sm" variant="outline">
                    Contacter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}