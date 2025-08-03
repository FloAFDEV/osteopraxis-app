/**
 * Gestionnaire de données USB - Interface HDS pour import/export sécurisé
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Download, 
  Shield, 
  HardDrive, 
  FileCheck, 
  AlertTriangle,
  RefreshCw,
  Lock,
  Database
} from 'lucide-react';
import { hdsLocalDataService } from '@/services/hds-data-adapter/local-service';
// import { usbExportService, usbImportService } from '@/services/secure-usb-sharing'; // Remplacé par hdsUSBService
import { HDSLocalStatus } from '@/services/hds-data-adapter/types';
import { toast } from 'sonner';

interface USBOperation {
  type: 'export' | 'import';
  progress: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  message?: string;
}

export function USBDataManager() {
  const [localStatus, setLocalStatus] = useState<HDSLocalStatus | null>(null);
  const [operation, setOperation] = useState<USBOperation>({ type: 'export', progress: 0, status: 'idle' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocalStatus();
  }, []);

  const loadLocalStatus = async () => {
    try {
      setIsLoading(true);
      const status = await hdsLocalDataService.getStatus();
      setLocalStatus(status);
    } catch (error) {
      console.error('Erreur lors du chargement du statut local:', error);
      toast.error('Impossible de charger le statut du stockage local');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!localStatus?.available) {
      toast.error('Stockage local non disponible');
      return;
    }

    try {
      setOperation({ type: 'export', progress: 0, status: 'running' });

      // Simulation du progrès d'export
      const progressInterval = setInterval(() => {
        setOperation(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // Utilisation du nouveau service HDS USB (temporairement simulé)
      // const result = await hdsUSBService.exportSensitiveData({
      //   password: 'temp-password',
      //   includePatients: true,
      //   includeAppointments: true,
      //   includeInvoices: true
      // });

      // Simulation temporaire
      setTimeout(() => {
        clearInterval(progressInterval);
        setOperation({ type: 'export', progress: 100, status: 'completed', message: 'Export simulé terminé' });
        toast.success('Export simulé - Service HDS USB en cours de finalisation');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setOperation({ type: 'export', progress: 0, status: 'error', message: 'Erreur lors de l\'export' });
      toast.error('Erreur lors de l\'export des données');
    }
  };

  const handleImport = async (file: File) => {
    try {
      setOperation({ type: 'import', progress: 0, status: 'running' });

      // Simulation du progrès d'import
      const progressInterval = setInterval(() => {
        setOperation(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 15, 90)
        }));
      }, 300);

      // Utilisation du nouveau service HDS USB (temporairement simulé)
      // const result = await hdsUSBService.importSensitiveData(file, 'temp-password');

      // Simulation temporaire
      setTimeout(() => {
        clearInterval(progressInterval);
        setOperation({ 
          type: 'import', 
          progress: 100, 
          status: 'completed', 
          message: 'Import simulé terminé'
        });
        toast.success('Import simulé - Service HDS USB en cours de finalisation');
        loadLocalStatus();
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setOperation({ type: 'import', progress: 0, status: 'error', message: 'Erreur lors de l\'import' });
      toast.error('Erreur lors de l\'import des données');
    }
  };

  const resetOperation = () => {
    setOperation({ type: 'export', progress: 0, status: 'idle' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête HDS */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Gestion des Données HDS</CardTitle>
          </div>
          <CardDescription>
            Stockage sécurisé et conforme HDS. Vos données de santé restent exclusivement en local.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm">Stockage Local</span>
                <Badge variant={localStatus?.available ? "default" : "destructive"}>
                  {localStatus?.available ? "Actif" : "Indisponible"}
                </Badge>
              </div>
              {localStatus?.encrypted && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Chiffré</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={loadLocalStatus}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques locales */}
      {localStatus?.available && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Données Stockées Localement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{localStatus.patientCount}</div>
                <div className="text-sm text-muted-foreground">Patients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{localStatus.appointmentCount}</div>
                <div className="text-sm text-muted-foreground">Rendez-vous</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{localStatus.invoiceCount}</div>
                <div className="text-sm text-muted-foreground">Factures</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import/Export USB */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export USB Sécurisé
            </CardTitle>
            <CardDescription>
              Exporter vos données vers une clé USB chiffrée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operation.status === 'running' && operation.type === 'export' && (
              <div className="space-y-2">
                <Progress value={operation.progress} />
                <p className="text-sm text-muted-foreground">Export en cours...</p>
              </div>
            )}
            
            {operation.status === 'completed' && operation.type === 'export' && (
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertDescription>{operation.message}</AlertDescription>
              </Alert>
            )}

            {operation.status === 'error' && operation.type === 'export' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{operation.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleExport}
                disabled={!localStatus?.available || operation.status === 'running'}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              {operation.status !== 'idle' && (
                <Button variant="ghost" onClick={resetOperation}>
                  Réinitialiser
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import USB Sécurisé
            </CardTitle>
            <CardDescription>
              Importer des données depuis un fichier PatientHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operation.status === 'running' && operation.type === 'import' && (
              <div className="space-y-2">
                <Progress value={operation.progress} />
                <p className="text-sm text-muted-foreground">Import en cours...</p>
              </div>
            )}

            {operation.status === 'completed' && operation.type === 'import' && (
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertDescription>{operation.message}</AlertDescription>
              </Alert>
            )}

            {operation.status === 'error' && operation.type === 'import' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{operation.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <input
                type="file"
                accept=".phub"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                disabled={operation.status === 'running'}
              />
              <p className="text-xs text-muted-foreground">
                Seuls les fichiers .phub sont acceptés
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations de sécurité */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Shield className="h-5 w-5" />
            Sécurité et Conformité HDS
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <ul className="space-y-2 text-sm">
            <li>• Toutes les données de santé sont stockées exclusivement en local</li>
            <li>• Les exports USB sont chiffrés avec AES-256</li>
            <li>• Aucune donnée sensible n'est envoyée vers le cloud</li>
            <li>• Utilisez un mot de passe fort pour vos exports</li>
            <li>• Conservez vos sauvegardes USB en lieu sûr</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}