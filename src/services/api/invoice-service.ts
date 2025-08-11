import { Invoice, PaymentStatus } from "@/types";
import { USE_SUPABASE } from "./config";
import { supabaseInvoiceService } from "../supabase-api/invoice-service";
import { getCurrentOsteopathId, isInvoiceOwnedByCurrentOsteopath, isPatientOwnedByCurrentOsteopath } from "../supabase-api/utils/getCurrentOsteopath";
import { SecurityViolationError } from "./appointment-service";
import { hybridDataManager } from "@/services/hybrid-data-adapter/hybrid-manager";

// Hook pour accéder au contexte démo depuis les services
let demoContext: any = null;
export const setDemoContext = (context: any) => {
  demoContext = context;
};

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    // Démo: données locales éphémères
    if (demoContext?.isDemoMode) {
      return [...demoContext.demoData.invoices];
    }

    if (USE_SUPABASE) {
      try {
        return await hybridDataManager.get<Invoice>('invoices');
      } catch (error) {
        console.error("Erreur Hybrid getInvoices:", error);
        throw error;
      }
    }
    return [];
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("getInvoiceById appelé avec un ID invalide:", id);
      return undefined;
    }

    // Démo: lecture locale
    if (demoContext?.isDemoMode) {
      return demoContext.demoData.invoices.find((inv: Invoice) => inv.id === id);
    }

    if (USE_SUPABASE) {
      try {
        const res = await hybridDataManager.getById<Invoice>('invoices', id);
        return res || undefined;
      } catch (error) {
        console.error("Erreur Hybrid getInvoiceById:", error);
        throw error;
      }
    }
    return undefined;
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    if (!patientId || isNaN(patientId) || patientId <= 0) {
      console.warn("getInvoicesByPatientId appelé avec un ID patient invalide:", patientId);
      return [];
    }

    // Démo: lecture locale
    if (demoContext?.isDemoMode) {
      return demoContext.demoData.invoices.filter((inv: Invoice) => inv.patientId === patientId);
    }

    if (USE_SUPABASE) {
      try {
        const all = await hybridDataManager.get<Invoice>('invoices');
        return all.filter(inv => inv.patientId === patientId);
      } catch (error) {
        console.error("Erreur Hybrid getInvoicesByPatientId:", error);
        throw error;
      }
    }
    return [];
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    if (!appointmentId || isNaN(appointmentId) || appointmentId <= 0) {
      console.warn("getInvoicesByAppointmentId appelé avec un ID rendez-vous invalide:", appointmentId);
      return [];
    }

    // Démo: lecture locale
    if (demoContext?.isDemoMode) {
      return demoContext.demoData.invoices.filter((inv: Invoice) => inv.appointmentId === appointmentId);
    }

    if (USE_SUPABASE) {
      try {
        const all = await hybridDataManager.get<Invoice>('invoices');
        return all.filter(inv => inv.appointmentId === appointmentId);
      } catch (error) {
        console.error("Erreur Hybrid getInvoicesByAppointmentId:", error);
        throw error;
      }
    }
    return [];
  },

  async createInvoice(invoiceData: Partial<Invoice> & { osteopathId?: number }): Promise<Invoice> {
    // Démo: données éphémères
    if (demoContext?.isDemoMode) {
      const now = new Date().toISOString();
      const nextId = Math.max(0, ...demoContext.demoData.invoices.map((i: Invoice) => i.id)) + 1;
      const toCreate: Invoice = {
        id: nextId,
        amount: invoiceData.amount ?? 0,
        paymentStatus: (invoiceData.paymentStatus ?? "PENDING") as PaymentStatus,
        date: (invoiceData.date as any) ?? now,
        notes: invoiceData.notes ?? null,
        paymentMethod: invoiceData.paymentMethod ?? null,
        patientId: invoiceData.patientId!,
        appointmentId: invoiceData.appointmentId ?? null,
        osteopathId: invoiceData.osteopathId ?? demoContext.demoData.osteopath.id,
        cabinetId: invoiceData.cabinetId ?? demoContext.demoData.cabinets[0]?.id ?? null,
        createdAt: now as any,
        updatedAt: now as any,
        tvaExoneration: true,
        tvaMotif: 'TVA non applicable - Article 261-4-1° du CGI'
      } as Invoice;
      demoContext.addDemoInvoice({ ...(toCreate as any), id: undefined });
      return toCreate;
    }

    if (USE_SUPABASE) {
      try {
        let dataToSend = { ...invoiceData } as any;
        if (!dataToSend.osteopathId) {
          dataToSend.osteopathId = await getCurrentOsteopathId();
        }
        const created = await hybridDataManager.create<Invoice>('invoices', dataToSend as Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>);
        return created;
      } catch (error) {
        console.error("Erreur Hybrid createInvoice:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    throw new Error("Service facture indisponible");
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice> & { osteopathId?: number }): Promise<Invoice | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("updateInvoice appelé avec un ID invalide:", id);
      return undefined;
    }

    // Démo: mise à jour locale
    if (demoContext?.isDemoMode) {
      demoContext.updateDemoInvoice?.(id, invoiceData);
      const updated = demoContext.demoData.invoices.find((i: Invoice) => i.id === id);
      return updated;
    }

    if (USE_SUPABASE) {
      try {
        let dataToSend = { ...invoiceData } as any;
        if (!dataToSend.osteopathId) {
          dataToSend.osteopathId = await getCurrentOsteopathId();
        }
        const updated = await hybridDataManager.update<Invoice>('invoices', id, dataToSend);
        return updated;
      } catch (error) {
        console.error("Erreur Hybrid updateInvoice:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    throw new Error("Service facture indisponible");
  },

  async deleteInvoice(id: number): Promise<boolean> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("deleteInvoice appelé avec un ID invalide:", id);
      return false;
    }

    // Démo: suppression locale
    if (demoContext?.isDemoMode) {
      demoContext.deleteDemoInvoice?.(id);
      return true;
    }

    if (USE_SUPABASE) {
      try {
        const ok = await hybridDataManager.delete('invoices', id);
        return ok;
      } catch (error) {
        console.error("Erreur Hybrid deleteInvoice:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    return false;
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
  },
  
  // Méthode pour injecter le contexte démo
  setDemoContext,
};
