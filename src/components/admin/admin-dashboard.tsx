
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
import { 
  Users, Building, Calendar, RefreshCw, User, ShieldCheck, TestTube 
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
        
        {/* Actions rapides */}
        <QuickActionsPanel />
        
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-8 p-4 bg-card rounded-lg border">
              <TabsList className="grid w-full h-auto p-2 bg-muted/50" style={{
                gridTemplateColumns: 'repeat(16, minmax(80px, 1fr))',
                gap: '4px'
              }}>
                <TabsTrigger value="overview" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="stats" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Statistiques</TabsTrigger>
                <TabsTrigger value="health" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Santé</TabsTrigger>
                <TabsTrigger value="users" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Utilisateurs</TabsTrigger>
                <TabsTrigger value="cabinets" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Cabinets</TabsTrigger>
                <TabsTrigger value="patients" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Patients</TabsTrigger>
                <TabsTrigger value="subscriptions" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Abonnements</TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Analytics</TabsTrigger>
                <TabsTrigger value="proactive" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Gestion Pro.</TabsTrigger>
                <TabsTrigger value="security" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Sécurité</TabsTrigger>
                <TabsTrigger value="optimization" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Optimisation</TabsTrigger>
                <TabsTrigger value="monitoring" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Monitoring</TabsTrigger>
                <TabsTrigger value="deleted" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Supprimés</TabsTrigger>
                <TabsTrigger value="usb" className="text-xs px-3 py-3 h-auto whitespace-nowrap">USB</TabsTrigger>
                <TabsTrigger value="logs" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Logs</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs px-3 py-3 h-auto whitespace-nowrap">Paramètres</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview">
              <SystemHealthPanel />
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
            
            <TabsContent value="settings">
              <AdminSettingsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
