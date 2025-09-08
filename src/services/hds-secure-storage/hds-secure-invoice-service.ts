/**
 * 🔐 Service Factures HDS Sécurisé - STOCKAGE LOCAL EXCLUSIF
 * 
 * Service pour la gestion des factures avec stockage local sécurisé uniquement
 * Aucune donnée HDS ne va vers Supabase - Conformité HDS stricte
 */

import { Invoice } from '@/types';
import { hdsSecureManager } from './hds-secure-manager';
import { isDemoSession } from '@/utils/demo-detection';

interface HDSSecureInvoiceService {
  getInvoices(): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | null>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
  updateInvoice(id: number, updates: Partial<Invoice> & { id: number }): Promise<Invoice>;
  deleteInvoice(id: number): Promise<boolean>;
}

class HDSSecureInvoiceServiceImpl implements HDSSecureInvoiceService {
  
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
   * Obtenir le stockage sécurisé pour les factures
   */
  private async getSecureStorage() {
    await this.ensureConnectedMode();
    
    const storage = hdsSecureManager.getSecureStorage('invoices');
    if (!storage) {
      throw new Error('💾 Stockage HDS sécurisé non configuré. Veuillez configurer le stockage local.');
    }
    
    return storage;
  }

  /**
   * Générer un ID unique pour une nouvelle facture
   */
  private generateInvoiceId(): number {
    return Math.floor(Math.random() * 2000000000) + 1;
  }

  /**
   * 📖 Récupération des factures - STOCKAGE LOCAL EXCLUSIF
   */
  async getInvoices(): Promise<Invoice[]> {
    try {
      const storage = await this.getSecureStorage();
      const invoices = await storage.loadRecords<Invoice>();
      
      console.log(`📖 ${invoices.length} factures HDS récupérées depuis le stockage local sécurisé`);
      return invoices;
    } catch (error) {
      console.error('❌ Erreur récupération factures HDS sécurisées:', error);
      throw error;
    }
  }

  /**
   * 🔍 Récupération d'une facture par ID - STOCKAGE LOCAL EXCLUSIF  
   */
  async getInvoiceById(id: number): Promise<Invoice | null> {
    try {
      const storage = await this.getSecureStorage();
      const invoice = await storage.getRecordById<Invoice>(id);
      
      if (invoice) {
        console.log(`📖 Facture ${id} trouvée dans le stockage HDS sécurisé`);
      }
      
      return invoice;
    } catch (error) {
      console.error(`❌ Erreur récupération facture ${id}:`, error);
      throw error;
    }
  }

  /**
   * 🏗️ Création d'une nouvelle facture - STOCKAGE LOCAL EXCLUSIF
   */
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      await this.ensureConnectedMode();
      
      const storage = await this.getSecureStorage();
      
      // Créer la facture avec métadonnées
      const newInvoice: Invoice = {
        ...invoiceData,
        id: this.generateInvoiceId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔐 Création facture dans le stockage HDS sécurisé (LOCAL UNIQUEMENT)...');
      const savedInvoice = await storage.saveRecord(newInvoice);
      
      console.log('✅ Facture créée et sécurisée localement:', savedInvoice.id);
      return savedInvoice;
    } catch (error) {
      console.error('❌ Erreur création facture HDS sécurisée:', error);
      throw error;
    }
  }

  /**
   * 🔄 Mise à jour d'une facture - STOCKAGE LOCAL EXCLUSIF
   */
  async updateInvoice(id: number, updates: Partial<Invoice> & { id: number }): Promise<Invoice> {
    try {
      const storage = await this.getSecureStorage();
      
      // Vérifier que la facture existe
      const existingInvoice = await storage.getRecordById<Invoice>(id);
      if (!existingInvoice) {
        throw new Error(`Facture ${id} non trouvée dans le stockage HDS sécurisé`);
      }

      // Fusionner les modifications
      const updatedInvoice: Invoice = {
        ...existingInvoice,
        ...updates,
        id, // S'assurer que l'ID ne change pas
        updatedAt: new Date().toISOString()
      };

      console.log(`🔐 Mise à jour facture ${id} dans le stockage HDS sécurisé...`);
      const savedInvoice = await storage.saveRecord(updatedInvoice);
      
      console.log(`✅ Facture ${id} mise à jour dans le stockage HDS sécurisé`);
      return savedInvoice;
    } catch (error) {
      console.error(`❌ Erreur mise à jour facture ${id}:`, error);
      throw error;
    }
  }

  /**
   * 🗑️ Suppression d'une facture - STOCKAGE LOCAL EXCLUSIF
   */
  async deleteInvoice(id: number): Promise<boolean> {
    try {
      const storage = await this.getSecureStorage();
      
      console.log(`🗑️ Suppression facture ${id} du stockage HDS sécurisé...`);
      const success = await storage.deleteRecord(id);
      
      console.log(`${success ? '✅' : '❌'} Facture ${id} ${success ? 'supprimée' : 'erreur suppression'}`);
      return success;
    } catch (error) {
      console.error(`❌ Erreur suppression facture ${id}:`, error);
      return false;
    }
  }

  /**
   * 📊 Statistiques du stockage factures sécurisé
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
      console.error('❌ Erreur stats stockage factures:', error);
      return { count: 0, size: 0, lastModified: '', integrity: false };
    }
  }
}

// Instance singleton
export const hdsSecureInvoiceService = new HDSSecureInvoiceServiceImpl();

// Export du type pour l'utilisation
export type { HDSSecureInvoiceService };