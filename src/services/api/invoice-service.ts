/**
 * Invoice API Service
 * Gère les factures via StorageRouter (mode démo + mode connecté)
 */

import type { Invoice } from '@/types';
import { storageRouter } from '../storage/storage-router';

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      return await adapter.getAll();
    } catch (error) {
      console.error('❌ Erreur récupération factures:', error);
      return [];
    }
  },

  async getInvoiceById(id: number | string): Promise<Invoice | null> {
    // Support UUID en mode démo et number en mode connecté
    if (!id || (typeof id === 'number' && (isNaN(id) || id <= 0))) {
      console.warn('ID facture invalide:', id);
      return null;
    }

    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      return await adapter.getById(id);
    } catch (error) {
      console.error('❌ Erreur récupération facture:', error);
      return null;
    }
  },

  async getInvoicesByPatientId(patientId: number | string): Promise<Invoice[]> {
    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      const allInvoices = await adapter.getAll();
      return allInvoices.filter(i => i.patientId === patientId || i.patientId === String(patientId));
    } catch (error) {
      console.error('❌ Erreur récupération factures patient:', error);
      return [];
    }
  },

  async getInvoicesByAppointmentId(appointmentId: number | string): Promise<Invoice[]> {
    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      const allInvoices = await adapter.getAll();
      return allInvoices.filter(i => i.appointmentId === appointmentId || i.appointmentId === String(appointmentId));
    } catch (error) {
      console.error('❌ Erreur récupération factures rendez-vous:', error);
      return [];
    }
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      return await adapter.create(invoice);
    } catch (error) {
      console.error('❌ Erreur création facture:', error);
      throw new Error('❌ Service facture indisponible');
    }
  },

  async updateInvoice(id: number | string, data: Partial<Invoice>): Promise<Invoice> {
    // Support UUID en mode démo et number en mode connecté
    if (!id || (typeof id === 'number' && (isNaN(id) || id <= 0))) {
      throw new Error("ID facture invalide pour la mise à jour");
    }

    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      return await adapter.update(id, data);
    } catch (error) {
      console.error('❌ Erreur mise à jour facture:', error);
      throw new Error('❌ Service facture indisponible');
    }
  },

  async deleteInvoice(id: number | string): Promise<boolean> {
    // Support UUID en mode démo et number en mode connecté
    if (!id || (typeof id === 'number' && (isNaN(id) || id <= 0))) {
      console.warn('ID facture invalide pour suppression:', id);
      return false;
    }

    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      return await adapter.delete(id);
    } catch (error) {
      console.error('❌ Erreur suppression facture:', error);
      return false;
    }
  },
};

export default invoiceService;
