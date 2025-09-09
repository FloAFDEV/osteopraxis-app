
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/admin-service";
import { adminApiService } from "@/services/admin-api-service";
import { AdminLayout } from "@/components/ui/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { UsersManagement } from "./users-management";
import { CabinetsManagement } from "./cabinets-management";
import { PatientsManagement } from "./patients-management";
import { AdminSettingsPanel } from "./admin-settings";
import { AuditLogsPanel } from "./audit-logs";
import { AdminLogsPanel } from "./admin-logs";
import { SystemHealthPanel } from "./system-health";
import { DetailedStatsPanel } from "./detailed-stats";
import { DeletedRecordsManager } from "./deleted-records-manager";
import { USBMonitoringDashboard } from "@/components/secure-usb/USBMonitoringDashboard";
import { SubscriptionManagement } from "./subscription-management";
import { UserDeletionMonitoring } from "./user-deletion-monitoring";
import { BusinessAnalytics } from "./business-analytics";
import { ProactiveUserManagement } from "./proactive-user-management";
import { SecurityCompliance } from "./security-compliance";
import { SystemOptimization } from "./system-optimization";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { SimpleAdminOverview } from "./simple-admin-overview";
import { 
  Users, Building, Calendar, RefreshCw, User, ShieldCheck, TestTube 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        
        {/* Actions rapides */}
        <QuickActionsPanel />
        
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Navigation principale avec groupes */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Groupe Supervision */}
                <div className="bg-card rounded-lg border p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Supervision</div>
                  <div className="flex gap-1">
                    <TabsList className="grid grid-cols-2 h-auto p-1 bg-muted/50">
                      <TabsTrigger value="overview" className="text-sm px-4 py-2">Vue d'ensemble</TabsTrigger>
                      <TabsTrigger value="health" className="text-sm px-4 py-2">Santé Système</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* Groupe Données */}
                <div className="bg-card rounded-lg border p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Gestion des Données</div>
                  <div className="flex gap-1">
                    <TabsList className="grid grid-cols-4 h-auto p-1 bg-muted/50">
                      <TabsTrigger value="users" className="text-sm px-4 py-2">Utilisateurs</TabsTrigger>
                      <TabsTrigger value="cabinets" className="text-sm px-4 py-2">Cabinets</TabsTrigger>
                      <TabsTrigger value="patients" className="text-sm px-4 py-2">Patients</TabsTrigger>
                      <TabsTrigger value="deleted" className="text-sm px-4 py-2">Supprimés</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* Groupe Analytics */}
                <div className="bg-card rounded-lg border p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Analytics & Business</div>
                  <div className="flex gap-1">
                    <TabsList className="grid grid-cols-3 h-auto p-1 bg-muted/50">
                      <TabsTrigger value="stats" className="text-sm px-4 py-2">Statistiques</TabsTrigger>
                      <TabsTrigger value="analytics" className="text-sm px-4 py-2">Analytics</TabsTrigger>
                      <TabsTrigger value="subscriptions" className="text-sm px-4 py-2">Abonnements</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* Groupe Sécurité & Monitoring */}
                <div className="bg-card rounded-lg border p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Sécurité & Monitoring</div>
                  <div className="flex gap-1">
                    <TabsList className="grid grid-cols-4 h-auto p-1 bg-muted/50">
                      <TabsTrigger value="security" className="text-sm px-4 py-2">Sécurité</TabsTrigger>
                      <TabsTrigger value="monitoring" className="text-sm px-4 py-2">Monitoring</TabsTrigger>
                      <TabsTrigger value="logs" className="text-sm px-4 py-2">Logs</TabsTrigger>
                      <TabsTrigger value="usb" className="text-sm px-4 py-2">USB</TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                {/* Groupe Administration */}
                <div className="bg-card rounded-lg border p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Administration</div>
                  <div className="flex gap-1">
                    <TabsList className="grid grid-cols-4 h-auto p-1 bg-muted/50">
                      <TabsTrigger value="proactive" className="text-sm px-4 py-2">Gestion Pro.</TabsTrigger>
                      <TabsTrigger value="optimization" className="text-sm px-4 py-2">Optimisation</TabsTrigger>
                      <TabsTrigger value="tests" className="text-sm px-4 py-2">Tests</TabsTrigger>
                      <TabsTrigger value="settings" className="text-sm px-4 py-2">Paramètres</TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
            </div>
            
            <TabsContent value="overview">
              <SimpleAdminOverview />
            </TabsContent>
            
            <TabsContent value="stats">
              <DetailedStatsPanel />
            </TabsContent>
            
            <TabsContent value="health">
              <SystemHealthPanel />
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
            
            <TabsContent value="subscriptions">
              <SubscriptionManagement />
            </TabsContent>
            
            <TabsContent value="analytics">
              <BusinessAnalytics />
            </TabsContent>
            
            <TabsContent value="proactive">
              <ProactiveUserManagement />
            </TabsContent>
            
            <TabsContent value="security">
              <SecurityCompliance />
            </TabsContent>
            
            <TabsContent value="optimization">
              <SystemOptimization />
            </TabsContent>
            
            <TabsContent value="monitoring">
              <UserDeletionMonitoring />
            </TabsContent>
            
            <TabsContent value="deleted">
              <DeletedRecordsManager />
            </TabsContent>
            
            <TabsContent value="usb">
              <USBMonitoringDashboard />
            </TabsContent>
            
            <TabsContent value="logs">
              <AdminLogsPanel />
            </TabsContent>
            
            <TabsContent value="tests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Centre de Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Accédez au tableau de bord de tests complet pour diagnostiquer et valider le système.
                    </p>
                    <Button 
                      onClick={() => navigate('/admin/testing')}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      Ouvrir le Tableau de Bord Tests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <AdminSettingsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
