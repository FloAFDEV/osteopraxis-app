import { hybridDataManager } from './hybrid-data-adapter';
import { Invoice } from '@/types';
import { getCurrentOsteopath } from './supabase-api/utils/getCurrentOsteopath';

/**
 * Service hybride pour la gestion des factures
 * Utilise l'architecture hybride : Supabase pour la configuration, SQLite local pour les données sensibles
 */
class HybridInvoiceService {
  private static instance: HybridInvoiceService;

  static getInstance(): HybridInvoiceService {
    if (!HybridInvoiceService.instance) {
      HybridInvoiceService.instance = new HybridInvoiceService();
    }
    return HybridInvoiceService.instance;
  }

  // Récupération des factures
  async getInvoices(): Promise<Invoice[]> {
    try {
      return await hybridDataManager.get<Invoice>('invoices');
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    try {
      const invoice = await hybridDataManager.getById<Invoice>('invoices', id);
      return invoice || undefined;
    } catch (error) {
      console.error('Error fetching invoice by id:', error);
      throw error;
    }
  }

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      const allInvoices = await this.getInvoices();
      return allInvoices.filter(invoice => invoice.patientId === patientId);
    } catch (error) {
      console.error('Error fetching invoices by patient id:', error);
      throw error;
    }
  }

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    try {
      const allInvoices = await this.getInvoices();
      return allInvoices.filter(invoice => invoice.appointmentId === appointmentId);
    } catch (error) {
      console.error('Error fetching invoices by appointment id:', error);
      throw error;
    }
  }

  // Création de facture
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      // S'assurer que l'ostéopathe est défini de manière sécurisée
      const currentOsteopath = await getCurrentOsteopath();
      if (!currentOsteopath) {
        throw new Error('Osteopath not found');
      }

      const dataToCreate = {
        ...invoiceData,
        osteopathId: currentOsteopath.id, // Forcer l'ID de l'ostéopathe connecté
      };

      return await hybridDataManager.create<Invoice>('invoices', dataToCreate);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Mise à jour de facture
  async updateInvoice(id: number, updateData: Partial<Invoice>): Promise<Invoice> {
    try {
      // Empêcher la modification de l'osteopathId pour des raisons de sécurité
      const { osteopathId, ...safeUpdateData } = updateData;
      
      return await hybridDataManager.update<Invoice>('invoices', id, safeUpdateData);
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  // Suppression de facture
  async deleteInvoice(id: number): Promise<boolean> {
    try {
      return await hybridDataManager.delete('invoices', id);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  // Export par période
  async exportInvoicesByPeriod(year: string, month?: string | null): Promise<Invoice[]> {
    try {
      const allInvoices = await this.getInvoices();
      
      return allInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        const invoiceYear = invoiceDate.getFullYear().toString();
        
        if (invoiceYear !== year) return false;
        
        if (month) {
          const invoiceMonth = (invoiceDate.getMonth() + 1).toString().padStart(2, '0');
          return invoiceMonth === month;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error exporting invoices by period:', error);
      throw error;
    }
  }
}

// Export de l'instance singleton
export const hybridInvoiceService = HybridInvoiceService.getInstance();