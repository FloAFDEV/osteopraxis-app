import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOptimization } from '@/contexts/OptimizationContext';
import { Activity, Clock, Database, Zap } from 'lucide-react';

/**
 * Composant pour monitorer les performances de l'application
 * Visible uniquement en mode développement
 */
export const PerformanceMonitor = ({ 
  showInProduction = false 
}: { 
  showInProduction?: boolean 
}) => {
  const { stats, loading } = useOptimization();
  const [renderCount, setRenderCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Ne pas afficher en production sauf si explicitement demandé
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && !showInProduction) return null;

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  // Toggle visibility avec Ctrl+Shift+P
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-muted"
          onClick={() => setIsVisible(true)}
        >
          <Activity className="w-3 h-3 mr-1" />
          Perf
        </Badge>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Performance Monitor
          </span>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Cache Stats */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Cache Hit Rate
          </span>
          <Badge variant={stats.cacheHitRate > 0.8 ? "default" : "warning"}>
            {(stats.cacheHitRate * 100).toFixed(0)}%
          </Badge>
        </div>

        {/* Loading States */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span>Patients</span>
            <Badge variant={loading.patients ? "warning" : "default"}>
              {stats.dataFreshness.patients}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Appointments</span>
            <Badge variant={loading.appointments ? "warning" : "default"}>
              {stats.dataFreshness.appointments}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Cabinets</span>
            <Badge variant={loading.cabinets ? "warning" : "default"}>
              {stats.dataFreshness.cabinets}
            </Badge>
          </div>
        </div>

        {/* Render Count */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Renders
          </span>
          <Badge variant="outline">
            {renderCount}
          </Badge>
        </div>

        {/* Tips */}
        <div className="text-muted-foreground text-xs pt-2 border-t">
          <p>💡 Ctrl+Shift+P pour toggle</p>
          <p>🚀 Cache optimisé pour les performances</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;