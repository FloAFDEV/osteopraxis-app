/**
 * Composant principal de migration HDS
 * Interface utilisateur pour exécuter la migration forcée
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { forcedMigrationService, type ForcedMigrationStatus } from '@/services/hds-compliance/forced-migration-service';
import { hybridDataManager } from '@/services/hybrid-data-adapter/hybrid-manager';
import { AlertTriangle, CheckCircle, XCircle, Shield, Database, Lock } from 'lucide-react';

export function HDSMigrationDashboard() {
  const [migrationStatus, setMigrationStatus] = useState<ForcedMigrationStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [storageStatus, setStorageStatus] = useState<any>(null);

  useEffect(() => {
    checkMigrationStatus();
    loadStorageStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const required = await forcedMigrationService.isMigrationRequired();
      setMigrationRequired(required);
    } catch (error) {
      console.error('Erreur vérification migration:', error);
      setMigrationRequired(true); // Par sécurité
    }
  };

  const loadStorageStatus = async () => {
    try {
      const status = await hybridDataManager.getStorageStatus();
      setStorageStatus(status);
    } catch (error) {
      console.error('Erreur chargement statut stockage:', error);
    }
  };

  const executeMigration = async () => {
    setIsRunning(true);
    try {
      const result = await forcedMigrationService.executeForcedMigration();
      setMigrationStatus(result);
      setMigrationRequired(!result.completed);
    } catch (error) {
      console.error('Erreur migration:', error);
      alert(`Erreur critique: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!migrationRequired && migrationStatus?.completed) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-600">Conformité HDS Activée</CardTitle>
          </div>
          <CardDescription>
            Toutes les données sensibles sont stockées localement de manière chiffrée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Stockage Local</p>
              <p className="text-xs text-muted-foreground">Données sensibles</p>
            </div>
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Chiffrement</p>
              <p className="text-xs text-muted-foreground">AES-256 activé</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Conformité</p>
              <p className="text-xs text-muted-foreground">HDS respecté</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-orange-600">Migration HDS Requise</CardTitle>
          </div>
          <CardDescription>
            Les données sensibles doivent être migrées vers le stockage local pour respecter la conformité HDS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>OBLIGATOIRE:</strong> Cette migration est nécessaire pour la conformité HDS. 
              Les données patients, rendez-vous et factures seront déplacées vers un stockage local chiffré.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Données à migrer:</h4>
              <ul className="text-sm space-y-1">
                <li>• Patients</li>
                <li>• Rendez-vous</li>
                <li>• Factures</li>
                <li>• Consultations</li>
                <li>• Documents médicaux</li>
                <li>• Historique des traitements</li>
                <li>• Devis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Stockage après migration:</h4>
              <ul className="text-sm space-y-1">
                <li>• Local: Données sensibles (chiffrées)</li>
                <li>• Cloud: Authentification, configuration</li>
                <li>• Suppression: Données sensibles de Supabase</li>
                <li>• Sécurité: Politiques RLS de blocage</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={executeMigration} 
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Migration en cours...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Démarrer la Migration HDS
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {migrationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {migrationStatus.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Résultat de la Migration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {migrationStatus.totalMigrated}
                </div>
                <div className="text-sm text-muted-foreground">Enregistrements migrés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {migrationStatus.totalErrors}
                </div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {migrationStatus.results.length}
                </div>
                <div className="text-sm text-muted-foreground">Entités traitées</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Détails par entité:</h4>
              {migrationStatus.results.map((result) => (
                <div key={result.entity} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">{result.entity}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.deletedFromSupabase ? "default" : "destructive"}>
                      {result.migratedCount} migrés
                    </Badge>
                    {result.deletedFromSupabase ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {migrationStatus.completed && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Migration HDS terminée avec succès ! Votre application est maintenant conforme.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {storageStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Statut du Stockage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Stockage Local</h4>
                <p className="text-sm">
                  Status: {storageStatus.local?.available ? '✅ Disponible' : '❌ Indisponible'}
                </p>
                <p className="text-sm">
                  Tables: {storageStatus.local?.tables?.length || 0}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Stockage Cloud</h4>
                <p className="text-sm">
                  Status: {storageStatus.cloud ? '✅ Connecté' : '❌ Déconnecté'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}