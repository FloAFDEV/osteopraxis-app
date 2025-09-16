import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, TestTube, BarChart3, Trash2 } from 'lucide-react';
import { isUsingMemoryFallback, clearMemoryStorage } from '@/services/hybrid-data-adapter/local-adapters';
import { getOPFSSQLiteService } from '@/services/sqlite/opfs-sqlite-service';
import { toast } from 'sonner';

export const LocalStorageTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [patientName, setPatientName] = useState('Patient Test');
  const [loading, setLoading] = useState(false);

  const runCompleteTest = async () => {
    setLoading(true);
    setTestResult('Démarrage du test complet...\n');
    
    try {
      // 1. Test du service OPFS/SQLite
      setTestResult(prev => prev + '1️⃣ Test du service SQLite...\n');
      const service = await getOPFSSQLiteService();
      setTestResult(prev => prev + `Service SQLite obtenu\n`);
      
      // 2. Test de création d'un patient
      setTestResult(prev => prev + '2️⃣ Test création patient...\n');
      const createResult = await service.run(
        'INSERT INTO patients (firstName, lastName, email) VALUES (?, ?, ?)',
        [patientName, 'Test', `${Date.now()}@test.local`]
      );
      setTestResult(prev => prev + `✅ Patient créé avec ID: ${createResult.lastID}\n`);
      
      // 3. Test de lecture
      setTestResult(prev => prev + '3️⃣ Test lecture patients...\n');
      const patients = service.query('SELECT * FROM patients');
      setTestResult(prev => prev + `✅ ${patients.length} patients trouvés\n`);
      
      // 4. Test de mise à jour
      if (createResult.lastID > 0) {
        setTestResult(prev => prev + '4️⃣ Test mise à jour...\n');
        const updateResult = await service.run(
          'UPDATE patients SET firstName = ? WHERE id = ?',
          [`${patientName} (Modifié)`, createResult.lastID]
        );
        setTestResult(prev => prev + `✅ Patient mis à jour (${updateResult.changes} modifications)\n`);
      }
      
      // 5. Test de suppression
      if (createResult.lastID > 0) {
        setTestResult(prev => prev + '5️⃣ Test suppression...\n');
        const deleteResult = await service.run(
          'DELETE FROM patients WHERE id = ?',
          [createResult.lastID]
        );
        setTestResult(prev => prev + `✅ Patient supprimé (${deleteResult.changes} suppressions)\n`);
      }
      
      // 6. Vérifier le mode de fallback
      setTestResult(prev => prev + '6️⃣ Vérification mode stockage...\n');
      const isInFallback = isUsingMemoryFallback();
      setTestResult(prev => prev + `📊 Mode fallback localStorage: ${isInFallback ? 'OUI' : 'NON'}\n`);
      
      // 7. Stats finales
      const stats = service.getStats();
      setTestResult(prev => prev + `📈 Statistiques: ${stats.tables.length} tables, taille: ${stats.size} bytes\n`);
      
      setTestResult(prev => prev + '\n✅ TEST COMPLET RÉUSSI !\n');
      toast.success('Test complet réussi !');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      setTestResult(prev => prev + `\n❌ ERREUR: ${errorMsg}\n`);
      toast.error('Test échoué: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    clearMemoryStorage();
    // Note: sqlite-fallback supprimés pour sécurité HDS
    setTestResult('🧹 Stockage local vidé\n');
    toast.info('Stockage local vidé');
  };

  const checkStorageStatus = () => {
    const isInFallback = isUsingMemoryFallback();
    
    let status = 'État du stockage local:\n';
    status += `• Mode fallback HDS: ${isInFallback ? 'OUI (DÉPRÉCIÉ)' : 'NON'}\n`;
    status += `• Note: Fallbacks localStorage HDS supprimés pour sécurité\n`;
    status += `• Stockage HDS sécurisé requis en mode connecté\n`;
    
    setTestResult(status);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Stockage Local Complet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nom du patient test"
            className="flex-1"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runCompleteTest} 
            disabled={loading}
            variant="default"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test CRUD Complet
              </>
            )}
          </Button>
          
          <Button 
            onClick={checkStorageStatus}
            variant="outline"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            État Stockage
          </Button>
          
          <Button 
            onClick={clearStorage}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Vider Stockage
          </Button>
        </div>
        
        {testResult && (
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {testResult}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};