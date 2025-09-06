/**
 * 💰 Service Invoice - Routage simple Supabase vs LocalHDS
 * 
 * Mode démo : Tout vers Supabase éphémère
 * Mode connecté : Invoices HDS vers stockage local obligatoire
 */

import { Invoice } from '@/types';
import { StorageRouter } from '@/services/storage-router/storage-router';

// Import dynamique des services selon le routage
let demoContext: any = null;

export const setDemoContext = (context: any): void => {
  demoContext = context;
};

// Security error class for unauthorized access
export class SecurityViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityViolationError";
  }
}

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const decision = StorageRouter.route('invoices');
    console.log(`📍 Route invoices: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      // Mode démo ou fallback : utiliser Supabase
      if (demoContext?.invoiceService) {
        return demoContext.invoiceService.getInvoices();
      }
      
      // Import dynamique Supabase
      const supabaseService = await import('@/services/supabase-api/invoice-service');
      return supabaseService.supabaseInvoiceService.getInvoices();
    } else {
      // Mode connecté : utiliser LocalHDS
      const { hdsInvoiceService } = await import('@/services/hds-local-storage');
      return hdsInvoiceService.getInvoices();
    }
  },

  async getInvoiceById(id: number): Promise<Invoice> {
    const decision = StorageRouter.route('invoices');
    console.log(`📍 Route invoice by ID: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.invoiceService) {
        return demoContext.invoiceService.getInvoiceById(id);
      }
      
      const supabaseService = await import('@/services/supabase-api/invoice-service');
      return supabaseService.supabaseInvoiceService.getInvoiceById(id);
    } else {
      const { hdsInvoiceService } = await import('@/services/hds-local-storage');
      return hdsInvoiceService.getInvoiceById(id);
    }
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const decision = StorageRouter.route('invoices');
    console.log(`📍 Route create invoice: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.invoiceService) {
        return demoContext.invoiceService.createInvoice(invoice);
      }
      
      const supabaseService = await import('@/services/supabase-api/invoice-service');
      return supabaseService.supabaseInvoiceService.createInvoice(invoice);
    } else {
      const { hdsInvoiceService } = await import('@/services/hds-local-storage');
      return hdsInvoiceService.createInvoice(invoice);
    }
  },

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const decision = StorageRouter.route('invoices');
    console.log(`📍 Route update invoice: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.invoiceService) {
        return demoContext.invoiceService.updateInvoice(invoice);
      }
      
      const supabaseService = await import('@/services/supabase-api/invoice-service');
      return supabaseService.supabaseInvoiceService.updateInvoice(invoice.id, invoice);
    } else {
      const { hdsInvoiceService } = await import('@/services/hds-local-storage');
      return hdsInvoiceService.updateInvoice(invoice.id, invoice);
    }
  },

  async deleteInvoice(id: number): Promise<boolean> {
    const decision = StorageRouter.route('invoices');
    console.log(`📍 Route delete invoice: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.invoiceService) {
        return demoContext.invoiceService.deleteInvoice(id);
      }
      
      const supabaseService = await import('@/services/supabase-api/invoice-service');
      return supabaseService.supabaseInvoiceService.deleteInvoice(id);
    } else {
      const { hdsInvoiceService } = await import('@/services/hds-local-storage');
      return hdsInvoiceService.deleteInvoice(id);
    }
  },

  async getInvoicesByPatient(patientId: number): Promise<Invoice[]> {
    const decision = StorageRouter.route('invoices');
    console.log(`📍 Route invoices by patient: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.invoiceService) {
        const allInvoices = await demoContext.invoiceService.getInvoices();
        return allInvoices.filter((i: Invoice) => i.patientId === patientId);
      }
      
      const supabaseService = await import('@/services/supabase-api/invoice-service');
      return supabaseService.supabaseInvoiceService.getInvoicesByPatientId(patientId);
    } else {
      const { hdsInvoiceService } = await import('@/services/hds-local-storage');
      const allInvoices = await hdsInvoiceService.getInvoices();
      return allInvoices.filter(i => i.patientId === patientId);
    }
  },

  async getInvoicesByOsteopath(osteopathId: number): Promise<Invoice[]> {
    const decision = StorageRouter.route('invoices');
    console.log(`📍 Route invoices by osteopath: ${decision.destination} (${decision.reason})`);

    if (decision.destination === 'supabase') {
      if (demoContext?.invoiceService) {
        const allInvoices = await demoContext.invoiceService.getInvoices();
        return allInvoices.filter((i: Invoice) => i.osteopathId === osteopathId);
      }
      
      const supabaseService = await import('@/services/supabase-api/invoice-service');
      return supabaseService.supabaseInvoiceService.getInvoices(); // Supabase filtre déjà par ostéopathe
    } else {
      const { hdsInvoiceService } = await import('@/services/hds-local-storage');
      const allInvoices = await hdsInvoiceService.getInvoices();
      return allInvoices.filter(i => i.osteopathId === osteopathId);
    }
  },

  // Méthodes complémentaires pour compatibilité existante
  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    return this.getInvoicesByPatient(patientId);
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    const allInvoices = await this.getInvoices();
    return allInvoices.filter(i => i.appointmentId === appointmentId);
  }
};

export default invoiceService;