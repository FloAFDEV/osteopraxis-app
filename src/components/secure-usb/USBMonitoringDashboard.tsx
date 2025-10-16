import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  HardDrive
} from "lucide-react";
import { usbMonitoringService, type USBUsageStats, type USBOperationMetrics } from "@/services/secure-usb-sharing/usb-monitoring-service";

interface USBMonitoringDashboardProps {
  className?: string;
}

export const USBMonitoringDashboard = ({ className }: USBMonitoringDashboardProps) => {
  const [stats, setStats] = useState<USBUsageStats | null>(null);
  const [recentOperations, setRecentOperations] = useState<USBOperationMetrics[]>([]);
  const [performanceIssues, setPerformanceIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const usageStats = usbMonitoringService.getUsageStats();
      setStats(usageStats);
      
      // Charger les opérations récentes
      const recent = usbMonitoringService.getRecentMetrics(5);
      setRecentOperations(recent);
      
      // Détecter les problèmes de performance
      const issues = usbMonitoringService.detectPerformanceIssues();
      setPerformanceIssues(issues);
      
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = () => {
    usbMonitoringService.cleanup();
    loadMonitoringData();
  };

  const getOperationIcon = (type: string) => {
    return type === 'export' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getSuccessRate = () => {
    if (!stats || stats.totalOperations === 0) return 0;
    return Math.round((stats.successfulOperations / stats.totalOperations) * 100);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${Math.round(ms / 1000)}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Chargement des données de monitoring...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitoring USB Sécurisé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Aucune opération USB détectée. Les statistiques apparaîtront après votre premier export ou import.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="operations">Opérations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div className="text-2xl font-bold">{stats.totalOperations}</div>
                </div>
                <p className="text-sm text-muted-foreground">Opérations totales</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="text-2xl font-bold">{getSuccessRate()}%</div>
                </div>
                <p className="text-sm text-muted-foreground">Taux de succès</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-orange-500" />
                  <div className="text-2xl font-bold">{formatFileSize(stats.averageFileSize)}</div>
                </div>
                <p className="text-sm text-muted-foreground">Taille moyenne</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
                </div>
                <p className="text-sm text-muted-foreground">Durée moyenne</p>
              </CardContent>
            </Card>
          </div>

          {/* Données exportées/importées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Données Exportées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Patients</span>
                  </div>
                  <Badge variant="secondary">{stats.totalDataExported.patients}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Rendez-vous</span>
                  </div>
                  <Badge variant="secondary">{stats.totalDataExported.appointments}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Factures</span>
                  </div>
                  <Badge variant="secondary">{stats.totalDataExported.invoices}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  Données Importées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Patients</span>
                  </div>
                  <Badge variant="secondary">{stats.totalDataImported.patients}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Rendez-vous</span>
                  </div>
                  <Badge variant="secondary">{stats.totalDataImported.appointments}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Factures</span>
                  </div>
                  <Badge variant="secondary">{stats.totalDataImported.invoices}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertes de performance */}
          {performanceIssues.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Problèmes de performance détectés :</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {performanceIssues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Opérations Récentes</CardTitle>
              <Button variant="outline" size="sm" onClick={loadMonitoringData}>
                Actualiser
              </Button>
            </CardHeader>
            <CardContent>
              {recentOperations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune opération récente
                </p>
              ) : (
                <div className="space-y-4">
                  {recentOperations.map((operation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getOperationIcon(operation.operationType)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{operation.operationType}</span>
                            <Badge variant={operation.success ? "default" : "destructive"}>
                              {operation.success ? "Succès" : "Échec"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {operation.timestamp.toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{formatDuration(operation.duration)}</div>
                        {operation.fileSize && (
                          <div className="text-muted-foreground">{formatFileSize(operation.fileSize)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Métriques de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const perfMetrics = usbMonitoringService.getPerformanceMetrics();
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Chiffrement moyen</span>
                          <span>{formatDuration(perfMetrics.averageEncryptionTime)}</span>
                        </div>
                        <Progress value={Math.min((perfMetrics.averageEncryptionTime / 5000) * 100, 100)} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Déchiffrement moyen</span>
                          <span>{formatDuration(perfMetrics.averageDecryptionTime)}</span>
                        </div>
                        <Progress value={Math.min((perfMetrics.averageDecryptionTime / 3000) * 100, 100)} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Ratio de compression</span>
                          <span>{perfMetrics.averageCompressionRatio.toFixed(2)}x</span>
                        </div>
                        <Progress value={Math.min(perfMetrics.averageCompressionRatio * 20, 100)} />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Opérations/jour</span>
                          <span>{perfMetrics.operationsPerDay.toFixed(1)}</span>
                        </div>
                        <Progress value={Math.min(perfMetrics.operationsPerDay * 10, 100)} />
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Maintenance</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCleanup}>
                  Nettoyer les logs
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      Les métriques anciennes (&gt;30 jours) sont automatiquement supprimées pour optimiser les performances.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Métriques stockées:</span>
                      <span>{recentOperations.length}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dernière opération:</span>
                      <span>
                        {stats.lastOperation 
                          ? stats.lastOperation.timestamp.toLocaleDateString('fr-FR')
                          : 'Aucune'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};