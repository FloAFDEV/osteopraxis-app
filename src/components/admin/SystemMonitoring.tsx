import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemMonitoring } from '@/hooks/useSystemMonitoring';
import { useToast } from '@/components/ui/use-toast';
import { Shield, TrendingUp, Settings, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LoadingStates } from '@/components/ui/loading-states';

export function SystemMonitoring() {
  const {
    securityHealth,
    systemMetrics,
    loading,
    error,
    optimizeSystem,
    refreshData,
    getMetricStats,
    hasCriticalIssues,
    hasWarnings
  } = useSystemMonitoring();

  const { toast } = useToast();

  const handleOptimize = async () => {
    const result = await optimizeSystem();
    
    if (result.success) {
      toast.success("Optimisation réussie", {
        description: `${result.optimizations} optimisations effectuées`,
      });
      await refreshData();
    } else {
      toast.error("Erreur d'optimisation", {
        description: result.error,
      });
    }
  };

  const getStatusIcon = (status: string, critical: boolean) => {
    if (critical) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (status === 'WARNING') return <AlertTriangle className="h-4 w-4 text-warning" />;
    if (status === 'INFO') return <Clock className="h-4 w-4 text-info" />;
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const getStatusBadgeVariant = (status: string, critical: boolean) => {
    if (critical) return "destructive";
    if (status === 'WARNING') return "secondary";
    if (status === 'INFO') return "outline";
    return "default";
  };

  if (loading) {
    return <LoadingStates.FullPageLoading message="Chargement du monitoring système..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monitoring Système</h2>
          <p className="text-muted-foreground">Surveillance de la sécurité et des performances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="default" size="sm" onClick={handleOptimize}>
            <Settings className="h-4 w-4 mr-2" />
            Optimiser
          </Button>
        </div>
      </div>

      {/* Statut global */}
      {(hasCriticalIssues || hasWarnings) && (
        <Alert variant={hasCriticalIssues ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {hasCriticalIssues 
              ? "Problèmes critiques détectés nécessitant une attention immédiate"
              : "Avertissements détectés, surveillance recommandée"
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Santé de la sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Santé de la Sécurité
          </CardTitle>
          <CardDescription>
            Vérifications de sécurité en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityHealth.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metric.status, metric.critical)}
                  <div>
                    <p className="font-medium">{metric.metric_name}</p>
                    <p className="text-sm text-muted-foreground">{metric.details}</p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(metric.status, metric.critical)}>
                  {metric.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métriques système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métriques Système
          </CardTitle>
          <CardDescription>
            Performance et utilisation du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Métriques uniques */}
            {Array.from(new Set(systemMetrics.map(m => m.metric_name))).map(metricName => {
              const stats = getMetricStats(metricName);
              if (!stats) return null;

              return (
                <div key={metricName} className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">{metricName}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actuel:</span>
                      <span className="font-medium">{stats.current.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moyenne:</span>
                      <span>{stats.average.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min/Max:</span>
                      <span>{stats.min.toFixed(2)} / {stats.max.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {systemMetrics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune métrique système disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique récent */}
      <Card>
        <CardHeader>
          <CardTitle>Historique Récent</CardTitle>
          <CardDescription>
            Dernières métriques enregistrées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {systemMetrics.slice(0, 20).map((metric) => (
              <div key={metric.id} className="flex items-center justify-between text-sm p-2 rounded border">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{metric.metric_name}</span>
                  <span className="text-muted-foreground">
                    {new Date(metric.recorded_at).toLocaleString()}
                  </span>
                </div>
                <span className="font-mono">
                  {metric.metric_value.toFixed(2)} {metric.metric_unit}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}