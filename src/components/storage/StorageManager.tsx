/**
 * Gestionnaire de stockage HDS sécurisé
 * Utilise hds-secure-manager pour la gestion du stockage local
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Shield, 
  HardDrive, 
  Cloud, 
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { hdsSecureManager, type HDSSecureStatus } from '@/services/hds-secure-storage/hds-secure-manager';
import { toast } from 'sonner';

interface StorageManagerProps {
  onStorageUnlocked?: () => void;
}

export const StorageManager: React.FC<StorageManagerProps> = ({
  onStorageUnlocked
}) => {
  const [status, setStatus] = useState<HDSSecureStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageStatus();
  }, []);

  const loadStorageStatus = async () => {
    try {
      setIsLoading(true);
      const storageStatus = await hdsSecureManager.getStatus();
      setStatus(storageStatus);
    } catch (error) {
      console.error('Failed to load storage status:', error);
      toast.error('Erreur lors du chargement du statut de stockage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockStorage = () => {
    hdsSecureManager.lock();
    setStatus(prev => prev ? { ...prev, isUnlocked: false } : null);
    toast.info('Stockage verrouillé');
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
          <strong>Stockage HDS sécurisé :</strong> Les données sensibles sont stockées localement 
          sur votre ordinateur avec chiffrement AES-256-GCM, conformément à la réglementation HDS française.
        </AlertDescription>
      </Alert>

      {/* Statut du stockage */}
      <Card>
        <CardHeader>
          <CardTitle>Statut du stockage HDS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`border-l-4 ${status?.isConfigured ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className={`h-5 w-5 ${status?.isConfigured ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className="font-medium">Configuration</p>
                    <Badge variant={status?.isConfigured ? 'secondary' : 'destructive'}>
                      {status?.isConfigured ? 'Configuré' : 'Non configuré'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${status?.isUnlocked ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  {status?.isUnlocked ? (
                    <Unlock className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium">Accès</p>
                    <Badge variant={status?.isUnlocked ? 'secondary' : 'outline'}>
                      {status?.isUnlocked ? 'Déverrouillé' : 'Verrouillé'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${status?.physicalStorageAvailable ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className={`h-5 w-5 ${status?.physicalStorageAvailable ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className="font-medium">Stockage physique</p>
                    <Badge variant={status?.physicalStorageAvailable ? 'secondary' : 'destructive'}>
                      {status?.physicalStorageAvailable ? 'Disponible' : 'Indisponible'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {status?.isUnlocked && (
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={loadStorageStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" onClick={handleLockStorage}>
                <Lock className="h-4 w-4 mr-2" />
                Verrouiller le stockage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques de stockage */}
      {status?.isConfigured && status?.entitiesCount && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de stockage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(status.entitiesCount).map(([entity, count]) => (
                <div key={entity} className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground capitalize">{entity}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Taille totale : {(status.totalSize / 1024).toFixed(2)} KB
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
