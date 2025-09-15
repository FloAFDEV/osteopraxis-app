import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Database, 
  HardDrive, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Server,
  Zap,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemHealthMetric {
  metric_name: string;
  metric_value: string;
  metric_type: string;
  status: string;
  last_updated: string;
}

export function SystemHealthPanel() {
  const [metrics, setMetrics] = useState<SystemHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthMetrics();
  }, []);

  const loadHealthMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_get_system_health');

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des métriques:", error);
      toast.error("Erreur lors du chargement de la santé du système");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      healthy: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
      warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
      critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
    };
    
    const labels = {
      healthy: "Sain",
      warning: "Attention",
      critical: "Critique"
    };
    
    return (
      <Badge className={`${colors[status as keyof typeof colors] || colors.healthy} border`}>
        {labels[status as keyof typeof labels] || "Inconnu"}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'storage':
        return <HardDrive className="h-5 w-5 text-foreground" />;
      case 'database':
        return <Database className="h-5 w-5 text-foreground" />;
      case 'users':
        return <Users className="h-5 w-5 text-foreground" />;
      case 'performance':
        return <Zap className="h-5 w-5 text-foreground" />;
      case 'backup':
        return <Shield className="h-5 w-5 text-foreground" />;
      case 'errors':
        return <AlertTriangle className="h-5 w-5 text-foreground" />;
      default:
        return <Server className="h-5 w-5 text-foreground" />;
    }
  };

  const getHealthScore = () => {
    if (metrics.length === 0) return 0;
    const healthyCount = metrics.filter(m => m.status === 'healthy').length;
    return Math.round((healthyCount / metrics.length) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const healthScore = getHealthScore();

  return (
    <div className="space-y-6">
      {/* Métriques détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Métriques Détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getTypeIcon(metric.metric_type)}
                  <div>
                    <h4 className="font-medium text-foreground">{metric.metric_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Dernière mise à jour: {new Date(metric.last_updated).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-foreground">
                    {metric.metric_value}
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    {getStatusBadge(metric.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {metrics.length === 0 && (
            <div className="text-center py-8">
              <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune métrique disponible</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start hover:bg-accent/50 transition-colors">
              <Database className="h-5 w-5 mr-3 text-foreground" />
              <div className="text-left">
                <div className="font-medium text-foreground">Nettoyer les logs anciens</div>
                <div className="text-sm text-muted-foreground">
                  Supprimer les logs de plus de 30 jours
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start hover:bg-accent/50 transition-colors">
              <Shield className="h-5 w-5 mr-3 text-foreground" />
              <div className="text-left">
                <div className="font-medium text-foreground">Vérifier la sécurité</div>
                <div className="text-sm text-muted-foreground">
                  Audit de sécurité et permissions
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start hover:bg-accent/50 transition-colors">
              <Zap className="h-5 w-5 mr-3 text-foreground" />
              <div className="text-left">
                <div className="font-medium text-foreground">Optimiser performances</div>
                <div className="text-sm text-muted-foreground">
                  Analyser et optimiser les requêtes
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start hover:bg-accent/50 transition-colors">
              <HardDrive className="h-5 w-5 mr-3 text-foreground" />
              <div className="text-left">
                <div className="font-medium text-foreground">Rapport d'utilisation</div>
                <div className="text-sm text-muted-foreground">
                  Générer un rapport détaillé
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Score de santé global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Santé du Système
            </div>
            <Button variant="outline" size="sm" onClick={loadHealthMetrics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${healthScore}, 100`}
                  className="text-green-600 dark:text-green-400"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/20"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthScore}%</div>
                  <div className="text-xs text-muted-foreground">Santé</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">
              {healthScore >= 90 ? "Système en excellente santé" :
               healthScore >= 70 ? "Système en bonne santé" :
               healthScore >= 50 ? "Système nécessite une attention" :
               "Système critique"}
            </h3>
            <p className="text-muted-foreground">
              {metrics.filter(m => m.status === 'healthy').length} sur {metrics.length} métriques sont saines
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}