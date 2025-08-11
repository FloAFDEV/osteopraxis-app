/**
 * Composant de diagnostic pour l'architecture hybride
 * Phase 1: Test et validation de l'infrastructure SQLite + OPFS
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
  ArrowUpDown,
  TestTube
} from "lucide-react";
import { hybridDataManager, useHybridDataDiagnostic } from "@/services/hybrid-data-adapter";
import { useSQLiteTest } from "@/hooks/useSQLiteTest";

interface DiagnosticResult {
  cloud: { available: boolean; entities: string[]; latency?: number };
  local: { available: boolean; entities: string[]; latency?: number };
  dataClassification: Record<string, string>;
}

interface SyncResult {
  success: boolean;
  migrated: number;
  errors: string[];
}

export const HybridStorageDiagnostic = () => {
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [isRunningSync, setIsRunningSync] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  
  const { runDiagnostic } = useHybridDataDiagnostic();
  const { loading: sqliteLoading, result: sqliteResult, runTest: runSQLiteTest } = useSQLiteTest();

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const result = await runDiagnostic();
      
      // Test de performance
      const perfTest = await hybridDataManager.performanceTest();
      setPerformanceData(perfTest);
      
      setDiagnosticResult({
        ...result,
        cloud: { ...result.cloud, latency: perfTest.cloud.latency },
        local: { ...result.local, latency: perfTest.local.latency }
      });
    } catch (error) {
      console.error('Diagnostic failed:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const handleSyncEntity = async (entityName: string) => {
    setIsRunningSync(true);
    try {
      const result = await hybridDataManager.syncCloudToLocal(entityName);
      setSyncResults(prev => ({ ...prev, [entityName]: result }));
    } catch (error) {
      setSyncResults(prev => ({ 
        ...prev, 
        [entityName]: { 
          success: false, 
          migrated: 0, 
          errors: [`Sync failed: ${error}`] 
        } 
      }));
    } finally {
      setIsRunningSync(false);
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
            Diagnostic Architecture Hybride
          </CardTitle>
          <CardDescription>
            Phase 1: Test et validation de l'infrastructure SQLite + OPFS pour le stockage local sécurisé
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Statut</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="sync">Synchronisation</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cloud Storage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    Stockage Cloud (Supabase)
                    {getStatusBadge(diagnosticResult.cloud.available)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Entités: {diagnosticResult.cloud.entities.length}
                    </div>
                    <div className="text-xs space-y-1">
                      {diagnosticResult.cloud.entities.map(entity => (
                        <div key={entity} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {entity}
                        </div>
                      ))}
                    </div>
                    {diagnosticResult.cloud.latency && (
                      <div className="flex items-center gap-2 mt-4">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Latence: {diagnosticResult.cloud.latency.toFixed(2)}ms
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Local Storage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-green-500" />
                    Stockage Local (SQLite + OPFS)
                    {getStatusBadge(diagnosticResult.local.available)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Tables: {diagnosticResult.local.entities.length}
                    </div>
                    <div className="text-xs space-y-1">
                      {diagnosticResult.local.entities.map(entity => (
                        <div key={entity} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {entity}
                        </div>
                      ))}
                    </div>
                    {diagnosticResult.local.latency && (
                      <div className="flex items-center gap-2 mt-4">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Latence: {diagnosticResult.local.latency.toFixed(2)}ms
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {performanceData && (
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
                        <Badge variant={performanceData.cloud.available ? "default" : "destructive"}>
                          {performanceData.cloud.available ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Latence</span>
                        <span className="font-mono text-sm">
                          {performanceData.cloud.latency.toFixed(2)}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (1000 - performanceData.cloud.latency) / 10)} 
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
                        <Badge variant={performanceData.local.available ? "default" : "destructive"}>
                          {performanceData.local.available ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Latence</span>
                        <span className="font-mono text-sm">
                          {performanceData.local.latency.toFixed(2)}ms
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (100 - performanceData.local.latency) / 1)} 
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
                  Répartition des entités entre stockage cloud et local
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(diagnosticResult.dataClassification).map(([entity, location]) => (
                    <div key={entity} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{entity}</span>
                      <Badge variant={location === 'cloud' ? "default" : "secondary"}>
                        {location === 'cloud' ? (
                          <>
                            <Cloud className="w-3 h-3 mr-1" />
                            Cloud
                          </>
                        ) : (
                          <>
                            <HardDrive className="w-3 h-3 mr-1" />
                            Local
                          </>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5" />
                  Synchronisation Cloud → Local
                </CardTitle>
                <CardDescription>
                  Migration des données depuis Supabase vers SQLite local
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['patients', 'appointments', 'invoices'].map(entity => (
                    <div key={entity} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-4 h-4" />
                        <span className="font-medium capitalize">{entity}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {syncResults[entity] && (
                          <div className="text-sm text-muted-foreground mr-4">
                            {syncResults[entity].success ? (
                              <span className="text-green-600">
                                ✓ {syncResults[entity].migrated} migrés
                              </span>
                            ) : (
                              <span className="text-red-600">
                                ✗ {syncResults[entity].errors.length} erreurs
                              </span>
                            )}
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => handleSyncEntity(entity)}
                          disabled={isRunningSync}
                          className="flex items-center gap-2"
                        >
                          {isRunningSync ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3" />
                          )}
                          Synchroniser
                        </Button>
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