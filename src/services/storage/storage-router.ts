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
      return this.getDemoAdapter<T>(dataType);
    }

    // 2️⃣ Mode connecté normal : Router selon classification HDS/Non-HDS
    const classification = getDataClassification(dataType);
    
    // Pas de fallback iframe pour les données HDS - must have local storage
    
    // 3️⃣ Pour les données Non-HDS en iframe, continuer normalement vers Supabase
    
    switch (classification) {
      case 'HDS':
        validateHDSSecurityPolicy(dataType, 'local');
        return this.getLocalHDSAdapter<T>(dataType);
        
      case 'NON_HDS':
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
   * Adapter pour le mode démo (localStorage multi-tenant)
   */
  private async getDemoAdapter<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    // Récupérer le cabinetId démo depuis la session
    const demoCabinetId = localStorage.getItem('demo_cabinet_id');
    if (!demoCabinetId) {
      throw new Error('🚨 Pas de session démo active (demo_cabinet_id manquant)');
    }

    const { DemoStorage } = await import('@/services/demo-storage');

    return {
      async create(data: any): Promise<T> {
        const now = new Date().toISOString();
        const newItem = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now
        };
        DemoStorage.add(demoCabinetId, dataType, newItem);
        return newItem as T;
      },

      async getById(id: string | number): Promise<T | null> {
        const all = DemoStorage.getAll<any>(demoCabinetId, dataType);
        // Recherche avec plusieurs stratégies de comparaison
        const found = all.find((item: any) => {
          // Comparaison stricte
          if (item.id === id) return true;
          // Comparaison string-string
          if (String(item.id) === String(id)) return true;
          // Comparaison number-number
          if (typeof item.id === 'number' && typeof id === 'number' && item.id === id) return true;
          return false;
        });

        if (!found) {
          console.warn(`[DemoAdapter] ${dataType}/${id} introuvable. IDs disponibles:`, all.map((item: any) => item.id));
        }

        return found || null;
      },

      async getAll(): Promise<T[]> {
        return DemoStorage.getAll<T>(demoCabinetId, dataType);
      },

      async update(id: string | number, updates: Partial<T>): Promise<T> {
        const all = DemoStorage.getAll<any>(demoCabinetId, dataType);
        // Recherche avec plusieurs stratégies de comparaison
        const existing = all.find((item: any) => {
          if (item.id === id) return true;
          if (String(item.id) === String(id)) return true;
          if (typeof item.id === 'number' && typeof id === 'number' && item.id === id) return true;
          return false;
        });

        if (!existing) {
          console.error(`[DemoAdapter] ${dataType}/${id} introuvable pour mise à jour. IDs disponibles:`, all.map((item: any) => item.id));
          throw new Error(`${dataType}/${id} introuvable en mode démo`);
        }

        const updated = {
          ...existing,
          ...updates,
          id: existing.id, // Garder l'ID original
          updatedAt: new Date().toISOString()
        };
        DemoStorage.update(demoCabinetId, dataType, existing.id, updated);
        return updated as T;
      },

      async delete(id: string | number): Promise<boolean> {
        DemoStorage.delete(demoCabinetId, dataType, String(id));
        return true;
      }
    };
  }

  /**
   * Adapter pour les données HDS (stockage local sécurisé UNIQUEMENT)
   * 🎯 RÉGLEMENTATION HDS: Données sensibles OBLIGATOIREMENT en local
   * 🚨 AUCUN fallback Supabase autorisé pour les données HDS en mode connecté
   */
  private async getLocalHDSAdapter<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    // ⚡ NOUVEAU : Vérifier le mode démo en premier
    const demoMode = await isDemoSession();
    if (demoMode) {
      console.log('🎭 Mode démo détecté dans getLocalHDSAdapter - Redirection vers stockage démo');
      return this.getDemoAdapter<T>(dataType);
    }

    // Vérification de sécurité stricte
    if (!isHDSData(dataType)) {
      throw new Error(`🚨 Tentative d'accès HDS pour donnée non-HDS: ${dataType}`);
    }

    // Vérifier si le stockage HDS est configuré
    const { hdsSecureManager } = await import('@/services/hds-secure-storage/hds-secure-manager');
    const status = await hdsSecureManager.getStatus();
    
    // 🔐 Stockage chiffré temporaire IndexedDB avec PIN (mode connecté uniquement)
    if (!status.isConfigured || !status.isUnlocked) {
      console.warn(`⚠️ HDS non configuré - Utilisation stockage chiffré temporaire pour ${dataType}`);
      
      const { encryptedWorkingStorage } = await import('@/services/storage/encrypted-working-storage');
      
      // Vérifier si le PIN est déjà configuré
      const pinHash = localStorage.getItem('temp-storage-pin-hash');
      
      if (!pinHash) {
        // Pas de PIN configuré - demander à l'utilisateur
        throw new Error('PIN_SETUP_REQUIRED');
      }
      
      // Le PIN a déjà été saisi au démarrage - vérifier si configuré
      const isConfigured = await encryptedWorkingStorage.isAvailable();
      
      if (!isConfigured) {
        throw new Error('PIN_UNLOCK_REQUIRED');
      }
      
      // Activer les sauvegardes automatiques
      await encryptedWorkingStorage.enableAutoBackup(5);
      
      return {
        create: (data) => encryptedWorkingStorage.save(dataType, { ...data, id: Date.now() } as any),
        getById: (id) => encryptedWorkingStorage.getById(dataType, id),
        getAll: () => encryptedWorkingStorage.getAll(dataType),
        update: async (id, updates) => {
          const existing = await encryptedWorkingStorage.getById(dataType, id);
          if (!existing) throw new Error(`${dataType}/${id} introuvable`);
          return encryptedWorkingStorage.save(dataType, { ...(existing as any), ...(updates as any) });
        },
        delete: (id) => encryptedWorkingStorage.delete(dataType, id).then(() => true)
      } as StorageAdapter<T>;
    }

    // HDS configuré ET déverrouillé → Utiliser les services HDS sécurisés
    const { hdsSecurePatientService, hdsSecureAppointmentService, hdsSecureInvoiceService } = 
      await import('@/services/hds-secure-storage');
    
    console.log(`✅ Accès HDS sécurisé autorisé pour ${dataType}`);
    
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
    // 🚨 TRIPLE VÉRIFICATION SÉCURITÉ CRITIQUE
    const isDemoMode = await isDemoSession();
    if (isDemoMode) {
      throw new Error(`🚨 VIOLATION SÉCURITÉ: Tentative Supabase en mode démo pour: ${dataType}`);
    }
    
    // Vérification supplémentaire via sessionStorage
    const demoSession = sessionStorage.getItem('demo_session');
    if (demoSession) {
      throw new Error(`🚨 VIOLATION SÉCURITÉ: Session démo détectée mais tentative Supabase pour: ${dataType}`);
    }

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
          getAll: async () => {
            // ⛔ PROTECTION SUPPLÉMENTAIRE: Double vérification mode démo
            const isDemoMode = await isDemoSession();
            if (isDemoMode) {
              throw new Error('🚨 VIOLATION SÉCURITÉ: Supabase Cabinet appelé en mode démo');
            }

            try {
              console.log('🔧 Tentative récupération cabinets via Supabase...');
              const result = await cabinetMethods.getCabinets() as unknown as T[];
              console.log('✅ Cabinets récupérés avec succès:', result);
              return result;
            } catch (error) {
              console.error('❌ Erreur récupération cabinets Supabase:', error);
              
              // Retourner un tableau vide au lieu d'un fallback si c'est un problème d'authentification
              if (error instanceof Error && (
                error.message.includes('non authentifié') || 
                error.message.includes('not authenticated') ||
                error.message.includes('JWT')
              )) {
                console.log('🔒 Problème d\'authentification - Retour tableau vide');
                return [];
              }
              
              // Import dynamique du service de toast pour notification utilisateur
              try {
                const { toast } = await import('sonner');
                toast.error('Impossible de charger les cabinets', {
                  description: 'Vérifiez votre connexion ou contactez le support.'
                });
              } catch (toastError) {
                console.warn('Impossible d\'afficher la notification:', toastError);
              }
              
              // Pour les autres erreurs, retourner un tableau vide aussi
              console.log('📋 Retour tableau vide suite à l\'erreur');
              return [];
            }
          },
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
   * 🔒 TOUTES les données → Données vides/par défaut (mode preview)
   * Évite les erreurs Supabase d'authentification en mode iframe
   */
  private async getIframeFallbackAdapter<T>(dataType: DataType): Promise<StorageAdapter<T>> {
    console.warn(`🔍 Mode Preview détecté pour "${dataType}" → Données vides (pas d'auth Supabase)`);
    
    // Retourner des données vides pour TOUS les types de données en mode iframe
    // Cela évite les erreurs d'authentification Supabase qui causent le spinner infini
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