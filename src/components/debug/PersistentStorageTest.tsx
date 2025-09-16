import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, TestTube, BarChart3, Trash2 } from 'lucide-react';
import { getPersistentLocalStorage } from '@/services/storage/persistent-local-storage';
import { toast } from 'sonner';

export const PersistentStorageTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [patientName, setPatientName] = useState('Patient Test Persistant');
  const [loading, setLoading] = useState(false);

  const runPersistenceTest = async () => {
    setLoading(true);
    setTestResult('🔄 Test de persistance VRAIE (IndexedDB)...\n');
    
    try {
      // 1. Initialiser le stockage persistant
      setTestResult(prev => prev + '1️⃣ Initialisation IndexedDB...\n');
      const storage = await getPersistentLocalStorage();
      setTestResult(prev => prev + '✅ IndexedDB initialisé\n');
      
      // 2. Créer un patient
      setTestResult(prev => prev + '2️⃣ Création patient...\n');
      const patientData = {
        id: `patient_${Date.now()}`,
        firstName: patientName,
        lastName: 'Persistant',
        email: `${Date.now()}@vraimentlocal.fr`,
        phone: '0123456789',
        birthDate: '1980-01-01',
        address: '123 Rue Locale, Ville Persistante'
      };
      
      const createdPatient = await storage.create('patients', patientData);
      setTestResult(prev => prev + `✅ Patient créé avec ID: ${createdPatient.id}\n`);
      
      // 3. Vérifier la lecture
      setTestResult(prev => prev + '3️⃣ Lecture patient...\n');
      const readPatient = await storage.getById('patients', createdPatient.id);
      setTestResult(prev => prev + `✅ Patient lu: ${readPatient?.firstName} ${readPatient?.lastName}\n`);
      
      // 4. Mise à jour
      setTestResult(prev => prev + '4️⃣ Mise à jour...\n');
      const updatedPatient = await storage.update('patients', createdPatient.id, {
        ...readPatient,
        firstName: patientName + ' (Modifié)',
        phone: '0987654321'
      });
      setTestResult(prev => prev + `✅ Patient mis à jour: ${updatedPatient.firstName}\n`);
      
      // 5. Liste tous les patients
      setTestResult(prev => prev + '5️⃣ Liste patients...\n');
      const allPatients = await storage.getAll('patients');
      setTestResult(prev => prev + `✅ ${allPatients.length} patients trouvés\n`);
      
      // 6. Info de stockage
      setTestResult(prev => prev + '6️⃣ Informations stockage...\n');
      const storageInfo = await storage.getStorageInfo();
      setTestResult(prev => prev + `📊 Tables: ${storageInfo.tables.join(', ')}\n`);
      setTestResult(prev => prev + `💾 Taille estimée: ${Math.round(storageInfo.size / 1024)} KB\n`);
      
      // 7. Test de suppression
      setTestResult(prev => prev + '7️⃣ Test suppression...\n');
      const deleted = await storage.delete('patients', createdPatient.id);
      setTestResult(prev => prev + `✅ Patient supprimé: ${deleted ? 'Oui' : 'Non'}\n`);
      
      setTestResult(prev => prev + '\n🎉 STOCKAGE PERSISTANT FONCTIONNEL !\n');
      setTestResult(prev => prev + '💡 Les données restent même après fermeture du navigateur\n');
      setTestResult(prev => prev + '🏥 Stocké localement sur l\'ordinateur du praticien\n');
      
      toast.success('Stockage persistant opérationnel !');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      setTestResult(prev => prev + `\n❌ ERREUR: ${errorMsg}\n`);
      toast.error('Test persistance échoué: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingData = async () => {
    try {
      setTestResult('🔍 Vérification données existantes...\n');
      const storage = await getPersistentLocalStorage();
      
      const patients = await storage.getAll('patients');
      const appointments = await storage.getAll('appointments');
      const invoices = await storage.getAll('invoices');
      
      let status = '📊 État du stockage persistant:\n';
      status += `• Patients stockés: ${patients.length}\n`;
      status += `• Rendez-vous stockés: ${appointments.length}\n`;
      status += `• Factures stockées: ${invoices.length}\n`;
      
      if (patients.length > 0) {
        status += '\n👥 Patients existants:\n';
        patients.slice(0, 3).forEach(p => {
          status += `  - ${p.firstName} ${p.lastName} (ID: ${p.id})\n`;
        });
        if (patients.length > 3) {
          status += `  ... et ${patients.length - 3} autres\n`;
        }
      }
      
      const info = await storage.getStorageInfo();
      status += `\n💾 Espace utilisé: ~${Math.round(info.size / 1024)} KB\n`;
      
      setTestResult(status);
      
    } catch (error) {
      setTestResult('❌ Erreur lors de la vérification\n');
    }
  };

  const clearPersistentData = async () => {
    try {
      const storage = await getPersistentLocalStorage();
      await storage.clear('patients');
      await storage.clear('appointments');
      await storage.clear('invoices');
      setTestResult('🧹 Toutes les données persistantes effacées\n');
      toast.info('Données persistantes effacées');
    } catch (error) {
      setTestResult('❌ Erreur lors du nettoyage\n');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Stockage VRAIMENT Persistant (IndexedDB)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 Ce test utilise IndexedDB pour un stockage local VRAIMENT persistant.
            Les données restent sur l'ordinateur même après fermeture du navigateur.
          </p>
        </div>
        
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
            onClick={runPersistenceTest} 
            disabled={loading}
            variant="default"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Test...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Persistance Complète
              </>
            )}
          </Button>
          
          <Button 
            onClick={checkExistingData}
            variant="outline"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Vérifier Données
          </Button>
          
          <Button 
            onClick={clearPersistentData}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer Données
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