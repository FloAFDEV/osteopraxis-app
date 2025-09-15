import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Database, 
  Shield, 
  HardDrive, 
  Cloud, 
  Download, 
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react';
import { hybridStorageManager, type StorageStatus, type MigrationProgress } from '@/services/hybrid-storage-manager';
import { toast } from 'sonner';

interface StorageManagerProps {
  onStorageUnlocked?: () => void;
}

export const StorageManager: React.FC<StorageManagerProps> = ({
  onStorageUnlocked
}) => {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  useEffect(() => {
    loadStorageStatus();
  }, []);

  const loadStorageStatus = async () => {
    try {
      setIsLoading(true);
      const storageStatus = await hybridStorageManager.getStorageStatus();
      setStatus(storageStatus);

      // Charger les informations de diagnostic
      const diagnostic = await hybridStorageManager.getDiagnosticInfo();
      setDiagnosticInfo(diagnostic);
    } catch (error) {
      console.error('Failed to load storage status:', error);
      toast.error('Erreur lors du chargement du statut de stockage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateData = async () => {
    try {
      setIsMigrating(true);
      setMigrationProgress([]);
      
      const results = await hybridStorageManager.migrateExistingData();
      setMigrationProgress(results);
      
      const totalMigrated = results.reduce((sum, r) => sum + r.migrated, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
      
      if (totalErrors === 0) {
        toast.success(`Migration terminée : ${totalMigrated} enregistrements migrés`);
      } else {
        toast.warning(`Migration terminée avec ${totalErrors} erreurs`);
      }
      
      // Recharger le statut
      await loadStorageStatus();
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Erreur lors de la migration des données');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const backupPath = await hybridStorageManager.createBackup();
      toast.success(`Sauvegarde créée : ${backupPath}`);
    } catch (error) {
      console.error('Backup creation failed:', error);
      toast.error('Erreur lors de la création de la sauvegarde');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleLockStorage = () => {
    hybridStorageManager.lockStorage();
    setStatus(prev => prev ? { ...prev, isUnlocked: false } : null);
    toast.info('Stockage verrouillé');
  };

  const renderStorageStatus = () => {
    if (!status) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${status.isConfigured ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className={`h-5 w-5 ${status.isConfigured ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="font-medium">Configuration</p>
                <Badge variant={status.isConfigured ? 'secondary' : 'destructive'}>
                  {status.isConfigured ? 'Configuré' : 'Non configuré'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${status.isUnlocked ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {status.isUnlocked ? (
                <Unlock className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">Accès</p>
                <Badge variant={status.isUnlocked ? 'secondary' : 'outline'}>
                  {status.isUnlocked ? 'Déverrouillé' : 'Verrouillé'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${status.localAvailable ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <HardDrive className={`h-5 w-5 ${status.localAvailable ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="font-medium">Stockage local</p>
                <Badge variant={status.localAvailable ? 'secondary' : 'destructive'}>
                  {status.localAvailable ? 'Disponible' : 'Indisponible'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${status.cloudAvailable ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Cloud className={`h-5 w-5 ${status.cloudAvailable ? 'text-green-600' : 'text-yellow-600'}`} />
              <div>
                <p className="font-medium">Cloud</p>
                <Badge variant={status.cloudAvailable ? 'secondary' : 'outline'}>
                  {status.cloudAvailable ? 'Connecté' : 'Déconnecté'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDataClassification = () => {
    if (!status) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-blue-600" />
              <span>Données locales (HDS)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.dataClassification.local.map((entity) => (
                <Badge key={entity} variant="secondary" className="mr-2 mb-2">
                  {entity}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Ces données sensibles sont obligatoirement stockées localement pour respecter les exigences HDS.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5 text-green-600" />
              <span>Données cloud</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.dataClassification.cloud.map((entity) => (
                <Badge key={entity} variant="outline" className="mr-2 mb-2">
                  {entity}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Ces données non-sensibles sont stockées dans le cloud pour faciliter l'accès et la synchronisation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMigrationProgress = () => {
    if (migrationProgress.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression de la migration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {migrationProgress.map((progress) => (
            <div key={progress.entity} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{progress.entity}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {progress.migrated}/{progress.total}
                  </span>
                  {progress.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
              <Progress 
                value={progress.total > 0 ? (progress.migrated / progress.total) * 100 : 0} 
                className="h-2"
              />
              {progress.errors.length > 0 && (
                <div className="text-sm text-red-600">
                  {progress.errors.length} erreur(s)
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderDiagnosticInfo = () => {
    if (!diagnosticInfo) return null;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic de performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Stockage local</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={diagnosticInfo.performanceTest?.local?.available ? 'secondary' : 'destructive'}>
                    {diagnosticInfo.performanceTest?.local?.available ? 'Disponible' : 'Indisponible'}
                  </Badge>
                  {diagnosticInfo.performanceTest?.local?.latency && (
                    <span className="text-sm text-muted-foreground">
                      {Math.round(diagnosticInfo.performanceTest.local.latency)}ms
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label className="font-medium">Cloud</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={diagnosticInfo.performanceTest?.cloud?.available ? 'secondary' : 'destructive'}>
                    {diagnosticInfo.performanceTest?.cloud?.available ? 'Disponible' : 'Indisponible'}
                  </Badge>
                  {diagnosticInfo.performanceTest?.cloud?.latency && (
                    <span className="text-sm text-muted-foreground">
                      {Math.round(diagnosticInfo.performanceTest.cloud.latency)}ms
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {diagnosticInfo.config && (
          <Card>
            <CardHeader>
              <CardTitle>Configuration actuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Localisation</Label>
                  <p className="font-medium">{diagnosticInfo.config.storageLocation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sécurité</Label>
                  <p className="font-medium">
                    {diagnosticInfo.config.securityMethod === 'pin' ? 'Code PIN' : 'Mot de passe'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Chiffrement</Label>
                  <p className="font-medium">
                    {diagnosticInfo.config.encryptionEnabled ? 'AES-256' : 'Désactivé'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          <span className="ml-2">Chargement du gestionnaire de stockage...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerte de conformité HDS */}
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Stockage hybride obligatoire :</strong> Les données sensibles HDS sont automatiquement 
          stockées localement sur votre ordinateur avec chiffrement AES-256, tandis que les données 
          non-sensibles restent dans le cloud pour faciliter l'accès.
        </AlertDescription>
      </Alert>

      {/* Statut du stockage */}
      <Card>
        <CardHeader>
          <CardTitle>Statut du stockage</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStorageStatus()}
        </CardContent>
      </Card>

      {/* Onglets de gestion */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
          <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderDataClassification()}
          
          {status?.isUnlocked && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleLockStorage}>
                <Lock className="h-4 w-4 mr-2" />
                Verrouiller le stockage
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration des données</CardTitle>
              <p className="text-muted-foreground">
                Migrez vos données existantes vers le stockage hybride sécurisé.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleMigrateData}
                disabled={isMigrating || !status?.isUnlocked}
              >
                {isMigrating ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Migration en cours...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Démarrer la migration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {renderMigrationProgress()}
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des sauvegardes</CardTitle>
              <p className="text-muted-foreground">
                Créez et gérez vos sauvegardes de données locales.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button 
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup || !status?.isUnlocked}
                >
                  {isCreatingBackup ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Créer une sauvegarde
                    </>
                  )}
                </Button>
                
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Restaurer
                </Button>
              </div>

              {status?.lastBackup && (
                <div className="text-sm text-muted-foreground">
                  Dernière sauvegarde : {status.lastBackup.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-4">
          {renderDiagnosticInfo()}
        </TabsContent>
      </Tabs>
    </div>
  );
};