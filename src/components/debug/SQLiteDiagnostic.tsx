/**
 * Composant de diagnostic SQLite
 * Permet de tester et diagnostiquer l'architecture hybride
 */

import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useSQLiteTest } from '../../hooks/useSQLiteTest';
import { useHybridDataDiagnostic } from '../../services/hybrid-data-adapter';
import { useHybridArchitectureTest } from '../../hooks/useHybridArchitectureTest';
import { Loader2, Zap } from 'lucide-react';

export function SQLiteDiagnostic() {
  const { loading: sqliteLoading, result: sqliteResult, runTest: runSQLiteTest } = useSQLiteTest();
  const { runDiagnostic } = useHybridDataDiagnostic();
  const {
    isLoading: isHybridLoading,
    testResults: hybridResults,
    runHybridTest,
    clearResults: clearHybridResults
  } = useHybridArchitectureTest();

  const handleHybridDiagnostic = async () => {
    await runDiagnostic();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Diagnostic Architecture Hybride</CardTitle>
          <CardDescription>
            Test de l'infrastructure SQLite + OPFS pour le stockage local des données sensibles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runSQLiteTest} 
              disabled={sqliteLoading}
              variant="outline"
            >
              {sqliteLoading ? 'Test en cours...' : 'Tester SQLite'}
            </Button>
            
            <Button 
              onClick={handleHybridDiagnostic}
              variant="outline"
            >
              Diagnostic Hybride
            </Button>

            <Button 
              onClick={runHybridTest}
              disabled={isHybridLoading}
              className="flex items-center gap-2"
            >
              {isHybridLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Zap className="h-4 w-4" />
              Test Complet
            </Button>
          </div>

          {sqliteResult && (
            <div className="space-y-3">
              <h4 className="font-semibold">Résultats du test SQLite :</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span>Support SQLite :</span>
                  <Badge variant={sqliteResult.isSupported ? "default" : "destructive"}>
                    {sqliteResult.isSupported ? 'Supporté' : 'Non supporté'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span>Support OPFS :</span>
                  <Badge variant={sqliteResult.hasOPFS ? "default" : "secondary"}>
                    {sqliteResult.hasOPFS ? 'Supporté' : 'Mémoire uniquement'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span>Initialisation :</span>
                  <Badge variant={sqliteResult.initSuccess ? "default" : "destructive"}>
                    {sqliteResult.initSuccess ? 'Réussie' : 'Échouée'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span>Test CRUD :</span>
                  <Badge variant={sqliteResult.testPatientCreated ? "default" : "destructive"}>
                    {sqliteResult.testPatientCreated ? 'Réussi' : 'Échoué'}
                  </Badge>
                </div>
              </div>

              {sqliteResult.storageInfo && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">Informations de stockage :</h5>
                  <div className="text-sm space-y-1">
                    <div>Taille DB : {sqliteResult.storageInfo.databaseSize} bytes</div>
                    <div>Nombre de tables : {sqliteResult.storageInfo.tablesCount}</div>
                    <div>OPFS disponible : {sqliteResult.storageInfo.opfsSupported ? 'Oui' : 'Non'}</div>
                  </div>
                </div>
              )}

              {sqliteResult.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{sqliteResult.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résultats du test hybride */}
      {hybridResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Résultats Test Architecture Hybride
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearHybridResults}
                disabled={isHybridLoading}
              >
                Effacer
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hybridResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{result.step}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      result.status.includes('✅') ? 'default' : 
                      result.status.includes('⚠️') ? 'secondary' : 
                      result.status.includes('❌') ? 'destructive' : 'outline'
                    }>
                      {result.status}
                    </Badge>
                    {result.time > 0 && (
                      <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                        {result.time}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📊 Classification des Données</CardTitle>
          <CardDescription>
            Répartition des données selon l'architecture hybride
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-primary">☁️ Données Cloud (Supabase)</h4>
              <ul className="text-sm space-y-1">
                <li>• Authentification (auth.users)</li>
                <li>• Utilisateurs (User)</li>
                <li>• Ostéopathes (Osteopath)</li>
                <li>• Cabinets (Cabinet)</li>
                <li>• Configuration non-sensible</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-secondary">🔒 Données Locales (SQLite)</h4>
              <ul className="text-sm space-y-1">
                <li>• Patients (données personnelles)</li>
                <li>• Rendez-vous (Appointment)</li>
                <li>• Factures (Invoice)</li>
                <li>• Consultations (Consultation)</li>
                <li>• Documents médicaux</li>
                <li>• Historique des traitements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚠️ Informations importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>OPFS</strong> : Stockage persistant dans le navigateur (Chrome/Edge 86+, Firefox 111+)</p>
          <p>• <strong>Fallback</strong> : Si OPFS non disponible, SQLite fonctionnera en mémoire uniquement</p>
          <p>• <strong>Sécurité</strong> : Les données locales seront chiffrées lors de l'export/import</p>
          <p>• <strong>Compatibilité</strong> : Cette version Web sera la base pour Desktop (Tauri) et Mobile (Capacitor)</p>
        </CardContent>
      </Card>
    </div>
  );
}