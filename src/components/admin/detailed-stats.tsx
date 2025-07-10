import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserPlus, 
  Calendar, 
  DollarSign,
  Building,
  Stethoscope,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DetailedStats {
  period_label: string;
  period_start: string;
  period_end: string;
  new_users: number;
  new_osteopaths: number;
  new_patients: number;
  new_cabinets: number;
  total_appointments: number;
  completed_appointments: number;
  canceled_appointments: number;
  total_invoices: number;
  paid_invoices: number;
  total_revenue: number;
  active_users: number;
  error_count: number;
}

export function DetailedStatsPanel() {
  const [stats, setStats] = useState<DetailedStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodType, setPeriodType] = useState('month');
  const [periodsCount, setPeriodsCount] = useState(12);

  useEffect(() => {
    loadDetailedStats();
  }, [periodType, periodsCount]);

  const loadDetailedStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_get_detailed_stats', {
        period_type: periodType,
        periods_count: periodsCount
      });

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques détaillées:", error);
      toast.error("Erreur lors du chargement des statistiques détaillées");
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getLatestStats = () => {
    if (stats.length === 0) return null;
    return stats[0];
  };

  const getPreviousStats = () => {
    if (stats.length < 2) return null;
    return stats[1];
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-500";
    if (trend < 0) return "text-red-500";
    return "text-gray-500";
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

  const latest = getLatestStats();
  const previous = getPreviousStats();

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiques Détaillées
            </div>
            <div className="flex items-center gap-2">
              <Select value={periodType} onValueChange={setPeriodType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Jours</SelectItem>
                  <SelectItem value="week">Semaines</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="year">Années</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={periodsCount.toString()} onValueChange={(v) => setPeriodsCount(parseInt(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={loadDetailedStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Métriques principales avec tendances */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nouveaux Utilisateurs</p>
                  <p className="text-2xl font-bold">{latest.new_users}</p>
                  {previous && (
                    <div className={`flex items-center text-sm ${getTrendColor(calculateTrend(latest.new_users, previous.new_users))}`}>
                      {getTrendIcon(calculateTrend(latest.new_users, previous.new_users))}
                      <span className="ml-1">
                        {calculateTrend(latest.new_users, previous.new_users)}%
                      </span>
                    </div>
                  )}
                </div>
                <UserPlus className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nouveaux Patients</p>
                  <p className="text-2xl font-bold">{latest.new_patients}</p>
                  {previous && (
                    <div className={`flex items-center text-sm ${getTrendColor(calculateTrend(latest.new_patients, previous.new_patients))}`}>
                      {getTrendIcon(calculateTrend(latest.new_patients, previous.new_patients))}
                      <span className="ml-1">
                        {calculateTrend(latest.new_patients, previous.new_patients)}%
                      </span>
                    </div>
                  )}
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rendez-vous</p>
                  <p className="text-2xl font-bold">{latest.total_appointments}</p>
                  {previous && (
                    <div className={`flex items-center text-sm ${getTrendColor(calculateTrend(latest.total_appointments, previous.total_appointments))}`}>
                      {getTrendIcon(calculateTrend(latest.total_appointments, previous.total_appointments))}
                      <span className="ml-1">
                        {calculateTrend(latest.total_appointments, previous.total_appointments)}%
                      </span>
                    </div>
                  )}
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold">{formatCurrency(latest.total_revenue)}</p>
                  {previous && (
                    <div className={`flex items-center text-sm ${getTrendColor(calculateTrend(latest.total_revenue, previous.total_revenue))}`}>
                      {getTrendIcon(calculateTrend(latest.total_revenue, previous.total_revenue))}
                      <span className="ml-1">
                        {calculateTrend(latest.total_revenue, previous.total_revenue)}%
                      </span>
                    </div>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_label" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="new_users" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Nouveaux utilisateurs"
                />
                <Line 
                  type="monotone" 
                  dataKey="active_users" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Utilisateurs actifs"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenus */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_label" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="total_revenue" fill="#10b981" name="Chiffre d'affaires" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rendez-vous */}
        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed_appointments" fill="#8b5cf6" name="Terminés" />
                <Bar dataKey="canceled_appointments" fill="#ef4444" name="Annulés" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Croissance */}
        <Card>
          <CardHeader>
            <CardTitle>Croissance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="new_patients" stroke="#06b6d4" strokeWidth={2} name="Nouveaux patients" />
                <Line type="monotone" dataKey="new_osteopaths" stroke="#f59e0b" strokeWidth={2} name="Nouveaux ostéopathes" />
                <Line type="monotone" dataKey="new_cabinets" stroke="#8b5cf6" strokeWidth={2} name="Nouveaux cabinets" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}