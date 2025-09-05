/**
 * 🏥 Gestionnaire de stockage local pour données HDS
 * 
 * EXCLUSIVEMENT pour le mode connecté - conformité HDS
 * Stockage persistant local sur la machine de l'utilisateur
 * 
 * ⚠️ SÉPARÉ du mode démo qui utilise localStorage temporaire
 */

import { Patient, Appointment, Invoice } from '@/types';

// Types pour le stockage HDS local
interface HDSStorageMetadata {
  userId: string;
  osteopathId: number;
  encryptionKeyVersion: number;
  lastBackup: string;
  dataVersion: string;
}

interface HDSDataContainer<T> {
  data: T[];
  metadata: HDSStorageMetadata;
  checksum: string;
  lastModified: string;
}

class HDSLocalStorageManager {
  private readonly DB_NAME = 'PatientHubHDS';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;
  private currentUserId: string | null = null;

  /**
   * Initialise la base de données IndexedDB pour le stockage HDS local
   */
  async initialize(userId: string, osteopathId: number): Promise<void> {
    if (this.db && this.currentUserId === userId) {
      return; // Déjà initialisé pour cet utilisateur
    }

    console.log('🏥 Initialisation stockage HDS local pour utilisateur:', userId);
    this.currentUserId = userId;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(`${this.DB_NAME}_${userId}`, this.DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erreur ouverture IndexedDB HDS:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Base de données HDS locale initialisée');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les patients HDS
        if (!db.objectStoreNames.contains('patients_hds')) {
          const patientsStore = db.createObjectStore('patients_hds', { keyPath: 'id' });
          patientsStore.createIndex('osteopathId', 'osteopathId', { unique: false });
          patientsStore.createIndex('lastModified', 'lastModified', { unique: false });
        }

        // Store pour les rendez-vous HDS
        if (!db.objectStoreNames.contains('appointments_hds')) {
          const appointmentsStore = db.createObjectStore('appointments_hds', { keyPath: 'id' });
          appointmentsStore.createIndex('patientId', 'patientId', { unique: false });
          appointmentsStore.createIndex('osteopathId', 'osteopathId', { unique: false });
          appointmentsStore.createIndex('date', 'date', { unique: false });
        }

        // Store pour les factures HDS
        if (!db.objectStoreNames.contains('invoices_hds')) {
          const invoicesStore = db.createObjectStore('invoices_hds', { keyPath: 'id' });
          invoicesStore.createIndex('patientId', 'patientId', { unique: false });
          invoicesStore.createIndex('osteopathId', 'osteopathId', { unique: false });
          invoicesStore.createIndex('date', 'date', { unique: false });
        }

        // Store pour les métadonnées
        if (!db.objectStoreNames.contains('metadata_hds')) {
          db.createObjectStore('metadata_hds', { keyPath: 'key' });
        }

        console.log('🏗️ Schéma IndexedDB HDS créé');
      };
    });
  }

  /**
   * Sauvegarde des patients HDS en local
   */
  async savePatients(patients: Patient[]): Promise<void> {
    if (!this.db) throw new Error('Base de données HDS non initialisée');

    const transaction = this.db.transaction(['patients_hds'], 'readwrite');
    const store = transaction.objectStore('patients_hds');

    // Effacer les données existantes
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Sauvegarder les nouveaux patients
    for (const patient of patients) {
      const patientWithTimestamp = {
        ...patient,
        lastModified: new Date().toISOString(),
        hdsSource: 'local'
      };

      await new Promise<void>((resolve, reject) => {
        const addRequest = store.add(patientWithTimestamp);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }

    console.log(`💾 ${patients.length} patients HDS sauvegardés en local`);
  }

  /**
   * Récupération des patients HDS depuis le stockage local
   */
  async getPatients(): Promise<Patient[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients_hds'], 'readonly');
      const store = transaction.objectStore('patients_hds');
      const request = store.getAll();

      request.onsuccess = () => {
        const patients = request.result || [];
        console.log(`📖 ${patients.length} patients HDS récupérés depuis le stockage local`);
        resolve(patients);
      };

      request.onerror = () => {
        console.error('❌ Erreur lecture patients HDS:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Sauvegarde d'un patient HDS individuel
   */
  async savePatient(patient: Patient): Promise<Patient> {
    if (!this.db) throw new Error('Base de données HDS non initialisée');

    const patientWithTimestamp = {
      ...patient,
      lastModified: new Date().toISOString(),
      hdsSource: 'local'
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients_hds'], 'readwrite');
      const store = transaction.objectStore('patients_hds');
      const request = store.put(patientWithTimestamp);

      request.onsuccess = () => {
        console.log('💾 Patient HDS sauvegardé:', patient.id);
        resolve(patientWithTimestamp);
      };

      request.onerror = () => {
        console.error('❌ Erreur sauvegarde patient HDS:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Récupération d'un patient HDS par ID
   */
  async getPatientById(id: number): Promise<Patient | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients_hds'], 'readonly');
      const store = transaction.objectStore('patients_hds');
      const request = store.get(id);

      request.onsuccess = () => {
        const patient = request.result || null;
        if (patient) {
          console.log('📖 Patient HDS trouvé:', id);
        }
        resolve(patient);
      };

      request.onerror = () => {
        console.error('❌ Erreur lecture patient HDS:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Suppression d'un patient HDS
   */
  async deletePatient(id: number): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patients_hds'], 'readwrite');
      const store = transaction.objectStore('patients_hds');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('🗑️ Patient HDS supprimé:', id);
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ Erreur suppression patient HDS:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Sauvegarde des rendez-vous HDS
   */
  async saveAppointments(appointments: Appointment[]): Promise<void> {
    if (!this.db) throw new Error('Base de données HDS non initialisée');

    const transaction = this.db.transaction(['appointments_hds'], 'readwrite');
    const store = transaction.objectStore('appointments_hds');

    // Effacer les données existantes
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Sauvegarder les nouveaux rendez-vous
    for (const appointment of appointments) {
      const appointmentWithTimestamp = {
        ...appointment,
        lastModified: new Date().toISOString(),
        hdsSource: 'local'
      };

      await new Promise<void>((resolve, reject) => {
        const addRequest = store.add(appointmentWithTimestamp);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }

    console.log(`💾 ${appointments.length} rendez-vous HDS sauvegardés en local`);
  }

  /**
   * Récupération des rendez-vous HDS
   */
  async getAppointments(): Promise<Appointment[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['appointments_hds'], 'readonly');
      const store = transaction.objectStore('appointments_hds');
      const request = store.getAll();

      request.onsuccess = () => {
        const appointments = request.result || [];
        console.log(`📖 ${appointments.length} rendez-vous HDS récupérés depuis le stockage local`);
        resolve(appointments);
      };

      request.onerror = () => {
        console.error('❌ Erreur lecture rendez-vous HDS:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Sauvegarde des factures HDS
   */
  async saveInvoices(invoices: Invoice[]): Promise<void> {
    if (!this.db) throw new Error('Base de données HDS non initialisée');

    const transaction = this.db.transaction(['invoices_hds'], 'readwrite');
    const store = transaction.objectStore('invoices_hds');

    // Effacer les données existantes
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Sauvegarder les nouvelles factures
    for (const invoice of invoices) {
      const invoiceWithTimestamp = {
        ...invoice,
        lastModified: new Date().toISOString(),
        hdsSource: 'local'
      };

      await new Promise<void>((resolve, reject) => {
        const addRequest = store.add(invoiceWithTimestamp);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }

    console.log(`💾 ${invoices.length} factures HDS sauvegardées en local`);
  }

  /**
   * Récupération des factures HDS
   */
  async getInvoices(): Promise<Invoice[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['invoices_hds'], 'readonly');
      const store = transaction.objectStore('invoices_hds');
      const request = store.getAll();

      request.onsuccess = () => {
        const invoices = request.result || [];
        console.log(`📖 ${invoices.length} factures HDS récupérées depuis le stockage local`);
        resolve(invoices);
      };

      request.onerror = () => {
        console.error('❌ Erreur lecture factures HDS:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Sauvegarde des métadonnées HDS
   */
  async saveMetadata(metadata: HDSStorageMetadata): Promise<void> {
    if (!this.db) throw new Error('Base de données HDS non initialisée');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['metadata_hds'], 'readwrite');
      const store = transaction.objectStore('metadata_hds');
      const request = store.put({
        key: 'main',
        ...metadata,
        lastUpdated: new Date().toISOString()
      });

      request.onsuccess = () => {
        console.log('💾 Métadonnées HDS sauvegardées');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erreur sauvegarde métadonnées HDS:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Nettoyage complet des données HDS (déconnexion)
   */
  async clearAllData(): Promise<void> {
    if (!this.db) return;

    const stores = ['patients_hds', 'appointments_hds', 'invoices_hds', 'metadata_hds'];
    
    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await new Promise<void>((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });
    }

    console.log('🧹 Données HDS locales nettoyées');
  }

  /**
   * Vérification de l'intégrité des données HDS
   */
  async verifyDataIntegrity(): Promise<{
    patients: { count: number; valid: boolean };
    appointments: { count: number; valid: boolean };
    invoices: { count: number; valid: boolean };
  }> {
    const result = {
      patients: { count: 0, valid: false },
      appointments: { count: 0, valid: false },
      invoices: { count: 0, valid: false }
    };

    try {
      const patients = await this.getPatients();
      result.patients.count = patients.length;
      result.patients.valid = patients.every(p => p.id && p.firstName && p.lastName);

      const appointments = await this.getAppointments();
      result.appointments.count = appointments.length;
      result.appointments.valid = appointments.every(a => a.id && a.patientId && a.date);

      const invoices = await this.getInvoices();
      result.invoices.count = invoices.length;
      result.invoices.valid = invoices.every(i => i.id && i.patientId && i.amount !== undefined);

      console.log('🔍 Vérification intégrité HDS:', result);
    } catch (error) {
      console.error('❌ Erreur vérification intégrité HDS:', error);
    }

    return result;
  }
}

// Instance singleton
export const hdsLocalStorage = new HDSLocalStorageManager();

// Utilitaires de détection
export function isConnectedMode(): boolean {
  // Vérifier si on est en mode connecté (pas démo)
  const isDemo = localStorage.getItem('isTemporaryDemo') === 'true' || 
                 sessionStorage.getItem('isDemoMode') === 'true';
  return !isDemo;
}

export async function initializeHDSStorage(): Promise<void> {
  if (!isConnectedMode()) {
    console.log('🎭 Mode démo détecté - Pas d\'initialisation HDS locale');
    return;
  }

  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user && !session.user.email?.startsWith('demo-')) {
      const userId = session.user.id;
      const osteopathId = 1; // TODO: Récupérer l'ID réel de l'ostéopathe
      
      await hdsLocalStorage.initialize(userId, osteopathId);
      console.log('✅ Stockage HDS local initialisé pour utilisateur connecté');
    }
  } catch (error) {
    console.error('❌ Erreur initialisation stockage HDS:', error);
  }
}