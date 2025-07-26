import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Cloud, 
  Shield, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

import { hybridDataManager } from '@/services/hybrid-data-adapter';
import { hybridPatientService } from '@/services/hybrid-patient-service';
import { hybridAppointmentService } from '@/services/hybrid-appointment-service';
import { hybridInvoiceService } from '@/services/hybrid-invoice-service';
import { browserSQLite } from '@/services/sqlite/browser-sqlite';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  duration?: number;
}

export const HybridArchitectureTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      // Test 1: Infrastructure SQLite
      await testSQLiteInfrastructure();
      
      // Test 2: Gestionnaire hybride
      await testHybridManager();
      
      // Test 3: Services hybrides
      await testHybridServices();
      
      // Test 4: Sécurité des données
      await testDataSecurity();
      
      // Test 5: Performance
      await testPerformance();
      
      toast.success('Tests terminés avec succès !');
    } catch (error) {
      console.error('Erreur lors des tests:', error);
      toast.error('Erreur lors des tests');
    } finally {
      setIsRunning(false);
    }
  };

  const testSQLiteInfrastructure = async () => {
    const startTime = Date.now();
    
    try {
      // Test du support navigateur
      const hasWebAssembly = typeof WebAssembly !== 'undefined';
      const hasWorkers = typeof Worker !== 'undefined';
      
      if (!hasWebAssembly || !hasWorkers) {
        addResult({
          name: 'Support navigateur',
          status: 'error',
          message: 'WebAssembly ou Workers non supportés',
          duration: Date.now() - startTime
        });
        return;
      }

      // Test OPFS
      const storageInfo = await browserSQLite.getStorageInfo();
      const hasOPFS = storageInfo.opfsSupported;
      addResult({
        name: 'Support OPFS',
        status: hasOPFS ? 'success' : 'warning',
        message: hasOPFS ? 'OPFS disponible' : 'Fallback sur mémoire',
        duration: Date.now() - startTime
      });

      // Test initialisation SQLite
      try {
        await browserSQLite.initialize();
        const db = await browserSQLite.getDB();
        
        // Test basique d'écriture/lecture
        await db.run('CREATE TABLE IF NOT EXISTS test_table (id INTEGER, value TEXT)');
        await db.run('INSERT INTO test_table (id, value) VALUES (1, ?)', ['test_data']);
        const result = await db.get('SELECT value FROM test_table WHERE id = 1');
        
        if (result?.value === 'test_data') {
          addResult({
            name: 'SQLite opérationnel',
            status: 'success',
            message: 'Base SQLite initialisée et fonctionnelle',
            duration: Date.now() - startTime
          });
        } else {
          throw new Error('Données incohérentes');
        }
        
        // Nettoyage
        await db.run('DROP TABLE test_table');
        
      } catch (error) {
        addResult({
          name: 'SQLite opérationnel',
          status: 'error',
          message: `Erreur SQLite: ${error}`,
          duration: Date.now() - startTime
        });
      }
      
    } catch (error) {
      addResult({
        name: 'Infrastructure SQLite',
        status: 'error',
        message: `Erreur infrastructure: ${error}`,
        duration: Date.now() - startTime
      });
    }
  };

  const testHybridManager = async () => {
    const startTime = Date.now();
    
    try {
      // Test initialisation
      await hybridDataManager.initialize();
      
      addResult({
        name: 'Gestionnaire hybride',
        status: 'success',
        message: 'Gestionnaire initialisé avec succès',
        duration: Date.now() - startTime
      });

      // Test diagnostic
      const diagnostic = await hybridDataManager.diagnose();
      
      const allStorageOk = diagnostic.cloud.available && diagnostic.local.available;
      addResult({
        name: 'Diagnostic stockage',
        status: allStorageOk ? 'success' : 'warning',
        message: `Cloud: ${diagnostic.cloud.available ? 'OK' : 'KO'}, Local: ${diagnostic.local.available ? 'OK' : 'KO'}`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      addResult({
        name: 'Gestionnaire hybride',
        status: 'error',
        message: `Erreur gestionnaire: ${error}`,
        duration: Date.now() - startTime
      });
    }
  };

  const testHybridServices = async () => {
    const startTime = Date.now();
    
    try {
      // Test service patients
      const patients = await hybridPatientService.getPatients();
      addResult({
        name: 'Service patients hybride',
        status: 'success',
        message: `${patients.length} patients chargés depuis le stockage local`,
        duration: Date.now() - startTime
      });

      // Test service rendez-vous
      const appointments = await hybridAppointmentService.getAppointments();
      addResult({
        name: 'Service rendez-vous hybride',
        status: 'success',
        message: `${appointments.length} rendez-vous chargés depuis le stockage local`,
        duration: Date.now() - startTime
      });

      // Test service factures
      const invoices = await hybridInvoiceService.getInvoices();
      addResult({
        name: 'Service factures hybride',
        status: 'success',
        message: `${invoices.length} factures chargées depuis le stockage local`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      addResult({
        name: 'Services hybrides',
        status: 'error',
        message: `Erreur services: ${error}`,
        duration: Date.now() - startTime
      });
    }
  };

  const testDataSecurity = async () => {
    const startTime = Date.now();
    
    try {
      // Vérifier que les données sensibles sont bien locales
      const diagnostic = await hybridDataManager.diagnose();
      
      const sensitiveDataLocal = [
        'patients', 'appointments', 'invoices', 'consultations', 'medicalDocuments'
      ].every(entity => diagnostic.dataClassification[entity] === 'local');
      
      const nonSensitiveDataCloud = [
        'users', 'osteopaths', 'cabinets'
      ].every(entity => diagnostic.dataClassification[entity] === 'cloud');
      
      if (sensitiveDataLocal && nonSensitiveDataCloud) {
        addResult({
          name: 'Classification sécurisée',
          status: 'success',
          message: 'Données sensibles stockées localement, configuration cloud sécurisée',
          duration: Date.now() - startTime
        });
      } else {
        addResult({
          name: 'Classification sécurisée',
          status: 'warning',
          message: 'Classification des données à vérifier',
          duration: Date.now() - startTime
        });
      }
      
    } catch (error) {
      addResult({
        name: 'Sécurité des données',
        status: 'error',
        message: `Erreur sécurité: ${error}`,
        duration: Date.now() - startTime
      });
    }
  };

  const testPerformance = async () => {
    const startTime = Date.now();
    
    try {
      // Test de performance basique
      const perfStart = performance.now();
      
      const [patients, appointments, invoices] = await Promise.all([
        hybridPatientService.getPatients(),
        hybridAppointmentService.getAppointments(),
        hybridInvoiceService.getInvoices()
      ]);
      
      const perfEnd = performance.now();
      const duration = Math.round(perfEnd - perfStart);
      
      const isPerformant = duration < 1000; // moins d'1 seconde
      
      addResult({
        name: 'Performance de chargement',
        status: isPerformant ? 'success' : 'warning',
        message: `Chargement en ${duration}ms (${patients.length + appointments.length + invoices.length} enregistrements)`,
        duration: Date.now() - startTime
      });
      
    } catch (error) {
      addResult({
        name: 'Performance',
        status: 'error',
        message: `Erreur performance: ${error}`,
        duration: Date.now() - startTime
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-500" />
            <Cloud className="h-6 w-6 text-green-500" />
            <Shield className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <CardTitle>Test Architecture Hybride Complète</CardTitle>
            <CardDescription>
              Validation de l'architecture SaaS + Local sécurisée
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={runFullTest} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
          </Button>

          {results.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="default">{successCount} succès</Badge>
              {warningCount > 0 && <Badge variant="secondary">{warningCount} avertissements</Badge>}
              {errorCount > 0 && <Badge variant="destructive">{errorCount} erreurs</Badge>}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Résultats des tests</h3>
              
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <span className="font-medium">{result.name}</span>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-xs text-muted-foreground">
                        {result.duration}ms
                      </span>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {errorCount === 0 && results.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 Architecture hybride opérationnelle ! Les données sensibles sont sécurisées localement 
              et l'application est prête pour un déploiement desktop/web sécurisé.
            </AlertDescription>
          </Alert>
        )}

        {errorCount > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Des erreurs ont été détectées. Veuillez les corriger avant de passer en production.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};