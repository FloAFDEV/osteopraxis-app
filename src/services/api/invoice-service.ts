import { Invoice, PaymentStatus } from "@/types";
import { delay } from "./config";
import { storageRouter } from '../storage/storage-router';
import { DEMO_OSTEOPATH_ID, DEMO_CABINET_ID } from '@/config/demo-constants';

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      await delay(200); // Simulation UI
      return await adapter.getAll();
    } catch (error) {
      console.error('❌ Erreur récupération factures:', error);
      return [];
    }
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("ID facture invalide:", id);
      return undefined;
    }

    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      const invoice = await adapter.getById(id);
      return invoice || undefined;
    } catch (error) {
      console.error('❌ Erreur récupération facture:', error);
      return undefined;
    }
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    if (!patientId || isNaN(patientId) || patientId <= 0) {
      console.warn("ID patient invalide pour factures:", patientId);
      return [];
    }

    try {
      const allInvoices = await this.getInvoices();
      return allInvoices.filter((inv: Invoice) => inv.patientId === patientId);
    } catch (error) {
      console.error('❌ Erreur récupération factures par patient:', error);
      return [];
    }
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    if (!appointmentId || isNaN(appointmentId) || appointmentId <= 0) {
      console.warn("ID rendez-vous invalide pour factures:", appointmentId);
      return [];
    }

    try {
      const allInvoices = await this.getInvoices();
      return allInvoices.filter((inv: Invoice) => inv.appointmentId === appointmentId);
    } catch (error) {
      console.error('❌ Erreur récupération factures par rendez-vous:', error);
      return [];
    }
  },

  async createInvoice(invoiceData: Partial<Invoice> & { osteopathId?: number }): Promise<Invoice> {
    try {
      // Assurer les valeurs par défaut
      const dataToCreate = {
        amount: invoiceData.amount ?? 0,
        paymentStatus: (invoiceData.paymentStatus ?? "PENDING") as PaymentStatus,
        date: (invoiceData.date as any) ?? new Date().toISOString(),
        notes: invoiceData.notes ?? null,
        paymentMethod: invoiceData.paymentMethod ?? null,
        patientId: invoiceData.patientId!,
        appointmentId: invoiceData.appointmentId ?? null,
        osteopathId: invoiceData.osteopathId ?? DEMO_OSTEOPATH_ID,
        cabinetId: invoiceData.cabinetId ?? DEMO_CABINET_ID,
        tvaExoneration: true,
        tvaMotif: 'TVA non applicable - Article 261-4-1° du CGI'
      };

      const adapter = await storageRouter.route<Invoice>('invoices');
      return await adapter.create(dataToCreate);
    } catch (error) {
      console.error('❌ Erreur création facture:', error);
      throw error;
    }
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice> & { osteopathId?: number }): Promise<Invoice | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("ID facture invalide pour mise à jour:", id);
      return undefined;
    }

    try {
      const adapter = await storageRouter.route<Invoice>('invoices');
      return await adapter.update(id, invoiceData);
    } catch (error) {
      console.error('❌ Erreur mise à jour facture:', error);
      throw error;
    }
  },

  async deleteInvoice(id: number): Promise<boolean> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("ID facture invalide pour suppression:", id);
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
  
  async exportInvoicesByPeriod(year: string, month: string | null = null): Promise<Invoice[]> {
    const allInvoices = await this.getInvoices();
    return allInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      const invoiceYear = invoiceDate.getFullYear().toString();
      if (invoiceYear !== year) return false;
      if (month !== null) {
        const invoiceMonth = (invoiceDate.getMonth() + 1).toString().padStart(2, '0');
        return invoiceMonth === month;
      }
      return true;
    });
  }
};