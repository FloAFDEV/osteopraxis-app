
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SecurityMetric {
  metric_name: string;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  details: string;
  critical: boolean;
}

export function SecurityMonitor() {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('security_health_check');
      
      if (error) {
        console.error('Erreur lors de la récupération des métriques de sécurité:', error);
        toast.error('Erreur lors de la récupération des métriques de sécurité');
        return;
      }
      
      // Fix the TypeScript error by properly typing the data
      const typedMetrics = (data || []).map(item => ({
        metric_name: item.metric_name,
        status: item.status as 'OK' | 'WARNING' | 'CRITICAL',
        details: item.details,
        critical: item.critical
      }));
      
      setMetrics(typedMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Exception lors de la récupération des métriques:', error);
      toast.error('Erreur lors de la récupération des métriques de sécurité');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityMetrics();
    
    // Actualisation automatique toutes les 5 minutes
    const interval = setInterval(fetchSecurityMetrics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string, critical: boolean) => {
    if (critical) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, critical: boolean) => {
    if (critical) {
      return <Badge variant="destructive">CRITIQUE</Badge>;
    }
    
    switch (status) {
      case 'OK':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'WARNING':
        return <Badge variant="secondary" className="bg-yellow-500">ATTENTION</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive">CRITIQUE</Badge>;
      default:
        return <Badge variant="outline">INCONNU</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitoring Sécurité
          </CardTitle>
          <CardDescription>
            État des mesures de sécurité en temps réel
            {lastUpdate && (
              <span className="block text-sm text-muted-foreground mt-1">
                Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </CardDescription>
        </div>
        <Button 
          onClick={fetchSecurityMetrics} 
          disabled={loading}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Chargement des métriques...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucune métrique de sécurité disponible
              </p>
            ) : (
              metrics.map((metric, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.status, metric.critical)}
                    <div>
                      <h4 className="font-medium">{metric.metric_name}</h4>
                      <p className="text-sm text-muted-foreground">{metric.details}</p>
                    </div>
                  </div>
                  {getStatusBadge(metric.status, metric.critical)}
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
