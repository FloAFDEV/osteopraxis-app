
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/admin-service";
import { adminApiService } from "@/services/admin-api-service";
import { AdminLayout } from "@/components/ui/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { UsersManagement } from "./users-management";
import { CabinetsManagement } from "./cabinets-management";
import { PatientsManagement } from "./patients-management";
import { AuditLogsPanel } from "./audit-logs";
import { 
  Users, Building, Calendar, RefreshCw, User, ShieldCheck 
} from "lucide-react";

export function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOsteopaths: 0,
    totalCabinets: 0,
    totalPatients: 0,
    totalAppointments: 0
  });
  const [activeTab, setActiveTab] = useState("overview");

  // Charger les statistiques au montage du composant
  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        setLoading(true);
        
        // Utilisation du service API admin spécialisé
        const systemStats = await adminApiService.getSystemStats();
        
        setStats({
          totalUsers: systemStats.total_users || 0,
          totalOsteopaths: systemStats.total_osteopaths || 0,
          totalCabinets: systemStats.total_cabinets || 0,
          totalPatients: systemStats.total_patients || 0,
          totalAppointments: systemStats.total_appointments || 0
        });
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques admin:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === "ADMIN") {
      loadAdminStats();
    }
  }, [user]);
  
  if (!user || user.role !== "ADMIN") {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <ShieldCheck className="text-red-500 h-16 w-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Vous n'avez pas les droits d'administration nécessaires pour accéder à cette page.
          </p>
        </div>
      </AdminLayout>
    );
  }
  
  if (loading) {
    return <FancyLoader message="Chargement de l'interface d'administration..." />;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
              Interface d'Administration
            </h1>
            <p className="text-muted-foreground">
              Console d'administration système - Supervision complète des données et utilisateurs
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1.5 rounded-md text-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ostéopathes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.totalOsteopaths}</div>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cabinets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.totalCabinets}</div>
                <Building className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="cabinets">Cabinets</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Vue d'ensemble</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                      Interface d'Administration Système
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Panneau de contrôle complet avec accès privilégié à toutes les données de la plateforme.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>• Gestion des utilisateurs et rôles</div>
                      <div>• Supervision des cabinets</div>
                      <div>• Analyse des données patients</div>
                      <div>• Logs d'audit et sécurité</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Statistiques Temps Réel</h4>
                      <p className="text-sm text-muted-foreground">
                        Données mises à jour automatiquement depuis la base de données
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Contrôles Avancés</h4>
                      <p className="text-sm text-muted-foreground">
                        Outils de gestion et supervision globale de la plateforme
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>
          
          <TabsContent value="cabinets">
            <CabinetsManagement />
          </TabsContent>
          
          <TabsContent value="patients">
            <PatientsManagement />
          </TabsContent>
          
          <TabsContent value="audit">
            <AuditLogsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
