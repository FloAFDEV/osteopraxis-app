import { useState } from 'react';
import { hybridDataManager } from '@/services/hybrid-data-adapter';
import { toast } from 'sonner';

/**
 * Hook de test pour démontrer l'architecture hybride en action
 */
export const useHybridArchitectureTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runHybridTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      console.log('🧪 Test de l\'architecture hybride démarré...');
      
      // Test 1: Initialisation
      const result1 = { step: 'Initialisation', status: 'En cours...', time: Date.now() };
      setTestResults(prev => [...prev, result1]);
      
      await hybridDataManager.initialize();
      result1.status = '✅ Succès';
      result1.time = Date.now() - result1.time;
      setTestResults(prev => [...prev.slice(0, -1), result1]);
      
      // Test 2: Diagnostic du système
      const result2 = { step: 'Diagnostic du système', status: 'En cours...', time: Date.now() };
      setTestResults(prev => [...prev, result2]);
      
      const diagnostic = await hybridDataManager.diagnose();
      result2.status = `✅ Cloud: ${diagnostic.cloud.available ? 'OK' : 'KO'}, Local: ${diagnostic.local.available ? 'OK' : 'KO'}`;
      result2.time = Date.now() - result2.time;
      setTestResults(prev => [...prev.slice(0, -1), result2]);
      
      // Test 3: Test de lecture patients (local)
      const result3 = { step: 'Lecture patients (local)', status: 'En cours...', time: Date.now() };
      setTestResults(prev => [...prev, result3]);
      
      try {
        const patients = await hybridDataManager.get('patients');
        result3.status = `✅ ${patients.length} patients trouvés`;
        result3.time = Date.now() - result3.time;
      } catch (error) {
        result3.status = `⚠️ ${(error as Error).message}`;
        result3.time = Date.now() - result3.time;
      }
      setTestResults(prev => [...prev.slice(0, -1), result3]);
      
      // Test 4: Test de lecture users (cloud)
      const result4 = { step: 'Lecture users (cloud)', status: 'En cours...', time: Date.now() };
      setTestResults(prev => [...prev, result4]);
      
      try {
        const users = await hybridDataManager.get('users');
        result4.status = `✅ ${users.length} utilisateurs trouvés`;
        result4.time = Date.now() - result4.time;
      } catch (error) {
        result4.status = `⚠️ ${(error as Error).message}`;
        result4.time = Date.now() - result4.time;
      }
      setTestResults(prev => [...prev.slice(0, -1), result4]);
      
      // Test 5: Statut de stockage
      const result5 = { step: 'Statut de stockage', status: 'En cours...', time: Date.now() };
      setTestResults(prev => [...prev, result5]);
      
      const storageStatus = await hybridDataManager.getStorageStatus();
      result5.status = `✅ Cloud: ${storageStatus.cloud}, Local: ${storageStatus.local.available}`;
      result5.time = Date.now() - result5.time;
      setTestResults(prev => [...prev.slice(0, -1), result5]);
      
      toast.success('Test de l\'architecture hybride terminé !');
      
    } catch (error) {
      console.error('Erreur lors du test hybride:', error);
      toast.error('Erreur lors du test de l\'architecture hybride');
      setTestResults(prev => [...prev, { 
        step: 'Erreur', 
        status: `❌ ${(error as Error).message}`, 
        time: 0 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return {
    isLoading,
    testResults,
    runHybridTest,
    clearResults,
  };
};