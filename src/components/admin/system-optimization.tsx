import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Cpu, 
  Database, 
  Zap, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  HardDrive,
  RefreshCw
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface OptimizationTask {
  id: string;
  name: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  nextRun?: string;
}

export function SystemOptimization() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [tasks, setTasks] = useState<OptimizationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Simuler des métriques système
      const mockMetrics: SystemMetric[] = [
        {
          name: "Utilisation CPU",
          value: 23,
          unit: "%",
          status: 'good',
          description: "Charge processeur actuelle"
        },
        {
          name: "Mémoire",
          value: 67,
          unit: "%",
          status: 'warning',
          description: "Utilisation de la RAM"
        },
        {
          name: "Stockage DB",
          value: 45,
          unit: "%",
          status: 'good',
          description: "Espace utilisé en base de données"
        },
        {
          name: "Requêtes/min",
          value: 150,
          unit: "",
          status: 'good',
          description: "Nombre de requêtes par minute"
        },
        {
          name: "Temps réponse",
          value: 120,
          unit: "ms",
          status: 'good',
          description: "Temps de réponse moyen"
        },
        {
          name: "Connexions actives",
          value: 12,
          unit: "",
          status: 'good',
          description: "Connexions base de données"
        }
      ];

      const mockTasks: OptimizationTask[] = [
        {
          id: "1",
          name: "Nettoyage des logs anciens",
          description: "Supprime les logs de plus de 90 jours",
          category: "maintenance",
          impact: 'medium',
          effort: 'low',
          status: 'completed',
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          name: "Optimisation des index",
          description: "Reconstruit les index pour améliorer les performances",
          category: "performance",
          impact: 'high',
          effort: 'medium',
          status: 'pending',
          nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          name: "Compression des images",
          description: "Compresse les images uploadées pour économiser l'espace",
          category: "storage",
          impact: 'medium',
          effort: 'low',
          status: 'pending'
        },
        {
          id: "4",
          name: "Nettoyage du cache",
          description: "Vide les caches expirés",
          category: "performance",
          impact: 'low',
          effort: 'low',
          status: 'running'
        },
        {
          id: "5",
          name: "Sauvegarde système",
          description: "Crée une sauvegarde complète du système",
          category: "backup",
          impact: 'high',
          effort: 'high',
          status: 'completed',
          lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString()
        }
      ];

      setMetrics(mockMetrics);
      setTasks(mockTasks);

    } catch (error) {
      console.error("Erreur lors du chargement des données système:", error);
      toast.error("Erreur lors du chargement des données système");
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async (taskId: string) => {
    try {
      setOptimizing(true);
      
      // Simuler l'exécution d'une tâche d'optimisation
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'running' }
          : task
      ));

      // Simuler un délai d'exécution
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'completed',
              lastRun: new Date().toISOString(),
              nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          : task
      ));

      toast.success("Tâche d'optimisation terminée avec succès");
      
    } catch (error) {
      console.error("Erreur lors de l'optimisation:", error);
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'failed' }
          : task
      ));
      toast.error("Erreur lors de l'exécution de la tâche");
    } finally {
      setOptimizing(false);
    }
  };

  const runAllOptimizations = async () => {
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    
    for (const task of pendingTasks) {
      await runOptimization(task.id);
      // Petit délai entre les tâches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">En cours</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
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
        <h2 className="text-2xl font-bold">Optimisation Système</h2>
        <Button 
          onClick={runAllOptimizations} 
          disabled={optimizing}
          className="bg-primary text-primary-foreground"
        >
          {optimizing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Optimisation...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Optimiser Tout
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Métriques Système</TabsTrigger>
          <TabsTrigger value="tasks">Tâches d'Optimisation</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}{metric.unit}
                    </div>
                    {metric.status === 'good' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : metric.status === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  
                  {metric.name.includes('%') && (
                    <Progress 
                      value={metric.value} 
                      className="mb-2"
                    />
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium">{task.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTaskStatusBadge(task.status)}
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => runOptimization(task.id)}
                          disabled={optimizing}
                        >
                          Exécuter
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>Catégorie: {task.category}</span>
                      <span className={getImpactColor(task.impact)}>
                        Impact: {task.impact}
                      </span>
                      <span>Effort: {task.effort}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {task.lastRun && (
                        <span>
                          Dernière: {new Date(task.lastRun).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {task.nextRun && (
                        <span>
                          Prochaine: {new Date(task.nextRun).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Dernière sauvegarde</span>
                  <span className="text-green-600">Il y a 6h</span>
                </div>
                <div className="flex justify-between">
                  <span>Taille de la DB</span>
                  <span>2.4 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Fragmentation</span>
                  <span className="text-orange-600">12%</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Défragmenter
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  Stockage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Espace utilisé</span>
                  <span>45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Fichiers temporaires</span>
                  <span className="text-orange-600">1.2 GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache</span>
                  <span>230 MB</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nettoyer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Requêtes lentes</span>
                  <span className="text-red-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Index manquants</span>
                  <span className="text-orange-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span>Score performance</span>
                  <span className="text-green-600">85%</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyser
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Tâches Programmées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Prochaine sauvegarde</span>
                  <span>Dans 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Nettoyage logs</span>
                  <span>Dans 22h</span>
                </div>
                <div className="flex justify-between">
                  <span>Optimisation index</span>
                  <span className="text-orange-600">Dans 6h</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Programmer
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}