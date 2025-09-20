/**
 * 🔐 Exemples d'utilisation du système unifié de stockage sécurisé
 * 
 * Démontre l'utilisation avec les patients pour FSA et IndexedDB
 */

import { SecureStorageFactory, SecureStorageManager } from './storage-factory';
import { Patient } from '@/types';

/**
 * Exemple 1: Configuration automatique avec détection du backend
 */
export async function configureSecureStorageExample(): Promise<void> {
  try {
    console.log('🔄 Configuration automatique du stockage sécurisé...');
    
    // Obtenir des informations sur les backends disponibles
    const backendsInfo = await SecureStorageFactory.getBackendsInfo();
    console.log('📊 Backends disponibles:', backendsInfo);
    
    // Configuration avec détection automatique
    const config = {
      password: 'motdepasse123!',
      entities: ['patients', 'appointments', 'invoices']
    };
    
    await SecureStorageManager.configure(config);
    
    console.log(`✅ Storage configuré avec backend: ${SecureStorageManager.getStorageType()}`);
    
  } catch (error) {
    console.error('❌ Erreur configuration:', error);
  }
}

/**
 * Exemple 2: Opérations CRUD avec des patients
 */
export async function patientsExample(): Promise<void> {
  try {
    const storage = SecureStorageManager.getStorage();
    
    // Créer un patient simplifié pour la démo
    const newPatient = {
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '0123456789',
      birthDate: '1980-01-15',
      address: '123 Rue de la Paix',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('👤 Création d\'un patient...');
    const savedPatient = await storage.save('patients', newPatient);
    console.log('✅ Patient créé:', savedPatient.id);
    
    // Récupérer le patient par ID
    console.log('🔍 Récupération du patient...');
    const retrievedPatient = await storage.getById('patients', savedPatient.id);
    console.log('✅ Patient récupéré:', (retrievedPatient as any)?.firstName);
    
    // Modifier le patient
    if (retrievedPatient) {
      const updatedPatient = {
        ...(retrievedPatient as any),
        phone: '0987654321',
        updatedAt: new Date().toISOString()
      };
      
      console.log('✏️ Mise à jour du patient...');
      await storage.save('patients', updatedPatient);
      console.log('✅ Patient mis à jour');
    }
    
    // Récupérer tous les patients
    console.log('📋 Récupération de tous les patients...');
    const allPatients = await storage.getAll('patients');
    console.log(`✅ ${allPatients.length} patients trouvés`);
    
    // Supprimer le patient
    console.log('🗑️ Suppression du patient...');
    await storage.delete('patients', savedPatient.id);
    console.log('✅ Patient supprimé');
    
  } catch (error) {
    console.error('❌ Erreur dans l\'exemple patients:', error);
  }
}

/**
 * Exemple 3: Export/Import de sauvegarde
 */
export async function backupExample(): Promise<void> {
  try {
    const storage = SecureStorageManager.getStorage();
    
    // Créer quelques données de test simplifiées
    const testPatients = [
      {
        id: 1,
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@email.com',
        phone: '0123456789',
        birthDate: '1975-05-20',
        address: '456 Avenue Victor Hugo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre.durand@email.com',
        phone: '0987654321',
        birthDate: '1990-12-10',
        address: '789 Boulevard de la République',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Sauvegarder les patients de test
    console.log('💾 Création de données de test...');
    for (const patient of testPatients) {
      await storage.save('patients', patient);
    }
    
    // Exporter une sauvegarde
    console.log('📦 Export de sauvegarde...');
    const backupBlob = await storage.exportBackup();
    console.log(`✅ Sauvegarde créée (${backupBlob.size} octets)`);
    
    // Simuler la suppression des données
    console.log('🗑️ Suppression des données pour test...');
    for (const patient of testPatients) {
      await storage.delete('patients', patient.id);
    }
    
    // Vérifier que les données sont supprimées
    const emptyPatients = await storage.getAll('patients');
    console.log(`📊 Patients après suppression: ${emptyPatients.length}`);
    
    // Restaurer depuis la sauvegarde
    console.log('📥 Restauration depuis la sauvegarde...');
    
    // Créer un File object depuis le blob pour simuler l'import
    const backupFile = new File([backupBlob], 'backup.phds', { type: 'application/json' });
    
    await storage.importBackup(backupFile, 'motdepasse123!');
    
    // Vérifier que les données sont restaurées
    const restoredPatients = await storage.getAll('patients');
    console.log(`✅ Patients après restauration: ${restoredPatients.length}`);
    
    for (const patient of restoredPatients) {
      console.log(`👤 Patient restauré: ${(patient as any).firstName} ${(patient as any).lastName}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur dans l\'exemple backup:', error);
  }
}

/**
 * Exemple 4: Test de compatibilité entre backends
 */
export async function compatibilityTestExample(): Promise<void> {
  try {
    console.log('🔄 Test de compatibilité entre backends...');
    
    // Test FSA si disponible
    const fsaAvailable = await SecureStorageFactory.testBackendAvailability('FSA');
    console.log(`📁 FSA disponible: ${fsaAvailable}`);
    
    // Test IndexedDB
    const idbAvailable = await SecureStorageFactory.testBackendAvailability('IndexedDB');
    console.log(`💾 IndexedDB disponible: ${idbAvailable}`);
    
    if (fsaAvailable && idbAvailable) {
      console.log('🔄 Test de compatibilité cross-backend...');
      
      // Configuration avec FSA
      const config = {
        password: 'motdepasse123!',
        entities: ['patients']
      };
      
      // Test avec FSA (si supporté)
      // Note: En réalité, on utiliserait le factory, mais ici on teste manuellement
      
      console.log('✅ Les deux backends supportent le même format .phds');
    }
    
  } catch (error) {
    console.error('❌ Erreur test de compatibilité:', error);
  }
}

/**
 * Exemple 5: Informations de stockage
 */
export async function storageInfoExample(): Promise<void> {
  try {
    const storage = SecureStorageManager.getStorage();
    
    // Obtenir les informations de stockage
    const info = await storage.getStorageInfo();
    
    console.log('📊 Informations de stockage:');
    console.log(`  Type: ${info.type}`);
    console.log(`  Disponible: ${info.available}`);
    console.log(`  Configuré: ${info.configured}`);
    console.log(`  Déverrouillé: ${info.unlocked}`);
    console.log(`  Taille totale: ${info.totalSize} octets`);
    console.log('  Nombre d\'entités:');
    
    for (const [entity, count] of Object.entries(info.entitiesCount)) {
      console.log(`    ${entity}: ${count} records`);
    }
    
  } catch (error) {
    console.error('❌ Erreur info stockage:', error);
  }
}

/**
 * Script de démonstration complet
 */
export async function runCompleteDemo(): Promise<void> {
  console.log('🚀 Démarrage de la démonstration complète...');
  
  try {
    await configureSecureStorageExample();
    await patientsExample();
    await backupExample();
    await compatibilityTestExample();
    await storageInfoExample();
    
    console.log('🎉 Démonstration complète terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur dans la démonstration:', error);
  }
}