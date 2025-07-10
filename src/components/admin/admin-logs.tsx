import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  AlertTriangle, 
  Info, 
  Shield, 
  User, 
  Calendar,
  RefreshCw,
  Download,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SystemLog {
  log_id: string;
  log_timestamp: string;
  level: string;
  action: string;
  table_name: string;
  user_id?: string;
  user_email?: string;
  record_id: string;
  old_values?: any;
  new_values?: any;
  ip_address?: unknown;
  user_agent?: string;
  success: boolean;
}

export function AdminLogsPanel() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: 'all',
    limit: 100,
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_get_system_logs', {
        limit_count: filters.limit,
        log_level: filters.level === 'all' ? null : filters.level,
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null
      });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des logs:", error);
      toast.error("Erreur lors du chargement des logs système");
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: string, success: boolean) => {
    const colors = {
      ERROR: "bg-red-500/10 text-red-500 border-red-500/20",
      WARNING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      ADMIN: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      INFO: success ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"
    };
    
    return (
      <Badge className={`${colors[level as keyof typeof colors] || colors.INFO} border`}>
        {level}
      </Badge>
    );
  };

  const exportLogs = () => {
    const csvContent = [
      ['Horodatage', 'Niveau', 'Action', 'Table', 'Utilisateur', 'Succès', 'IP', 'Détails'].join(','),
      ...logs.map(log => [
        new Date(log.log_timestamp).toLocaleString(),
        log.level,
        log.action,
        log.table_name,
        log.user_email || 'Système',
        log.success ? 'Oui' : 'Non',
        log.ip_address || '',
        `Record: ${log.record_id}`
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_admin_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Logs Système Détaillés
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={loadLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="ERROR">Erreurs</SelectItem>
              <SelectItem value="WARNING">Avertissements</SelectItem>
              <SelectItem value="ADMIN">Actions Admin</SelectItem>
              <SelectItem value="INFO">Informations</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="datetime-local"
            placeholder="Date début"
            value={filters.dateFrom}
            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          />

          <Input
            type="datetime-local"
            placeholder="Date fin"
            value={filters.dateTo}
            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
          />

          <Select value={filters.limit.toString()} onValueChange={(value) => setFilters({...filters, limit: parseInt(value)})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 entrées</SelectItem>
              <SelectItem value="100">100 entrées</SelectItem>
              <SelectItem value="200">200 entrées</SelectItem>
              <SelectItem value="500">500 entrées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques rapides */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="text-sm text-red-600 dark:text-red-400">Erreurs</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {logs.filter(l => l.level === 'ERROR').length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Avertissements</div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {logs.filter(l => l.level === 'WARNING').length}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-sm text-purple-600 dark:text-purple-400">Actions Admin</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {logs.filter(l => l.level === 'ADMIN').length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-sm text-green-600 dark:text-green-400">Succès</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {logs.filter(l => l.success).length}
            </div>
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.log_id} className="border rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getLevelIcon(log.level)}
                    {getLevelBadge(log.level, log.success)}
                    <span className="font-medium">{log.action}</span>
                    <span className="text-sm text-muted-foreground">
                      sur {log.table_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(log.log_timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>{log.user_email || 'Système'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Record: </span>
                    <code className="bg-muted px-1 rounded text-xs">
                      {log.record_id.slice(0, 8)}...
                    </code>
                  </div>
                      {log.ip_address && (
                    <div>
                      <span className="text-muted-foreground">IP: </span>
                      <code className="bg-muted px-1 rounded text-xs">
                        {String(log.ip_address)}
                      </code>
                    </div>
                  )}
                </div>

                {(log.old_values || log.new_values) && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Voir les détails des modifications
                    </summary>
                    <div className="mt-2 space-y-2 text-xs">
                      {log.old_values && (
                        <div>
                          <span className="text-muted-foreground">Anciennes valeurs: </span>
                          <pre className="bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_values && (
                        <div>
                          <span className="text-muted-foreground">Nouvelles valeurs: </span>
                          <pre className="bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ))}
            
            {logs.length === 0 && (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun log trouvé pour les critères sélectionnés</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}