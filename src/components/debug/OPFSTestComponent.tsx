import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { checkOPFSSupport, getOPFSSQLiteService } from '@/services/sqlite/opfs-sqlite-service';
import { hybridStorageManager } from '@/services/hybrid-storage-manager';
import { clearMemoryStorage, isUsingMemoryFallback } from '@/services/hybrid-data-adapter/local-adapters';

interface TestResult {
  step: string;
  success: boolean;
  details: any;
  error?: string;
}

export function OPFSTestComponent() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runCompleteTest = async () => {
    setTesting(true);
    setResults([]);

    const testResults: TestResult[] = [];

    try {
      // Test 1: Support OPFS navigateur
      console.log('🧪 Test 1: Vérification support OPFS navigateur...');
      const opfsSupport = checkOPFSSupport();
      testResults.push({
        step: 'Support OPFS Navigateur',
        success: opfsSupport.supported,
        details: opfsSupport.details,
        error: !opfsSupport.supported ? 'OPFS non supporté par le navigateur' : undefined
      });

      // Test 2: Initialisation du service SQLite
      console.log('🧪 Test 2: Initialisation service SQLite OPFS...');
      try {
        const service = await getOPFSSQLiteService();
        testResults.push({
          step: 'Initialisation SQLite',
          success: true,
          details: 'Service SQLite OPFS initialisé avec succès'
        });

        // Test 3: Test de requête simple
        console.log('🧪 Test 3: Test requête SQLite...');
        const versionResult = service.query('SELECT sqlite_version() as version');
        testResults.push({
          step: 'Test requête SQLite',
          success: versionResult.length > 0,
          details: versionResult,
          error: versionResult.length === 0 ? 'Aucun résultat de requête' : undefined
        });

        // Test 4: Test création et suppression patient
        console.log('🧪 Test 4: Test CRUD patient...');
        try {
          // Créer un patient test
          const createResult = await service.run(
            'INSERT INTO patients (firstName, lastName, email) VALUES (?, ?, ?)', 
            ['Test', 'OPFS', 'test@opfs.local']
          );
          
          // Vérifier l'ID
          if (createResult.lastID > 0) {
            // Récupérer le patient
            const patient = service.query('SELECT * FROM patients WHERE id = ?', [createResult.lastID]);
            
            // Supprimer le patient test
            const deleteResult = await service.run('DELETE FROM patients WHERE id = ?', [createResult.lastID]);
            
            testResults.push({
              step: 'Test CRUD Patient',
              success: true,
              details: {
                created: createResult,
                retrieved: patient,
                deleted: deleteResult
              }
            });
          } else {
            throw new Error('ID patient non généré');
          }
        } catch (crudError) {
          testResults.push({
            step: 'Test CRUD Patient',
            success: false,
            details: null,
            error: crudError instanceof Error ? crudError.message : 'Erreur CRUD inconnue'
          });
        }

      } catch (serviceError) {
        testResults.push({
          step: 'Initialisation SQLite',
          success: false,
          details: null,
          error: serviceError instanceof Error ? serviceError.message : 'Erreur d\'initialisation inconnue'
        });
      }

      // Test 5: Status du gestionnaire hybride
      console.log('🧪 Test 5: Status gestionnaire stockage hybride...');
      try {
        const storageStatus = await hybridStorageManager.getStorageStatus();
        testResults.push({
          step: 'Status Stockage Hybride',
          success: true,
          details: storageStatus
        });
      } catch (statusError) {
        testResults.push({
          step: 'Status Stockage Hybride',
          success: false,
          details: null,
          error: statusError instanceof Error ? statusError.message : 'Erreur status inconnue'
        });
      }

      // Test 6: Vérifier si on utilise le fallback
      console.log('🧪 Test 6: Vérification mode fallback...');
      try {
        const usingFallback = isUsingMemoryFallback();
        testResults.push({
          step: 'Mode Fallback',
          success: true,
          details: {
            usingMemoryFallback: usingFallback,
            explanation: usingFallback ? 'Utilise localStorage (mode récupération)' : 'Utilise OPFS SQLite (mode optimal)'
          }
        });
      } catch (fallbackError) {
        testResults.push({
          step: 'Mode Fallback',
          success: false,
          details: null,
          error: fallbackError instanceof Error ? fallbackError.message : 'Erreur vérification fallback'
        });
      }

    } catch (globalError) {
      testResults.push({
        step: 'Test Global',
        success: false,
        details: null,
        error: globalError instanceof Error ? globalError.message : 'Erreur globale inconnue'
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const clearFallbackData = () => {
    try {
      clearMemoryStorage();
      // Note: sqlite-fallback supprimés pour sécurité HDS
      console.log('🧹 Données fallback effacées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'effacement:', error);
    }
  };

  const forceReinitializeOPFS = async () => {
    try {
      console.log('🔄 Force réinitialisation OPFS...');
      const service = await getOPFSSQLiteService();
      if (service && typeof service.forceReinitialize === 'function') {
        await service.forceReinitialize();
        console.log('✅ Réinitialisation OPFS réussie');
        // Relancer le test
        await runCompleteTest();
      }
    } catch (error) {
      console.error('❌ Erreur réinitialisation OPFS:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Complet OPFS SQLite</CardTitle>
          <CardDescription>
            Diagnostic approfondi du stockage local sécurisé et de l'architecture hybride
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={runCompleteTest} 
              disabled={testing}
              variant="default"
            >
              {testing ? 'Test en cours...' : 'Lancer Test Complet'}
            </Button>
            <Button 
              onClick={forceReinitializeOPFS} 
              disabled={testing}
              variant="secondary"
            >
              Forcer Réinit OPFS
            </Button>
            <Button 
              onClick={clearFallbackData} 
              variant="outline"
            >
              Effacer Données Fallback
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <h3 className="text-lg font-semibold">Résultats du Diagnostic</h3>
              
              {results.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "✅" : "❌"}
                    </Badge>
                    <h4 className="font-medium">{result.step}</h4>
                  </div>
                  
                  {result.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {result.details && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {typeof result.details === 'string' 
                          ? result.details 
                          : JSON.stringify(result.details, null, 2)
                        }
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions de Diagnostic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertDescription>
              <strong>Mode Fallback (localStorage):</strong> Si OPFS ne fonctionne pas, le système utilise automatiquement 
              localStorage pour assurer la persistance des données HDS. C'est un mode de récupération fonctionnel.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertDescription>
              <strong>Mode OPFS (Optimal):</strong> Stockage sécurisé dans l'Origin Private File System du navigateur. 
              Nécessite un navigateur récent et un contexte sécurisé (HTTPS).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}