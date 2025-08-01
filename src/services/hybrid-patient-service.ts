import { Patient } from '@/types';
import { hybridDataManager } from './hybrid-data-adapter';
import { supabasePatientService } from './supabase-api/patient-service';

/**
 * Service hybride pour la gestion des patients
 * Utilise l'architecture hybride pour router automatiquement les requêtes
 * vers le bon système de stockage (cloud ou local)
 */
class HybridPatientService {
  private isHybridEnabled = false;

  /**
   * Active le mode hybride
   */
  async enableHybridMode(): Promise<void> {
    try {
      await hybridDataManager.initialize();
      this.isHybridEnabled = true;
      console.log('✅ Mode hybride activé pour les patients');
    } catch (error) {
      console.error('❌ Erreur lors de l\'activation du mode hybride:', error);
      throw error;
    }
  }

  /**
   * Vérifie si le mode hybride est disponible
   */
  async isHybridAvailable(): Promise<boolean> {
    try {
      const status = await hybridDataManager.getStorageStatus();
      return status.local.available;
    } catch {
      return false;
    }
  }

  /**
   * Récupère tous les patients
   */
  async getPatients(): Promise<Patient[]> {
    if (this.isHybridEnabled) {
      try {
        return await hybridDataManager.get<Patient>('patients');
      } catch (error) {
        console.warn('Fallback vers Supabase pour getPatients:', error);
        return await supabasePatientService.getPatients();
      }
    }
    
    return await supabasePatientService.getPatients();
  }

  /**
   * Récupère un patient par son ID
   */
  async getPatientById(id: number): Promise<Patient | null> {
    if (this.isHybridEnabled) {
      try {
        return await hybridDataManager.getById<Patient>('patients', id);
      } catch (error) {
        console.warn('Fallback vers Supabase pour getPatientById:', error);
        return await supabasePatientService.getPatientById(id);
      }
    }
    
    return await supabasePatientService.getPatientById(id);
  }

  /**
   * Crée un nouveau patient
   */
  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    if (this.isHybridEnabled) {
      try {
        // Créer d'abord dans le système hybride
        const hybridPatient = await hybridDataManager.create<Patient>('patients', patientData);
        
        // Optionnel : synchroniser avec le cloud en arrière-plan
        this.syncToCloudInBackground(hybridPatient);
        
        return hybridPatient;
      } catch (error) {
        console.warn('Fallback vers Supabase pour createPatient:', error);
        return await supabasePatientService.createPatient(patientData);
      }
    }
    
    return await supabasePatientService.createPatient(patientData);
  }

  /**
   * Met à jour un patient
   */
  async updatePatient(patient: Patient): Promise<Patient> {
    if (this.isHybridEnabled) {
      try {
        const { id, createdAt, updatedAt, ...updateData } = patient;
        const updatedPatient = await hybridDataManager.update<Patient>('patients', id, updateData);
        
        // Optionnel : synchroniser avec le cloud en arrière-plan
        this.syncToCloudInBackground(updatedPatient);
        
        return updatedPatient;
      } catch (error) {
        console.warn('Fallback vers Supabase pour updatePatient:', error);
        return await supabasePatientService.updatePatient(patient);
      }
    }
    
    return await supabasePatientService.updatePatient(patient);
  }

  /**
   * Supprime un patient
   */
  async deletePatient(id: number): Promise<{ error: any | null }> {
    if (this.isHybridEnabled) {
      try {
        const success = await hybridDataManager.delete('patients', id);
        
        if (success) {
          // Optionnel : synchroniser la suppression avec le cloud
          this.deleteSyncToCloudInBackground(id);
          return { error: null };
        } else {
          return { error: 'Échec de la suppression' };
        }
      } catch (error) {
        console.warn('Fallback vers Supabase pour deletePatient:', error);
        return await supabasePatientService.deletePatient(id);
      }
    }
    
    return await supabasePatientService.deletePatient(id);
  }

  /**
   * Migre les patients du cloud vers le local
   */
  async migrateFromCloud(): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
  }> {
    if (!this.isHybridEnabled) {
      throw new Error('Le mode hybride doit être activé avant la migration');
    }

    return await hybridDataManager.syncCloudToLocal('patients');
  }

  /**
   * Obtient des statistiques sur le stockage des patients
   */
  async getStorageStats(): Promise<{
    totalPatients: number;
    localPatients: number;
    cloudPatients: number;
    storageMode: 'hybrid' | 'cloud' | 'local';
  }> {
    let totalPatients = 0;
    let localPatients = 0;
    let cloudPatients = 0;

    try {
      // Compter les patients locaux
      if (this.isHybridEnabled) {
        const local = await hybridDataManager.get<Patient>('patients');
        localPatients = local.length;
      }
    } catch (error) {
      console.warn('Erreur lors du comptage des patients locaux:', error);
    }

    try {
      // Compter les patients cloud (fallback)
      const cloud = await supabasePatientService.getPatients();
      cloudPatients = cloud.length;
    } catch (error) {
      console.warn('Erreur lors du comptage des patients cloud:', error);
    }

    totalPatients = Math.max(localPatients, cloudPatients);

    return {
      totalPatients,
      localPatients,
      cloudPatients,
      storageMode: this.isHybridEnabled ? 'hybrid' : 'cloud'
    };
  }

  /**
   * Synchronise un patient avec le cloud en arrière-plan (optionnel)
   */
  private async syncToCloudInBackground(patient: Patient): Promise<void> {
    try {
      // Implémentation future : synchronisation sélective avec le cloud
      console.log('🔄 Synchronisation patient avec le cloud (arrière-plan):', patient.id);
    } catch (error) {
      console.warn('Erreur de synchronisation cloud:', error);
    }
  }

  /**
   * Synchronise la suppression avec le cloud en arrière-plan
   */
  private async deleteSyncToCloudInBackground(patientId: number): Promise<void> {
    try {
      // Implémentation future : synchronisation de suppression avec le cloud
      console.log('🗑️ Synchronisation suppression patient avec le cloud (arrière-plan):', patientId);
    } catch (error) {
      console.warn('Erreur de synchronisation suppression cloud:', error);
    }
  }

  /**
   * Bascule entre le mode hybride et le mode cloud
   */
  async toggleHybridMode(enabled: boolean): Promise<void> {
    if (enabled && !this.isHybridEnabled) {
      await this.enableHybridMode();
    } else if (!enabled && this.isHybridEnabled) {
      this.isHybridEnabled = false;
      console.log('📱 Basculement vers le mode cloud uniquement');
    }
  }

  /**
   * Obtient le statut du service hybride
   */
  getStatus(): {
    hybridEnabled: boolean;
    fallbackToCloud: boolean;
  } {
    return {
      hybridEnabled: this.isHybridEnabled,
      fallbackToCloud: true
    };
  }
}

// Instance singleton
export const hybridPatientService = new HybridPatientService();

// Export par défaut
export default hybridPatientService;