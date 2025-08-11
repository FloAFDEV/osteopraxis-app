/**
 * Hook de test pour vérifier le fonctionnement de SQLite
 * Utilisé pour diagnostiquer et tester l'architecture hybride
 */

import { useState } from 'react';
import { browserSQLite } from '../services/sqlite/browser-sqlite';


interface SQLiteTestResult {
  isSupported: boolean;
  hasOPFS: boolean;
  initSuccess: boolean;
  storageInfo?: any;
  testPatientCreated?: boolean;
  error?: string;
}

export function useSQLiteTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SQLiteTestResult | null>(null);

  const runTest = async (): Promise<void> => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Starting SQLite test...');

      const testResult: SQLiteTestResult = {
        isSupported: false,
        hasOPFS: false,
        initSuccess: false
      };

      // Test 1: Vérifier le support SQLite
      testResult.isSupported = await browserSQLite.constructor.prototype.constructor.isSupported?.() ?? false;
      console.log('✅ SQLite supported:', testResult.isSupported);

      // Test 2: Vérifier le support OPFS
      testResult.hasOPFS = await browserSQLite.constructor.prototype.constructor.hasOPFSSupport?.() ?? false;
      console.log('✅ OPFS supported:', testResult.hasOPFS);

      // Test 3: Initialiser SQLite
      try {
        await browserSQLite.initialize();
        testResult.initSuccess = true;
        console.log('✅ SQLite initialization successful');

        // Test 4: Obtenir les informations de stockage
        testResult.storageInfo = await browserSQLite.getStorageInfo();
        console.log('✅ Storage info:', testResult.storageInfo);

        // Test 5: Tester la création d'un patient
        const adapters = createSQLiteAdapters();
        const testPatient = await adapters.patients.create({
          firstName: 'Test',
          lastName: 'Patient',
          email: 'test@example.com',
          osteopathId: 1
        });
        
        if (testPatient && testPatient.id) {
          testResult.testPatientCreated = true;
          console.log('✅ Test patient created:', testPatient);

          // Nettoyer le patient de test
          await adapters.patients.delete(testPatient.id);
          console.log('🧹 Test patient cleaned up');
        }

      } catch (initError) {
        console.error('❌ SQLite initialization failed:', initError);
        testResult.error = `Initialization failed: ${initError}`;
      }

      setResult(testResult);
      console.log('🧪 SQLite test completed:', testResult);

    } catch (error) {
      console.error('❌ SQLite test failed:', error);
      setResult({
        isSupported: false,
        hasOPFS: false,
        initSuccess: false,
        error: `Test failed: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    result,
    runTest
  };
}