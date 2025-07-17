import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Database, 
  Shield, 
  Clock, 
  Bell, 
  Mail, 
  Users, 
  HardDrive,
  Zap,
  AlertTriangle,
  Save,
  RotateCcw,
  Globe,
  Server
} from "lucide-react";
import { toast } from "sonner";

interface AdminSettings {
  // Paramètres généraux
  site_name: string;
  site_description: string;
  maintenance_mode: boolean;
  max_users: number;
  max_patients_per_user: number;
  
  // Paramètres de sécurité
  session_timeout: number;
  max_login_attempts: number;
  password_min_length: number;
  require_2fa: boolean;
  
  // Paramètres de notification
  email_notifications: boolean;
  sms_notifications: boolean;
  admin_email: string;
  
  // Paramètres de performance
  cache_enabled: boolean;
  cache_duration: number;
  compression_enabled: boolean;
  log_retention_days: number;
  
  // Paramètres de sauvegarde
  backup_enabled: boolean;
  backup_frequency: string;
  backup_retention_days: number;
}

export function AdminSettingsPanel() {
  const [settings, setSettings] = useState<AdminSettings>({
    site_name: "Cabinet Manager",
    site_description: "Plateforme de gestion pour cabinets d'ostéopathie",
    maintenance_mode: false,
    max_users: 1000,
    max_patients_per_user: 500,
    session_timeout: 3600,
    max_login_attempts: 5,
    password_min_length: 8,
    require_2fa: false,
    email_notifications: true,
    sms_notifications: false,
    admin_email: "admin@cabinet-manager.com",
    cache_enabled: true,
    cache_duration: 300,
    compression_enabled: true,
    log_retention_days: 30,
    backup_enabled: true,
    backup_frequency: "daily",
    backup_retention_days: 7
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  const handleSettingChange = (key: keyof AdminSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Paramètres sauvegardés avec succès");
      setHasChanges(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      site_name: "Cabinet Manager",
      site_description: "Plateforme de gestion pour cabinets d'ostéopathie",
      maintenance_mode: false,
      max_users: 1000,
      max_patients_per_user: 500,
      session_timeout: 3600,
      max_login_attempts: 5,
      password_min_length: 8,
      require_2fa: false,
      email_notifications: true,
      sms_notifications: false,
      admin_email: "admin@cabinet-manager.com",
      cache_enabled: true,
      cache_duration: 300,
      compression_enabled: true,
      log_retention_days: 30,
      backup_enabled: true,
      backup_frequency: "daily",
      backup_retention_days: 7
    });
    setHasChanges(false);
    toast.info("Paramètres réinitialisés");
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'general':
        return <Globe className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'notifications':
        return <Bell className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'backup':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const sections = [
    { id: 'general', label: 'Général', icon: 'general' },
    { id: 'security', label: 'Sécurité', icon: 'security' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'performance', label: 'Performance', icon: 'performance' },
    { id: 'backup', label: 'Sauvegarde', icon: 'backup' }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres d'Administration
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary">
                  Modifications non sauvegardées
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={loading || !hasChanges}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settings.maintenance_mode && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Le mode maintenance est activé. Seuls les administrateurs peuvent accéder au système.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2"
              >
                {getSectionIcon(section.icon)}
                {section.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section Général */}
      {activeSection === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Paramètres Généraux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site_name">Nom du site</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => handleSettingChange('site_name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="admin_email">Email administrateur</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={settings.admin_email}
                  onChange={(e) => handleSettingChange('admin_email', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="site_description">Description du site</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) => handleSettingChange('site_description', e.target.value)}
                rows={3}
              />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_users">Nombre maximum d'utilisateurs</Label>
                <Input
                  id="max_users"
                  type="number"
                  value={settings.max_users}
                  onChange={(e) => handleSettingChange('max_users', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="max_patients_per_user">Patients max par utilisateur</Label>
                <Input
                  id="max_patients_per_user"
                  type="number"
                  value={settings.max_patients_per_user}
                  onChange={(e) => handleSettingChange('max_patients_per_user', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Mode maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Désactive l'accès au système pour les utilisateurs non-administrateurs
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Sécurité */}
      {activeSection === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Paramètres de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="session_timeout">Délai d'expiration de session (secondes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="max_login_attempts">Tentatives de connexion max</Label>
                <Input
                  id="max_login_attempts"
                  type="number"
                  value={settings.max_login_attempts}
                  onChange={(e) => handleSettingChange('max_login_attempts', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="password_min_length">Longueur minimale du mot de passe</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={settings.password_min_length}
                  onChange={(e) => handleSettingChange('password_min_length', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require_2fa">Authentification à deux facteurs obligatoire</Label>
                <p className="text-sm text-muted-foreground">
                  Oblige tous les utilisateurs à configurer l'authentification à deux facteurs
                </p>
              </div>
              <Switch
                id="require_2fa"
                checked={settings.require_2fa}
                onCheckedChange={(checked) => handleSettingChange('require_2fa', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Notifications */}
      {activeSection === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Paramètres de Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_notifications">Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Activer les notifications par email pour les événements système
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms_notifications">Notifications par SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Activer les notifications par SMS pour les événements critiques
                </p>
              </div>
              <Switch
                id="sms_notifications"
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => handleSettingChange('sms_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Performance */}
      {activeSection === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Paramètres de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cache_enabled">Cache activé</Label>
                <p className="text-sm text-muted-foreground">
                  Améliore les performances en mettant en cache les données fréquemment utilisées
                </p>
              </div>
              <Switch
                id="cache_enabled"
                checked={settings.cache_enabled}
                onCheckedChange={(checked) => handleSettingChange('cache_enabled', checked)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cache_duration">Durée du cache (secondes)</Label>
                <Input
                  id="cache_duration"
                  type="number"
                  value={settings.cache_duration}
                  onChange={(e) => handleSettingChange('cache_duration', parseInt(e.target.value))}
                  disabled={!settings.cache_enabled}
                />
              </div>
              
              <div>
                <Label htmlFor="log_retention_days">Rétention des logs (jours)</Label>
                <Input
                  id="log_retention_days"
                  type="number"
                  value={settings.log_retention_days}
                  onChange={(e) => handleSettingChange('log_retention_days', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compression_enabled">Compression activée</Label>
                <p className="text-sm text-muted-foreground">
                  Compresse les réponses pour réduire la bande passante
                </p>
              </div>
              <Switch
                id="compression_enabled"
                checked={settings.compression_enabled}
                onCheckedChange={(checked) => handleSettingChange('compression_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Sauvegarde */}
      {activeSection === 'backup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Paramètres de Sauvegarde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backup_enabled">Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Active les sauvegardes automatiques de la base de données
                </p>
              </div>
              <Switch
                id="backup_enabled"
                checked={settings.backup_enabled}
                onCheckedChange={(checked) => handleSettingChange('backup_enabled', checked)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backup_frequency">Fréquence des sauvegardes</Label>
                <Select
                  value={settings.backup_frequency}
                  onValueChange={(value) => handleSettingChange('backup_frequency', value)}
                  disabled={!settings.backup_enabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="backup_retention_days">Rétention des sauvegardes (jours)</Label>
                <Input
                  id="backup_retention_days"
                  type="number"
                  value={settings.backup_retention_days}
                  onChange={(e) => handleSettingChange('backup_retention_days', parseInt(e.target.value))}
                  disabled={!settings.backup_enabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}