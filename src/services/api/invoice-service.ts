import { Invoice, PaymentStatus } from "@/types";
import { USE_SUPABASE } from "./config";
import { supabaseInvoiceService } from "../supabase-api/invoice-service";
import { getCurrentOsteopathId, isInvoiceOwnedByCurrentOsteopath, isPatientOwnedByCurrentOsteopath } from "@/services";
import { SecurityViolationError } from "./appointment-service";

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.getInvoices();
      } catch (error) {
        console.error("Erreur Supabase getInvoices:", error);
        throw error;
      }
    }
    return [];
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    if (USE_SUPABASE) {
      try {
        const isOwned = await isInvoiceOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès à la facture ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à cette facture`);
        }
        return await supabaseInvoiceService.getInvoiceById(id);
      } catch (error) {
        console.error("Erreur Supabase getInvoiceById:", error);
        throw error;
      }
    }
    return undefined;
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    if (USE_SUPABASE) {
      try {
        const isOwned = await isPatientOwnedByCurrentOsteopath(patientId);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès aux factures du patient ${patientId} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce patient`);
        }
        return await supabaseInvoiceService.getInvoicesByPatientId(patientId);
      } catch (error) {
        console.error("Erreur Supabase getInvoicesByPatientId:", error);
        throw error;
      }
    }
    return [];
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    if (USE_SUPABASE) {
      try {
        const { isAppointmentOwnedByCurrentOsteopath } = await import("@/services");
        const isOwned = await isAppointmentOwnedByCurrentOsteopath(appointmentId);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès aux factures du rendez-vous ${appointmentId} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce rendez-vous`);
        }
        return await supabaseInvoiceService.getInvoicesByAppointmentId(appointmentId);
      } catch (error) {
        console.error("Erreur Supabase getInvoicesByAppointmentId:", error);
        throw error;
      }
    }
    return [];
  },

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> { // Accept Partial<Invoice> so we can include osteopathId
    if (USE_SUPABASE) {
      try {
        let dataToSend = { ...invoiceData };
        if (!dataToSend.osteopathId) {
          dataToSend.osteopathId = await getCurrentOsteopathId();
        }
        // On laisse la backend RLS faire la vérification
        return await supabaseInvoiceService.createInvoice(dataToSend as Omit<Invoice, "id">);
      } catch (error) {
        console.error("Erreur Supabase createInvoice:", error);
        throw error;
      }
    }
    return {
      id: Math.floor(Math.random() * 1000),
      ...invoiceData,
      date: new Date().toISOString(),
      paymentStatus: "PENDING"
    } as Invoice;
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    if (USE_SUPABASE) {
      try {
        let dataToSend = { ...invoiceData };
        if (!dataToSend.osteopathId) {
          dataToSend.osteopathId = await getCurrentOsteopathId();
        }
        const updatedInvoice = await supabaseInvoiceService.updateInvoice(id, dataToSend);
        return updatedInvoice;
      } catch (error) {
        console.error("Erreur Supabase updateInvoice:", error);
        throw error;
      }
    }
    return { 
      id, 
      ...invoiceData 
    } as Invoice;
  },

  async deleteInvoice(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        const isOwned = await isInvoiceOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative de suppression de la facture ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à cette facture`);
        }
        return await supabaseInvoiceService.deleteInvoice(id);
      } catch (error) {
        console.error("Erreur Supabase deleteInvoice:", error);
        throw error;
      }
    }
    return true;
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
