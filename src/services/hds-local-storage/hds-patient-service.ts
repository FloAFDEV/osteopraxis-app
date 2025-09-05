/**
 * 🏥 Service Patient HDS - Stockage local exclusif
 * 
 * EXCLUSIVEMENT pour le mode connecté
 * Gère les données patients selon les exigences HDS
 * 
 * ⚠️ NE PAS utiliser en mode démo - utilise le localStorage dédié
 */

import { Patient } from '@/types';
import { hdsLocalStorage, isConnectedMode } from './hds-storage-manager';
import { supabasePatientService } from '../supabase-api/patient-service';

interface HDSPatientService {
  getPatients(): Promise<Patient[]>;
  getPatientById(id: number): Promise<Patient | null>;
  createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  updatePatient(patient: Partial<Patient> & { id: number }): Promise<Patient>;
  deletePatient(id: number): Promise<boolean>;
}

class HDSPatientServiceImpl implements HDSPatientService {
  
  /**
   * Récupération des patients - Mode connecté uniquement
   */
  async getPatients(): Promise<Patient[]> {
    if (!isConnectedMode()) {
      throw new Error('Service HDS Patient non disponible en mode démo');
    }

    try {
      // D'abord essayer le stockage local HDS
      const localPatients = await hdsLocalStorage.getPatients();
      
      if (localPatients.length > 0) {
        console.log(`📖 ${localPatients.length} patients récupérés depuis le stockage HDS local`);
        return localPatients;
      }

      // Si pas de données locales, migrer depuis Supabase
      console.log('🔄 Migration initiale des patients depuis Supabase vers stockage HDS local');
      const supabasePatients = await supabasePatientService.getPatients();
      
      if (supabasePatients.length > 0) {
        await hdsLocalStorage.savePatients(supabasePatients);
        console.log(`✅ ${supabasePatients.length} patients migrés vers le stockage HDS local`);
      }

      return supabasePatients;
    } catch (error) {
      console.error('❌ Erreur récupération patients HDS:', error);
      // Fallback vers stockage local seul
      return await hdsLocalStorage.getPatients();
    }
  }

  /**
   * Récupération d'un patient par ID
   */
  async getPatientById(id: number): Promise<Patient | null> {
    if (!isConnectedMode()) {
      throw new Error('Service HDS Patient non disponible en mode démo');
    }

    try {
      // Vérifier d'abord le stockage local HDS
      const localPatient = await hdsLocalStorage.getPatientById(id);
      
      if (localPatient) {
        console.log(`📖 Patient ${id} trouvé dans le stockage HDS local`);
        return localPatient;
      }

      // Si pas trouvé localement, essayer Supabase et sauvegarder
      console.log(`🔍 Patient ${id} non trouvé localement, recherche dans Supabase...`);
      const supabasePatient = await supabasePatientService.getPatientById(id);
      
      if (supabasePatient) {
        await hdsLocalStorage.savePatient(supabasePatient);
        console.log(`✅ Patient ${id} récupéré de Supabase et sauvegardé localement`);
      }

      return supabasePatient;
    } catch (error) {
      console.error(`❌ Erreur récupération patient ${id}:`, error);
      return await hdsLocalStorage.getPatientById(id);
    }
  }

  /**
   * Création d'un nouveau patient
   */
  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    if (!isConnectedMode()) {
      throw new Error('Service HDS Patient non disponible en mode démo');
    }

    try {
      // 1. Créer en Supabase d'abord (pour obtenir l'ID et la synchronisation)
      console.log('🏗️ Création patient en Supabase...');
      const supabasePatient = await supabasePatientService.createPatient(patientData);
      
      // 2. Sauvegarder immédiatement dans le stockage local HDS
      console.log('💾 Sauvegarde patient dans le stockage HDS local...');
      const localPatient = await hdsLocalStorage.savePatient(supabasePatient);
      
      console.log('✅ Patient créé et sauvegardé dans le stockage HDS local:', localPatient.id);
      return localPatient;
    } catch (error) {
      console.error('❌ Erreur création patient HDS:', error);
      throw error;
    }
  }

  /**
   * Mise à jour d'un patient
   */
  async updatePatient(patientUpdate: Partial<Patient> & { id: number }): Promise<Patient> {
    if (!isConnectedMode()) {
      throw new Error('Service HDS Patient non disponible en mode démo');
    }

    const { id } = patientUpdate;

    try {
      // 1. Mettre à jour en Supabase
      console.log(`🔄 Mise à jour patient ${id} en Supabase...`);
      const supabasePatient = await supabasePatientService.updatePatient(patientUpdate as Patient);
      
      // 2. Mettre à jour dans le stockage local HDS
      console.log(`💾 Mise à jour patient ${id} dans le stockage HDS local...`);
      const localPatient = await hdsLocalStorage.savePatient(supabasePatient);
      
      console.log(`✅ Patient ${id} mis à jour dans le stockage HDS local`);
      return localPatient;
    } catch (error) {
      console.error(`❌ Erreur mise à jour patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Suppression d'un patient
   */
  async deletePatient(id: number): Promise<boolean> {
    if (!isConnectedMode()) {
      throw new Error('Service HDS Patient non disponible en mode démo');
    }

    try {
      // 1. Supprimer de Supabase
      console.log(`🗑️ Suppression patient ${id} de Supabase...`);
      const supabaseSuccess = await supabasePatientService.deletePatient(id);
      
      // 2. Supprimer du stockage local HDS
      console.log(`🗑️ Suppression patient ${id} du stockage HDS local...`);
      const localSuccess = await hdsLocalStorage.deletePatient(id);
      
      const success = supabaseSuccess && localSuccess;
      console.log(`${success ? '✅' : '❌'} Patient ${id} ${success ? 'supprimé' : 'erreur suppression'}`);
      return success;
    } catch (error) {
      console.error(`❌ Erreur suppression patient ${id}:`, error);
      return false;
    }
  }

  /**
   * Synchronisation des données entre Supabase et le stockage local
   */
  async syncWithSupabase(): Promise<{
    imported: number;
    exported: number;
    conflicts: number;
  }> {
    if (!isConnectedMode()) {
      throw new Error('Synchronisation HDS non disponible en mode démo');
    }

    const result = {
      imported: 0,
      exported: 0,
      conflicts: 0
    };

    try {
      console.log('🔄 Synchronisation patients HDS avec Supabase...');
      
      // Récupérer les données des deux sources
      const [supabasePatients, localPatients] = await Promise.all([
        supabasePatientService.getPatients(),
        hdsLocalStorage.getPatients()
      ]);

      // Détecter les patients à importer (nouveaux dans Supabase)
      const supabaseIds = new Set(supabasePatients.map(p => p.id));
      const localIds = new Set(localPatients.map(p => p.id));
      
      const toImport = supabasePatients.filter(p => !localIds.has(p.id));
      const toExport = localPatients.filter(p => !supabaseIds.has(p.id));

      // Importer les nouveaux patients
      for (const patient of toImport) {
        await hdsLocalStorage.savePatient(patient);
        result.imported++;
      }

      // Exporter les patients créés localement (rare)
      for (const patient of toExport) {
        try {
          await supabasePatientService.createPatient(patient);
          result.exported++;
        } catch (error) {
          console.warn(`Conflit exportation patient ${patient.id}:`, error);
          result.conflicts++;
        }
      }

      console.log(`✅ Synchronisation terminée: ${result.imported} importés, ${result.exported} exportés, ${result.conflicts} conflits`);
    } catch (error) {
      console.error('❌ Erreur synchronisation patients HDS:', error);
    }

    return result;
  }

  /**
   * Migration complète depuis Supabase
   */
  async migrateFromSupabase(): Promise<number> {
    if (!isConnectedMode()) {
      throw new Error('Migration HDS non disponible en mode démo');
    }

    try {
      console.log('🚀 Migration complète des patients depuis Supabase...');
      const supabasePatients = await supabasePatientService.getPatients();
      
      if (supabasePatients.length > 0) {
        await hdsLocalStorage.savePatients(supabasePatients);
        console.log(`✅ ${supabasePatients.length} patients migrés vers le stockage HDS local`);
      }

      return supabasePatients.length;
    } catch (error) {
      console.error('❌ Erreur migration patients HDS:', error);
      return 0;
    }
  }
}

// Instance singleton
export const hdsPatientService = new HDSPatientServiceImpl();

// Export du type pour l'utilisation
export type { HDSPatientService };