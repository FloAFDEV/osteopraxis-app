/**
 * 🔐 Service Patient HDS Sécurisé - STOCKAGE LOCAL EXCLUSIF
 * 
 * REMPLACE complètement l'ancien service qui utilisait Supabase
 * AUCUNE donnée HDS ne va vers Supabase - Conformité HDS stricte
 * 
 * Utilise un chiffrement AES-256-GCM + signature HMAC anti-falsification
 */

import { Patient } from '@/types';
import { hdsSecureManager, HDSSecureManager } from './hds-secure-manager';
import { isDemoSession } from '@/utils/demo-detection';

interface HDSSecurePatientService {
  getPatients(): Promise<Patient[]>;
  getPatientById(id: number): Promise<Patient | null>;
  createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  updatePatient(patient: Partial<Patient> & { id: number }): Promise<Patient>;
  deletePatient(id: number): Promise<boolean>;
}

class HDSSecurePatientServiceImpl implements HDSSecurePatientService {
  
  /**
   * Vérifier que nous ne sommes PAS en mode démo
   */
  private async ensureConnectedMode(): Promise<void> {
    const isDemoMode = await isDemoSession();
    if (isDemoMode) {
      throw new Error('🚨 VIOLATION SÉCURITÉ: Service HDS sécurisé appelé en mode démo. Utilisez demo-local-storage.');
    }
  }

  /**
   * Obtenir le stockage sécurisé pour les patients
   */
  private async getSecureStorage() {
    await this.ensureConnectedMode();
    
    const storage = hdsSecureManager.getSecureStorage('patients');
    if (!storage) {
      throw new Error('💾 Stockage HDS sécurisé non configuré. Veuillez configurer le stockage local.');
    }
    
    return storage;
  }

  /**
   * Générer un ID unique pour un nouveau patient
   */
  private generatePatientId(): number {
    return Math.floor(Math.random() * 2000000000) + 1;
  }

  /**
   * 📖 Récupération des patients - STOCKAGE LOCAL EXCLUSIF
   */
  async getPatients(): Promise<Patient[]> {
    try {
      const storage = await this.getSecureStorage();
      const patients = await storage.loadRecords<Patient>();
      
      console.log(`📖 ${patients.length} patients HDS récupérés depuis le stockage local sécurisé`);
      return patients;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Stockage HDS sécurisé non configuré')) {
        console.info('ℹ️ Stockage HDS non configuré - retour des données vides');
      } else {
        console.error('❌ Erreur récupération patients HDS sécurisés:', error);
      }
      throw error;
    }
  }

  /**
   * 🔍 Récupération d'un patient par ID - STOCKAGE LOCAL EXCLUSIF  
   */
  async getPatientById(id: number): Promise<Patient | null> {
    try {
      const storage = await this.getSecureStorage();
      const patient = await storage.getRecordById<Patient>(id);
      
      if (patient) {
        console.log(`📖 Patient ${id} trouvé dans le stockage HDS sécurisé`);
      }
      
      return patient;
    } catch (error) {
      console.error(`❌ Erreur récupération patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * 🏗️ Création d'un nouveau patient - STOCKAGE LOCAL EXCLUSIF
   * 🚨 JAMAIS de Supabase - Les données HDS restent sur l'ordinateur du praticien
   */
  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      await this.ensureConnectedMode();
      
      const storage = await this.getSecureStorage();
      
      // Créer le patient avec métadonnées
      const newPatient: Patient = {
        ...patientData,
        id: this.generatePatientId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔐 Création patient dans le stockage HDS sécurisé (LOCAL UNIQUEMENT)...');
      const savedPatient = await storage.saveRecord(newPatient);
      
      console.log('✅ Patient créé et sécurisé localement:', savedPatient.id);
      return savedPatient;
    } catch (error) {
      console.error('❌ Erreur création patient HDS sécurisé:', error);
      throw error;
    }
  }

  /**
   * 🔄 Mise à jour d'un patient - STOCKAGE LOCAL EXCLUSIF
   */
  async updatePatient(patientUpdate: Partial<Patient> & { id: number }): Promise<Patient> {
    try {
      const storage = await this.getSecureStorage();
      const { id } = patientUpdate;
      
      // Vérifier que le patient existe
      const existingPatient = await storage.getRecordById<Patient>(id);
      if (!existingPatient) {
        throw new Error(`Patient ${id} non trouvé dans le stockage HDS sécurisé`);
      }

      // Fusionner les modifications
      const updatedPatient: Patient = {
        ...existingPatient,
        ...patientUpdate,
        id, // S'assurer que l'ID ne change pas
        updatedAt: new Date().toISOString()
      };

      console.log(`🔐 Mise à jour patient ${id} dans le stockage HDS sécurisé...`);
      const savedPatient = await storage.saveRecord(updatedPatient);
      
      console.log(`✅ Patient ${id} mis à jour dans le stockage HDS sécurisé`);
      return savedPatient;
    } catch (error) {
      console.error(`❌ Erreur mise à jour patient ${patientUpdate.id}:`, error);
      throw error;
    }
  }

  /**
   * 🗑️ Suppression d'un patient - STOCKAGE LOCAL EXCLUSIF
   */
  async deletePatient(id: number): Promise<boolean> {
    try {
      const storage = await this.getSecureStorage();
      
      console.log(`🗑️ Suppression patient ${id} du stockage HDS sécurisé...`);
      const success = await storage.deleteRecord(id);
      
      console.log(`${success ? '✅' : '❌'} Patient ${id} ${success ? 'supprimé' : 'erreur suppression'}`);
      return success;
    } catch (error) {
      console.error(`❌ Erreur suppression patient ${id}:`, error);
      return false;
    }
  }

  /**
   * 🔍 Vérification de l'intégrité des données patients
   */
  async verifyIntegrity(): Promise<{
    valid: boolean;
    patientCount: number;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const storage = await this.getSecureStorage();
      const integrityResult = await storage.verifyIntegrity();
      
      return {
        valid: integrityResult.valid,
        patientCount: integrityResult.metadata?.recordCount || 0,
        errors: integrityResult.errors,
        warnings: integrityResult.warnings
      };
    } catch (error) {
      return {
        valid: false,
        patientCount: 0,
        errors: [`Erreur vérification intégrité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`],
        warnings: []
      };
    }
  }

  /**
   * 📦 Export sécurisé des patients
   */
  async exportPatients(): Promise<void> {
    try {
      const storage = await this.getSecureStorage();
      await storage.exportSecure();
      console.log('✅ Export sécurisé des patients réussi');
    } catch (error) {
      console.error('❌ Erreur export sécurisé patients:', error);
      throw error;
    }
  }

  /**
   * 📊 Statistiques du stockage patients sécurisé
   */
  async getStorageStats(): Promise<{
    count: number;
    size: number;
    lastModified: string;
    integrity: boolean;
  }> {
    try {
      const storage = await this.getSecureStorage();
      return await storage.getStats();
    } catch (error) {
      console.error('❌ Erreur stats stockage patients:', error);
      return { count: 0, size: 0, lastModified: '', integrity: false };
    }
  }

  /**
   * 🔄 Migration depuis l'ancien système IndexedDB
   */
  async migrateFromOldStorage(userId: string): Promise<number> {
    try {
      console.log('🔄 Migration patients depuis ancien stockage IndexedDB...');
      
      // Note: Migration depuis l'ancien système supprimée (fallbacks HDS supprimés)
      console.warn('⚠️ Migration depuis IndexedDB non disponible - fallbacks HDS supprimés pour sécurité');
      // Migration non disponible car anciens systèmes supprimés
      console.log('⚠️ Migration patients non disponible - fallbacks HDS supprimés pour sécurité');
      return 0;
    } catch (error) {
      console.error('❌ Erreur migration patients:', error);
      return 0;
    }
  }
}

// Instance singleton
export const hdsSecurePatientService = new HDSSecurePatientServiceImpl();

// Export du type pour l'utilisation
export type { HDSSecurePatientService };