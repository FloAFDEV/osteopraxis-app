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

    // 2️⃣ PRIORITÉ : Environnement iframe (preview) - pour TOUTES les données
    const isIframeEnvironment = window.self !== window.top;
    if (isIframeEnvironment) {
      console.warn(`🔍 Mode Preview détecté pour "${dataType}" → Adapter iframe`);
      return this.getIframeFallbackAdapter<T>(dataType);
    }
    
    // 3️⃣ Mode connecté normal : Router selon classification HDS/Non-HDS
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
   * Adapter pour les données HDS (stockage local sécurisé exclusivement)
   * 🚨 JAMAIS de Supabase pour les données HDS - Violation de sécurité
   */
  private async getLocalHDSAdapter<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    // Vérification de sécurité stricte
    if (!isHDSData(dataType)) {
      throw new Error(`🚨 Tentative d'accès HDS pour donnée non-HDS: ${dataType}`);
    }

    // NOUVEAU: Utiliser les services HDS sécurisés (stockage local EXCLUSIF)
    const { hdsSecurePatientService, hdsSecureAppointmentService, hdsSecureInvoiceService } = 
      await import('@/services/hds-secure-storage');
    
    switch (dataType) {
      case 'patients':
        return {
          create: (data) => hdsSecurePatientService.createPatient(data as any),
          getById: (id) => hdsSecurePatientService.getPatientById(Number(id)),
          getAll: () => hdsSecurePatientService.getPatients(),
          update: (id, updates) => hdsSecurePatientService.updatePatient({ ...updates, id: Number(id) } as any),
          delete: (id) => hdsSecurePatientService.deletePatient(Number(id))
        } as StorageAdapter<T>;
        
      case 'appointments':
        return {
          create: (data) => hdsSecureAppointmentService.createAppointment(data as any),
          getById: (id) => hdsSecureAppointmentService.getAppointmentById(Number(id)),
          getAll: () => hdsSecureAppointmentService.getAppointments(),
          update: (id, updates) => hdsSecureAppointmentService.updateAppointment(Number(id), updates as any),
          delete: (id) => hdsSecureAppointmentService.deleteAppointment(Number(id))
        } as StorageAdapter<T>;
        
      case 'invoices':
        return {
          create: (data) => hdsSecureInvoiceService.createInvoice(data as any),
          getById: (id) => hdsSecureInvoiceService.getInvoiceById(Number(id)),
          getAll: () => hdsSecureInvoiceService.getInvoices(),
          update: (id, updates) => hdsSecureInvoiceService.updateInvoice(Number(id), { ...updates, id: Number(id) } as any),
          delete: (id) => hdsSecureInvoiceService.deleteInvoice(Number(id))
        } as StorageAdapter<T>;
        
      default:
        throw new Error(`Service HDS sécurisé non implémenté pour: ${dataType}`);
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
      case 'cabinets':
        const cabinetMethods = await import('@/services/supabase-api/cabinet');
        return {
          create: (data) => cabinetMethods.createCabinet(data as any) as unknown as Promise<T>,
          getById: (id) => cabinetMethods.getCabinetById(Number(id)) as unknown as Promise<T | null>,
          getAll: () => cabinetMethods.getCabinets() as unknown as Promise<T[]>,
          update: (id, updates) => cabinetMethods.updateCabinet(Number(id), updates as any) as unknown as Promise<T>,
          delete: (id) => cabinetMethods.deleteCabinet(Number(id)).then(() => true)
        } as StorageAdapter<T>;
        
      case 'osteopaths':
        // Utiliser les services existants qui fonctionnent
        const { osteopathService } = await import('@/services/api/osteopath-service');
        return {
          create: (data) => osteopathService.createOsteopath(data as any) as unknown as Promise<T>,
          getById: (id) => osteopathService.getOsteopathById(Number(id)) as unknown as Promise<T | null>,
          getAll: () => osteopathService.getOsteopaths() as unknown as Promise<T[]>,
          update: (id, updates) => osteopathService.updateOsteopath(Number(id), updates as any) as unknown as Promise<T>,
          delete: (id) => osteopathService.deleteOsteopath?.(Number(id)) ?? Promise.resolve(true)
        } as StorageAdapter<T>;
        
      case 'invoices':
        // Utiliser les services existants qui fonctionnent  
        const { invoiceService } = await import('@/services/api/invoice-service');
        return {
          create: (data) => invoiceService.createInvoice(data as any) as unknown as Promise<T>,
          getById: (id) => invoiceService.getInvoiceById(Number(id)) as unknown as Promise<T | null>,
          getAll: () => invoiceService.getInvoices() as unknown as Promise<T[]>,
          update: (id, updates) => invoiceService.updateInvoice(Number(id), { ...updates, id: Number(id) } as any) as unknown as Promise<T>,
          delete: (id) => invoiceService.deleteInvoice(Number(id))
        } as StorageAdapter<T>;
        
      case 'users':
        // Mock pour les utilisateurs
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
   * Adapter spécial pour l'environnement iframe (fallback preview mode)
   * 🔒 Données HDS → Données vides/par défaut (sécurité)
   * 🌐 Données Non-HDS → Supabase (normal)
   */
  private async getIframeFallbackAdapter<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    console.warn(`🔍 Mode Preview détecté pour "${dataType}"`);
    
    // Pour les données HDS : utiliser des données vides/par défaut (sécurité stricte)
    if (isHDSData(dataType)) {
      console.warn(`🔒 Données HDS "${dataType}" → Données vides en mode preview (sécurité)`);
      
      return {
        async create(data: any): Promise<T> {
          console.warn(`⚠️ Création ${dataType} ignorée en mode preview`);
          return { ...data, id: Date.now() } as T;
        },
        
        async getById(id: string | number): Promise<T | null> {
          console.warn(`⚠️ Lecture ${dataType} vide en mode preview`);
          return null;
        },
        
        async getAll(): Promise<T[]> {
          console.warn(`⚠️ Liste ${dataType} vide en mode preview`);
          return [];
        },
        
        async update(id: string | number, updates: Partial<T>): Promise<T> {
          console.warn(`⚠️ Mise à jour ${dataType} ignorée en mode preview`);
          return { ...updates, id } as T;
        },
        
        async delete(id: string | number): Promise<boolean> {
          console.warn(`⚠️ Suppression ${dataType} ignorée en mode preview`);
          return true;
        }
      };
    }
    
    // Pour les données Non-HDS : utiliser Supabase normalement
    console.log(`🌐 Données Non-HDS "${dataType}" → Supabase en mode preview`);
    return this.getSupabaseAdapter<T>(dataType);
  }

  /**
   * Méthode de diagnostic pour vérifier la configuration
   */
  async diagnose(): Promise<{
    mode: 'demo' | 'connected' | 'iframe_preview';
    hdsServices: string[];
    nonHdsServices: string[];
    security: {
      hdsLocalOnly: boolean;
      nonHdsSupabaseOnly: boolean;
      noHdsLeakage: boolean;
    };
    isIframeEnvironment: boolean;
  }> {
    const isDemoMode = await isDemoSession();
    const isIframeEnvironment = window.self !== window.top;
    
    return {
      mode: isDemoMode ? 'demo' : (isIframeEnvironment ? 'iframe_preview' : 'connected'),
      hdsServices: ['patients', 'appointments', 'invoices'],
      nonHdsServices: ['osteopaths', 'cabinets', 'users'],
      security: {
        hdsLocalOnly: !isDemoMode && !isIframeEnvironment, // En mode connecté non-iframe, HDS doit être local
        nonHdsSupabaseOnly: !isDemoMode, // En mode connecté, Non-HDS peut aller sur Supabase
        noHdsLeakage: !isIframeEnvironment // Pas de fuite HDS sauf en mode iframe (preview)
      },
      isIframeEnvironment
    };
  }
}

/**
 * Instance singleton du routeur de stockage
 */
export const storageRouter = StorageRouter.getInstance();