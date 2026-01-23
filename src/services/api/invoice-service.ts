/**
 * Invoice API Service
 * Gère les factures avec support mode démo
 */

import type { Invoice } from '@/types';

// Helper pour vérifier le mode démo
const isDemoMode = (): boolean => {
  try {
    const demoSessionStr = localStorage.getItem('demo_session');
    if (!demoSessionStr) return false;

    const session = JSON.parse(demoSessionStr);
    const now = Date.now();
    return session.expires_at && now < session.expires_at;
  } catch {
    return false;
  }
};

// Récupérer les données démo depuis DemoDataContext
const getDemoInvoices = (): Invoice[] => {
  // En mode démo, retourner tableau vide pour l'instant
  // Les données réelles viennent de DemoDataContext dans les composants
  return [];
};

export const invoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    if (isDemoMode()) {
      return getDemoInvoices();
    }

    // TODO: Implémenter appel Supabase pour mode réel
    return [];
  },

  getInvoiceById: async (id: string): Promise<Invoice | null> => {
    if (isDemoMode()) {
      const invoices = getDemoInvoices();
      return invoices.find(i => i.id === id) || null;
    }

    // TODO: Implémenter appel Supabase
    return null;
  },

  getInvoicesByPatientId: async (patientId: string): Promise<Invoice[]> => {
    if (isDemoMode()) {
      const invoices = getDemoInvoices();
      return invoices.filter(i => i.patientId === patientId);
    }

    // TODO: Implémenter appel Supabase
    return [];
  },

  getInvoicesByAppointmentId: async (appointmentId: string): Promise<Invoice[]> => {
    if (isDemoMode()) {
      const invoices = getDemoInvoices();
      return invoices.filter(i => i.appointmentId === appointmentId);
    }

    // TODO: Implémenter appel Supabase
    return [];
  },

  createInvoice: async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> => {
    if (isDemoMode()) {
      throw new Error('Création de facture non disponible en mode démo');
    }

    // TODO: Implémenter appel Supabase
    throw new Error('Not implemented');
  },

  updateInvoice: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    if (isDemoMode()) {
      throw new Error('Modification de facture non disponible en mode démo');
    }

    // TODO: Implémenter appel Supabase
    throw new Error('Not implemented');
  },

  deleteInvoice: async (id: string): Promise<void> => {
    if (isDemoMode()) {
      throw new Error('Suppression de facture non disponible en mode démo');
    }

    // TODO: Implémenter appel Supabase
    throw new Error('Not implemented');
  },
};

export default invoiceService;
