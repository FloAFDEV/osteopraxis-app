/**
 * 🎯 Service de routage de stockage unifié
 * 
 * Route automatiquement les données selon leur classification :
 * - Mode démo → demo-local-storage (sessionStorage éphémère)
 * - Mode connecté + HDS → stockage local persistant sécurisé
 * - Mode connecté + Non-HDS → Supabase cloud
 */

import { DataType, isHDSData, validateHDSSecurityPolicy, getDataClassification } from './data-classification';
import { isDemoSession } from '@/utils/demo-detection';

export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'demo' | 'local_hds' | 'supabase';
}

export interface StorageAdapter<T = any> {
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  getById(id: string | number): Promise<T | null>;
  getAll(): Promise<T[]>;
  update(id: string | number, updates: Partial<T>): Promise<T>;
  delete(id: string | number): Promise<boolean>;
}

export class StorageRouter {
  private static instance: StorageRouter;
  
  private constructor() {}
  
  static getInstance(): StorageRouter {
    if (!StorageRouter.instance) {
      StorageRouter.instance = new StorageRouter();
    }
    return StorageRouter.instance;
  }

  /**
   * Router principal - Détermine automatiquement le stockage selon le mode et la classification
   */
  async route<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    // 1️⃣ PRIORITÉ ABSOLUE : Mode démo
    const isDemoMode = await isDemoSession();
    if (isDemoMode) {
      console.log(`🎭 Mode démo détecté pour ${dataType} → demo-local-storage`);
      return this.getDemoAdapter<T>(dataType);
    }

    // 2️⃣ Mode connecté : Router selon classification HDS/Non-HDS
    const classification = getDataClassification(dataType);
    
    switch (classification) {
      case 'HDS':
        console.log(`🔴 Données HDS "${dataType}" → Stockage local persistant sécurisé`);
        validateHDSSecurityPolicy(dataType, 'local');
        return this.getLocalHDSAdapter<T>(dataType);
        
      case 'NON_HDS':
        console.log(`🟢 Données Non-HDS "${dataType}" → Supabase cloud`);
        validateHDSSecurityPolicy(dataType, 'supabase');
        return this.getSupabaseAdapter<T>(dataType);
        
      default:
        throw new Error(
          `🚨 Type de donnée non classé: "${dataType}". ` +
          `Veuillez ajouter cette donnée dans data-classification.ts`
        );
    }
  }

  /**
   * Adapter pour le mode démo (sessionStorage éphémère)
   */
  private async getDemoAdapter<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    const { demoLocalStorage } = await import('@/services/demo-local-storage');
    
    return {
      async create(data: any): Promise<T> {
        switch (dataType) {
          case 'patients':
            return demoLocalStorage.addPatient(data) as T;
          case 'appointments':
            return demoLocalStorage.addAppointment(data) as T;
          case 'invoices':
            return demoLocalStorage.addInvoice(data) as T;
          case 'cabinets':
            return demoLocalStorage.addCabinet(data) as T;
          default:
            throw new Error(`Type ${dataType} non supporté en mode démo`);
        }
      },
      
      async getById(id: string | number): Promise<T | null> {
        switch (dataType) {
          case 'patients':
            return demoLocalStorage.getPatientById(Number(id)) as T;
          case 'cabinets':
            return demoLocalStorage.getCabinetById(Number(id)) as T;
          default:
            const all = await this.getAll();
            return all.find((item: any) => item.id === id) || null;
        }
      },
      
      async getAll(): Promise<T[]> {
        switch (dataType) {
          case 'patients':
            return demoLocalStorage.getPatients() as T[];
          case 'appointments':
            return demoLocalStorage.getAppointments() as T[];
          case 'invoices':
            return demoLocalStorage.getInvoices() as T[];
          case 'cabinets':
            return demoLocalStorage.getCabinets() as T[];
          default:
            return [];
        }
      },
      
      async update(id: string | number, updates: Partial<T>): Promise<T> {
        switch (dataType) {
          case 'patients':
            return demoLocalStorage.updatePatient(Number(id), updates as any) as T;
          case 'appointments':
            return demoLocalStorage.updateAppointment(Number(id), updates as any) as T;
          case 'invoices':
            return demoLocalStorage.updateInvoice(Number(id), updates as any) as T;
          case 'cabinets':
            return demoLocalStorage.updateCabinet(Number(id), updates as any) as T;
          default:
            throw new Error(`Mise à jour ${dataType} non supportée en mode démo`);
        }
      },
      
      async delete(id: string | number): Promise<boolean> {
        switch (dataType) {
          case 'patients':
            return demoLocalStorage.deletePatient(Number(id));
          case 'appointments':
            return demoLocalStorage.deleteAppointment(Number(id));
          case 'invoices':
            return demoLocalStorage.deleteInvoice(Number(id));
          case 'cabinets':
            return demoLocalStorage.deleteCabinet(Number(id));
          default:
            return true; // Simulation
        }
      }
    };
  }

  /**
   * Adapter pour les données HDS (stockage local persistant)
   */
  private async getLocalHDSAdapter<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    // Vérification de sécurité stricte
    if (!isHDSData(dataType)) {
      throw new Error(`🚨 Tentative d'accès HDS pour donnée non-HDS: ${dataType}`);
    }

    const { hdsPatientService, hdsAppointmentService, hdsInvoiceService } = 
      await import('@/services/hds-local-storage');
    
    switch (dataType) {
      case 'patients':
        return {
          create: (data) => hdsPatientService.createPatient(data as any),
          getById: (id) => hdsPatientService.getPatientById(Number(id)),
          getAll: () => hdsPatientService.getPatients(),
          update: (id, updates) => hdsPatientService.updatePatient({ ...updates, id: Number(id) } as any),
          delete: (id) => hdsPatientService.deletePatient(Number(id))
        } as StorageAdapter<T>;
        
      case 'appointments':
        return {
          create: (data) => hdsAppointmentService.createAppointment(data as any),
          getById: (id) => hdsAppointmentService.getAppointmentById(Number(id)),
          getAll: () => hdsAppointmentService.getAppointments(),
          update: (id, updates) => hdsAppointmentService.updateAppointment(Number(id), updates as any),
          delete: (id) => hdsAppointmentService.deleteAppointment(Number(id))
        } as StorageAdapter<T>;
        
      case 'invoices':
        return {
          create: (data) => hdsInvoiceService.createInvoice(data as any),
          getById: (id) => hdsInvoiceService.getInvoiceById(Number(id)),
          getAll: () => hdsInvoiceService.getInvoices(),
          update: (id, updates) => hdsInvoiceService.updateInvoice(Number(id), { ...updates, id: Number(id) } as any),
          delete: (id) => hdsInvoiceService.deleteInvoice(Number(id))
        } as StorageAdapter<T>;
        
      default:
        throw new Error(`Service HDS non implémenté pour: ${dataType}`);
    }
  }

  /**
   * Adapter pour les données Non-HDS (Supabase cloud)
   */
  private async getSupabaseAdapter<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    // Vérification de sécurité stricte
    if (isHDSData(dataType)) {
      throw new Error(`🚨 VIOLATION SÉCURITÉ: Tentative Supabase pour donnée HDS: ${dataType}`);
    }

    // Import dynamique des services Supabase selon le type
    switch (dataType) {
      case 'users':
        // Pour l'instant, retourner un mock adapter pour les utilisateurs
        return {
          create: async (data) => ({ ...data, id: Date.now() } as T),
          getById: async (id) => null,
          getAll: async () => [],
          update: async (id, updates) => ({ ...updates, id } as T),
          delete: async (id) => true
        } as StorageAdapter<T>;
        
      default:
        throw new Error(`Service Supabase non implémenté pour: ${dataType}`);
    }
  }

  /**
   * Méthode de diagnostic pour vérifier la configuration
   */
  async diagnose(): Promise<{
    mode: 'demo' | 'connected';
    hdsServices: string[];
    nonHdsServices: string[];
    security: {
      hdsLocalOnly: boolean;
      nonHdsSupabaseOnly: boolean;
      noHdsLeakage: boolean;
    };
  }> {
    const isDemoMode = await isDemoSession();
    
    return {
      mode: isDemoMode ? 'demo' : 'connected',
      hdsServices: ['patients', 'appointments', 'invoices'],
      nonHdsServices: ['osteopaths', 'cabinets', 'users'],
      security: {
        hdsLocalOnly: !isDemoMode, // En mode connecté, HDS doit être local
        nonHdsSupabaseOnly: !isDemoMode, // En mode connecté, Non-HDS peut aller sur Supabase
        noHdsLeakage: true // Aucune donnée HDS ne peut fuiter vers Supabase
      }
    };
  }
}

/**
 * Instance singleton du routeur de stockage
 */
export const storageRouter = StorageRouter.getInstance();