/**
 * Composant de diagnostic pour l'architecture de stockage
 * Diagnostic du StorageRouter et des différents adapters
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Cloud, 
  HardDrive, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  TestTube,
  Info
} from "lucide-react";
import { useSQLiteTest } from "@/hooks/useSQLiteTest";
import { storageRouter } from '@/services/storage/storage-router';
import { toast } from 'sonner';

interface DiagnosticResult {
  mode: string;
  demo: boolean;
  hdsConfigured: boolean;
  hdsUnlocked: boolean;
  supportsOPFS: boolean;
  cloudAvailable: boolean;
  localAvailable: boolean;
  dataTypes: {
    name: string;
    classification: string;
    location: string;
  }[];
  performance?: {
    cloud: number;
    local: number;
  };
}

export const HybridStorageDiagnostic = () => {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  
  const { loading: sqliteLoading, result: sqliteResult, runTest: runSQLiteTest } = useSQLiteTest();

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      // Exécuter le diagnostic du StorageRouter
      const diagnosis = await storageRouter.diagnose();
      
      // Test de performance
      const perfStart = performance.now();
      await storageRouter.route('patients');
      const localLatency = performance.now() - perfStart;
      
      const cloudPerfStart = performance.now();
      await storageRouter.route('users');
      const cloudLatency = performance.now() - cloudPerfStart;
      
      // Construire le résultat
      const dataTypes = [
        { name: 'Patients', classification: 'HDS', location: diagnosis.mode === 'demo' ? 'Demo Storage' : 'Local Sécurisé' },
        { name: 'Rendez-vous', classification: 'HDS', location: diagnosis.mode === 'demo' ? 'Demo Storage' : 'Local Sécurisé' },
        { name: 'Factures', classification: 'HDS', location: diagnosis.mode === 'demo' ? 'Demo Storage' : 'Local Sécurisé' },
        { name: 'Utilisateurs', classification: 'Non-HDS', location: 'Cloud (Supabase)' },
        { name: 'Cabinets', classification: 'Non-HDS', location: 'Cloud (Supabase)' },
        { name: 'Ostéopathes', classification: 'Non-HDS', location: 'Cloud (Supabase)' },
      ];
      
      // Check OPFS support
      const supportsOPFS = 'storage' in navigator && 'getDirectory' in navigator.storage;
      
      setDiagnosticResult({
        mode: diagnosis.mode,
        demo: diagnosis.mode === 'demo',
        hdsConfigured: diagnosis.security.hdsLocalOnly,
        hdsUnlocked: diagnosis.security.hdsLocalOnly,
        supportsOPFS,
        cloudAvailable: !diagnosis.isIframeEnvironment && diagnosis.mode === 'connected',
        localAvailable: diagnosis.mode === 'demo' || diagnosis.security.hdsLocalOnly,
        dataTypes,
        performance: {
          cloud: cloudLatency,
          local: localLatency
        }
      });
      
      toast.success('Diagnostic terminé avec succès');
    } catch (error) {
      console.error('Diagnostic failed:', error);
      toast.error('Erreur lors du diagnostic');
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const handleTestSQLite = async () => {
    await runSQLiteTest();
  };

  const getStatusBadge = (available: boolean) => (
    <Badge variant={available ? "default" : "destructive"} className="ml-2">
      {available ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Disponible
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3 mr-1" />
          Indisponible
        </>
      )}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Diagnostic Architecture de Stockage
          </CardTitle>
          <CardDescription>
            Test et validation du StorageRouter et des différents adapters (Demo, HDS, Cloud)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={handleRunDiagnostic} 
              disabled={isRunningDiagnostic}
              className="flex items-center gap-2"
            >
              {isRunningDiagnostic ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              Lancer le diagnostic
            </Button>

            <Button 
              onClick={handleTestSQLite} 
              disabled={sqliteLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {sqliteLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <HardDrive className="w-4 h-4" />
              )}
              Test SQLite
            </Button>
          </div>
        </CardContent>
      </Card>

      {diagnosticResult && (
        <Tabs defaultValue="status" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Statut</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Mode de Fonctionnement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mode actuel</span>
                      <Badge variant={diagnosticResult.demo ? "secondary" : "default"}>
                        {diagnosticResult.mode}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mode Démo</span>
                      {getStatusBadge(diagnosticResult.demo)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">HDS Configuré</span>
                      {getStatusBadge(diagnosticResult.hdsConfigured)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">HDS Déverrouillé</span>
                      {getStatusBadge(diagnosticResult.hdsUnlocked)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Support OPFS</span>
                      {getStatusBadge(diagnosticResult.supportsOPFS)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Disponibilité des stockages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-500" />
                    Disponibilité Stockages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Cloud (Supabase)</span>
                      </div>
                      {getStatusBadge(diagnosticResult.cloudAvailable)}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Local (HDS/Demo)</span>
                      </div>
                      {getStatusBadge(diagnosticResult.localAvailable)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {diagnosticResult.performance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      Performance Cloud
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Disponibilité</span>
                        <Badge variant={diagnosticResult.cloudAvailable ? "default" : "destructive"}>
                          {diagnosticResult.cloudAvailable ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Latence</span>
                        <span className="font-mono text-sm">
                          {diagnosticResult.performance.cloud.toFixed(2)}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (1000 - diagnosticResult.performance.cloud) / 10)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-500" />
                      Performance Local
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Disponibilité</span>
                        <Badge variant={diagnosticResult.localAvailable ? "default" : "destructive"}>
                          {diagnosticResult.localAvailable ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Latence</span>
                        <span className="font-mono text-sm">
                          {diagnosticResult.performance.local.toFixed(2)}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (100 - diagnosticResult.performance.local) / 1)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="classification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Classification des données</CardTitle>
                <CardDescription>
                  Répartition des types de données entre stockage cloud et local
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {diagnosticResult.dataTypes.map(dataType => (
                    <div key={dataType.name} className="flex flex-col gap-2 p-3 border rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{dataType.name}</span>
                        <Badge variant={dataType.classification === 'HDS' ? "destructive" : "default"}>
                          {dataType.classification}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {dataType.location.includes('Local') ? (
                          <HardDrive className="w-3 h-3" />
                        ) : (
                          <Cloud className="w-3 h-3" />
                        )}
                        {dataType.location}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Résultats du test SQLite */}
      {sqliteResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Test SQLite détaillé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Support SQLite</span>
                {getStatusBadge(sqliteResult.isSupported)}
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Support OPFS</span>
                {getStatusBadge(sqliteResult.hasOPFS)}
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Initialisation</span>
                {getStatusBadge(sqliteResult.initSuccess)}
              </div>
            </div>
            
            {sqliteResult.error && (
              <Alert className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {sqliteResult.error}
                </AlertDescription>
              </Alert>
            )}
            
          </CardContent>
        </Card>
      )}
    </div>
  );
};