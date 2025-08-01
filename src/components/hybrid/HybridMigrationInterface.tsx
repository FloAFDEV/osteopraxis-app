import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Cloud, 
  HardDrive, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { hybridDataManager } from '@/services/hybrid-data-adapter';
import { toast } from 'sonner';

interface MigrationStatus {
  entity: string;
  entityDisplayName: string;
  totalRecords: number;
  migratedRecords: number;
  errors: string[];
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface StorageInfo {
  cloud: {
    available: boolean;
    entities: string[];
  };
  local: {
    available: boolean;
    entities: string[];
  };
  performance?: {
    cloud: { latency: number; available: boolean };
    local: { latency: number; available: boolean };
  };
}

export const HybridMigrationInterface: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationMode, setMigrationMode] = useState<'selective' | 'full'>('selective');

  // Entités migrables avec leurs noms d'affichage
  const migratableEntities = [
    { key: 'patients', name: 'Patients', description: 'Données personnelles et médicales des patients' },
    { key: 'appointments', name: 'Rendez-vous', description: 'Historique des consultations et plannings' },
    { key: 'invoices', name: 'Factures', description: 'Facturation et paiements' },
  ];

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    setIsInitializing(true);
    try {
      const diagnostic = await hybridDataManager.diagnose();
      const performance = await hybridDataManager.performanceTest();
      
      setStorageInfo({
        cloud: diagnostic.cloud,
        local: diagnostic.local,
        performance
      });
    } catch (error) {
      console.error('Error loading storage info:', error);
      toast.error('Erreur lors du chargement des informations de stockage');
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeMigrationStatus = () => {
    const status: MigrationStatus[] = migratableEntities.map(entity => ({
      entity: entity.key,
      entityDisplayName: entity.name,
      totalRecords: 0,
      migratedRecords: 0,
      errors: [],
      status: 'pending'
    }));
    setMigrationStatus(status);
  };

  const startMigration = async (selectedEntities?: string[]) => {
    if (!storageInfo?.local.available) {
      toast.error('Le stockage local n\'est pas disponible');
      return;
    }

    setIsMigrating(true);
    initializeMigrationStatus();

    const entitiesToMigrate = selectedEntities || migratableEntities.map(e => e.key);

    for (const entityKey of entitiesToMigrate) {
      const entity = migratableEntities.find(e => e.key === entityKey);
      if (!entity) continue;

      // Mettre à jour le statut à "running"
      setMigrationStatus(prev => 
        prev.map(status => 
          status.entity === entityKey 
            ? { ...status, status: 'running' as const }
            : status
        )
      );

      try {
        console.log(`🔄 Migration ${entity.name} en cours...`);
        
        // Simuler le processus de migration avec des données réelles
        const result = await hybridDataManager.syncCloudToLocal(entityKey);
        
        // Mettre à jour le statut avec les résultats
        setMigrationStatus(prev => 
          prev.map(status => 
            status.entity === entityKey 
              ? {
                  ...status,
                  totalRecords: result.migrated + result.errors.length,
                  migratedRecords: result.migrated,
                  errors: result.errors,
                  status: result.success ? 'completed' as const : 'error' as const
                }
              : status
          )
        );

        if (result.success) {
          toast.success(`✅ ${entity.name} migré avec succès (${result.migrated} enregistrements)`);
        } else {
          toast.error(`❌ Erreur lors de la migration de ${entity.name}`);
        }
      } catch (error) {
        console.error(`Error migrating ${entityKey}:`, error);
        setMigrationStatus(prev => 
          prev.map(status => 
            status.entity === entityKey 
              ? { ...status, status: 'error' as const, errors: [error instanceof Error ? error.message : 'Erreur inconnue'] }
              : status
          )
        );
        toast.error(`❌ Erreur lors de la migration de ${entity.name}`);
      }
    }

    setIsMigrating(false);
    toast.success('🎉 Migration terminée !');
  };

  const getStorageStatusColor = (available: boolean) => {
    return available ? 'text-green-600' : 'text-red-600';
  };

  const getStorageStatusText = (available: boolean) => {
    return available ? 'Disponible' : 'Indisponible';
  };

  const getMigrationProgress = () => {
    if (migrationStatus.length === 0) return 0;
    const completed = migrationStatus.filter(s => s.status === 'completed').length;
    return (completed / migrationStatus.length) * 100;
  };

  if (isInitializing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Initialisation du système hybride...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Progress value={undefined} className="w-64" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* État du système de stockage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            État du Système de Stockage
          </CardTitle>
          <CardDescription>
            Architecture hybride : Cloud (Supabase) + Local (SQLite)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stockage Cloud */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Stockage Cloud (Supabase)</h3>
                <Badge 
                  variant={storageInfo?.cloud.available ? "secondary" : "destructive"}
                  className={getStorageStatusColor(storageInfo?.cloud.available || false)}
                >
                  {getStorageStatusText(storageInfo?.cloud.available || false)}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Authentification et comptes utilisateurs</p>
                <p>• Profils des ostéopathes</p>
                <p>• Configuration des cabinets</p>
                {storageInfo?.performance && (
                  <p>• Latence: {storageInfo.performance.cloud.latency.toFixed(1)}ms</p>
                )}
              </div>
            </div>

            {/* Stockage Local */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Stockage Local (SQLite)</h3>
                <Badge 
                  variant={storageInfo?.local.available ? "secondary" : "destructive"}
                  className={getStorageStatusColor(storageInfo?.local.available || false)}
                >
                  {getStorageStatusText(storageInfo?.local.available || false)}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Données sensibles des patients</p>
                <p>• Historique des rendez-vous</p>
                <p>• Factures et paiements</p>
                {storageInfo?.performance && (
                  <p>• Latence: {storageInfo.performance.local.latency.toFixed(1)}ms</p>
                )}
              </div>
            </div>
          </div>

          {/* Avantages de l'architecture hybride */}
          <Separator className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Conformité RGPD</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Performance locale</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Cloud className="h-4 w-4 text-purple-500" />
              <span>Synchronisation cloud</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface de migration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Migration des Données Sensibles
          </CardTitle>
          <CardDescription>
            Migrez vos données du cloud vers le stockage local sécurisé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode de migration */}
          <div className="space-y-4">
            <h4 className="font-medium">Mode de migration</h4>
            <div className="flex gap-4">
              <Button
                variant={migrationMode === 'selective' ? 'default' : 'outline'}
                onClick={() => setMigrationMode('selective')}
                className="flex-1"
              >
                Migration Sélective
              </Button>
              <Button
                variant={migrationMode === 'full' ? 'default' : 'outline'}
                onClick={() => setMigrationMode('full')}
                className="flex-1"
              >
                Migration Complète
              </Button>
            </div>
          </div>

          {/* Entités à migrer */}
          <div className="space-y-4">
            <h4 className="font-medium">Données à migrer</h4>
            <div className="grid gap-3">
              {migratableEntities.map((entity) => (
                <div key={entity.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{entity.name}</div>
                    <div className="text-sm text-muted-foreground">{entity.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {migrationStatus.find(s => s.entity === entity.key)?.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {migrationStatus.find(s => s.entity === entity.key)?.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {migrationStatus.find(s => s.entity === entity.key)?.status === 'running' && (
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progression de la migration */}
          {migrationStatus.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Progression de la migration</h4>
              <Progress value={getMigrationProgress()} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {migrationStatus.filter(s => s.status === 'completed').length} / {migrationStatus.length} entités migrées
              </div>
            </div>
          )}

          {/* Erreurs de migration */}
          {migrationStatus.some(s => s.errors.length > 0) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Des erreurs se sont produites durant la migration. Vérifiez les détails ci-dessous.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => startMigration()}
              disabled={!storageInfo?.local.available || isMigrating}
              className="flex items-center gap-2"
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Migration en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Démarrer la migration
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={loadStorageInfo}
              disabled={isInitializing}
            >
              <RefreshCw className={`h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations importantes */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Protection des données :</strong> Cette migration stocke vos données sensibles localement sur votre appareil, 
          garantissant une conformité RGPD optimale. Les données d'authentification restent dans le cloud pour permettre 
          l'accès depuis différents appareils.
        </AlertDescription>
      </Alert>
    </div>
  );
};