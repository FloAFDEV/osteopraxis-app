import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, HardDrive, Cloud, Shield, Monitor } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { checkOPFSSupport } from '@/services/sqlite/opfs-sqlite-service';
import { hybridDataManager } from '@/services/hybrid-data-adapter/hybrid-manager';
import { isUsingMemoryFallback, clearMemoryStorage } from '@/services/hybrid-data-adapter/local-adapters';
import { getExecutionContext } from '@/utils/iframe-detection';
import { toast } from 'sonner';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export default function StorageDiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [storageStatus, setStorageStatus] = useState<any>(null);
  const [executionContext, setExecutionContext] = useState(() => getExecutionContext());

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];
    
    // Mettre à jour le contexte d'exécution
    const context = getExecutionContext();
    setExecutionContext(context);

    try {
      // 0. Diagnostic iframe/preview
      diagnostics.push({
        name: 'Environnement d\'exécution',
        status: context.isIframe ? 'warning' : 'success',
        message: context.isIframe 
          ? (context.isLovablePreview ? 'Mode Prévisualisation Lovable détecté' : 'Application dans iframe')
          : 'Application standalone',
        details: `Backend recommandé: ${context.recommendedBackend} | FSA disponible: ${context.canUseFSA}`
      });
      // 1. Vérifier le support OPFS
      const opfsSupported = checkOPFSSupport();
      diagnostics.push({
        name: 'Support OPFS (Origin Private File System)',
        status: opfsSupported ? 'success' : 'error',
        message: opfsSupported 
          ? 'OPFS est supporté par ce navigateur' 
          : 'OPFS n\'est pas supporté par ce navigateur',
        details: opfsSupported 
          ? 'Le stockage local sécurisé est disponible pour les données HDS'
          : 'Utilisation du mode mémoire temporaire (données perdues au rechargement)'
      });

      // 2. Vérifier le manager hybride
      try {
        await hybridDataManager.initialize();
        diagnostics.push({
          name: 'Initialisation du gestionnaire hybride',
          status: 'success',
          message: 'Manager hybride initialisé avec succès'
        });
      } catch (error) {
        diagnostics.push({
          name: 'Initialisation du gestionnaire hybride',
          status: 'error',
          message: 'Échec de l\'initialisation du manager hybride',
          details: (error as Error).message
        });
      }

      // 3. Vérifier le status du stockage
      try {
        const status = await hybridDataManager.getStorageStatus();
        setStorageStatus(status);
        
        diagnostics.push({
          name: 'Status du stockage local',
          status: status.local.available ? 'success' : 'warning',
          message: status.local.available 
            ? 'Stockage local disponible' 
            : 'Stockage local non disponible',
          details: `Tables: ${status.local.tables.join(', ')}`
        });

        diagnostics.push({
          name: 'Status du stockage cloud',
          status: status.cloud ? 'success' : 'warning',
          message: status.cloud 
            ? 'Connexion cloud (Supabase) disponible' 
            : 'Connexion cloud non disponible'
        });
      } catch (error) {
        diagnostics.push({
          name: 'Vérification du stockage',
          status: 'error',
          message: 'Impossible de vérifier le status du stockage',
          details: (error as Error).message
        });
      }

      // 4. Vérifier le mode mémoire
      const usingMemory = isUsingMemoryFallback();
      diagnostics.push({
        name: 'Mode de stockage temporaire',
        status: usingMemory ? 'warning' : 'success',
        message: usingMemory 
          ? 'Mode mémoire temporaire actif' 
          : 'Stockage persistant actif',
        details: usingMemory 
          ? 'Les données seront perdues au rechargement de la page'
          : 'Les données sont sauvegardées de manière persistante'
      });

      // 5. Test de performance
      try {
        const perfResults = await hybridDataManager.performanceTest();
        diagnostics.push({
          name: 'Test de performance',
          status: perfResults.cloud.latency < 1000 ? 'success' : 'warning',
          message: `Cloud: ${perfResults.cloud.latency}ms | Local: ${perfResults.local.latency}ms`,
          details: `Disponibilité - Cloud: ${perfResults.cloud.available} | Local: ${perfResults.local.available}`
        });
      } catch (error) {
        diagnostics.push({
          name: 'Test de performance',
          status: 'error',
          message: 'Impossible d\'effectuer le test de performance',
          details: (error as Error).message
        });
      }

    } catch (error) {
      diagnostics.push({
        name: 'Diagnostic général',
        status: 'error',
        message: 'Erreur lors du diagnostic',
        details: (error as Error).message
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  const clearMemoryData = () => {
    clearMemoryStorage();
    toast.success('Données temporaires effacées');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">OK</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Attention</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Diagnostic du Stockage Hybride</h1>
          {executionContext.isIframe && (
            <Badge variant="secondary" className="gap-1">
              <Monitor className="w-3 h-3" />
              Preview Mode
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Vérifiez la disponibilité et le fonctionnement du système de stockage hybride pour les données HDS.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Tests de Diagnostic
          </CardTitle>
          <CardDescription>
            Cliquez sur "Exécuter les diagnostics" pour tester tous les composants du stockage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              'Exécuter les diagnostics'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{result.name}</p>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {storageStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Stockage Local (HDS)
              </CardTitle>
              {executionContext.isIframe && (
                <Badge variant="secondary" className="text-xs">
                  Mode: {executionContext.recommendedBackend}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Disponible:</span>
                <Badge variant={storageStatus.local.available ? "default" : "destructive"}>
                  {storageStatus.local.available ? "Oui" : "Non"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Chiffrement:</span>
                <Badge variant={storageStatus.local.encrypted ? "default" : "secondary"}>
                  {storageStatus.local.encrypted ? "Activé" : "Désactivé"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Tables:</span>
                <span className="text-sm">{storageStatus.local.tables.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Stockage Cloud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Disponible:</span>
                <Badge variant={storageStatus.cloud ? "default" : "destructive"}>
                  {storageStatus.cloud ? "Oui" : "Non"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="text-sm">Supabase</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Conformité HDS
          </CardTitle>
          <CardDescription>
            Informations importantes sur la conformité aux exigences HDS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-2">Données Sensibles HDS</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Les données suivantes DOIVENT être stockées localement pour respecter la conformité HDS :
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>• Patients</span>
              <span>• Rendez-vous</span>
              <span>• Consultations</span>
              <span>• Factures</span>
              <span>• Documents médicaux</span>
              <span>• Devis</span>
              <span>• Historique des traitements</span>
              <span>• Relations patients</span>
            </div>
          </div>

          {isUsingMemoryFallback() && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <h4 className="font-semibold text-warning mb-2">Mode Récupération Actif</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Le stockage local n'est pas disponible. L'application utilise un stockage temporaire en mémoire.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Limitations :</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Données perdues au rechargement de la page</li>
                  <li>• Non conforme aux exigences HDS</li>
                  <li>• Fonctionnalités limitées</li>
                </ul>
                <Button variant="outline" size="sm" onClick={clearMemoryData}>
                  Effacer les données temporaires
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}