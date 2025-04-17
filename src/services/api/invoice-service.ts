
import { Invoice, PaymentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseInvoiceService } from "../supabase-api/invoice-service";
import { supabase } from '@/integrations/supabase/client'; // Add this import

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      return await supabaseInvoiceService.getInvoices();
    } catch (error) {
      console.error("Erreur getInvoices:", error);
      throw error;
    }
  },
  
  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    try {
      return await supabaseInvoiceService.getInvoiceById(id);
    } catch (error) {
      console.error("Erreur getInvoiceById:", error);
      throw error;
    }
  },
  
  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      return await supabaseInvoiceService.getInvoicesByPatientId(patientId);
    } catch (error) {
      console.error("Erreur getInvoicesByPatientId:", error);
      throw error;
    }
  },
  
  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      return await supabaseInvoiceService.createInvoice(invoiceData);
    } catch (error) {
      console.error("Erreur createInvoice:", error);
      throw error;
    }
  },
  
  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    try {
      return await supabaseInvoiceService.updateInvoice(id, invoiceData);
    } catch (error) {
      console.error("Erreur updateInvoice:", error);
      throw error;
    }
  },
  
  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Invoice | undefined> {
    try {
      return await supabaseInvoiceService.updatePaymentStatus(id, paymentStatus);
    } catch (error) {
      console.error("Erreur updatePaymentStatus:", error);
      throw error;
    }
  },
  
  async deleteInvoice(id: number): Promise<boolean> {
    try {
      return await supabaseInvoiceService.deleteInvoice(id);
    } catch (error) {
      console.error("Erreur deleteInvoice:", error);
      throw error;
    }
  },
  
  async getInvoicesByPeriod(period: "month" | "sixMonths" | "year"): Promise<Invoice[]> {
    try {
      const now = new Date();
      let startDate = new Date();
      
      // Déterminer la date de début selon la période
      if (period === "month") {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === "sixMonths") {
        startDate.setMonth(now.getMonth() - 6);
      } else if (period === "year") {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Convertir les dates en chaînes ISO pour la requête
      const startISO = startDate.toISOString();
      const endISO = now.toISOString();
      
      // Récupérer toutes les factures de la période
      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .gte("date", startISO)
        .lte("date", endISO)
        .order("date", { ascending: false });
      
      if (error) throw new Error(error.message);
      
      return data.map(invoice => ({
        id: invoice.id,
        patientId: invoice.patientId,
        consultationId: invoice.consultationId,
        amount: invoice.amount,
        date: invoice.date,
        paymentStatus: invoice.paymentStatus as PaymentStatus
      }));
    } catch (error) {
      console.error(`Erreur getInvoicesByPeriod (${period}):`, error);
      throw error;
    }
  },
  
  async getInvoiceSummary(period: "month" | "sixMonths" | "year"): Promise<{
    total: number;
    paid: number;
    pending: number;
    canceled: number;
    count: number;
  }> {
    try {
      const invoices = await this.getInvoicesByPeriod(period);
      
      const summary = {
        total: 0,
        paid: 0,
        pending: 0,
        canceled: 0,
        count: invoices.length
      };
      
      invoices.forEach(invoice => {
        // Ajouter au montant total, sauf si annulée
        if (invoice.paymentStatus !== "CANCELED") {
          summary.total += invoice.amount;
        }
        
        // Compter par statut
        if (invoice.paymentStatus === "PAID") {
          summary.paid += invoice.amount;
        } else if (invoice.paymentStatus === "PENDING") {
          summary.pending += invoice.amount;
        } else if (invoice.paymentStatus === "CANCELED") {
          summary.canceled += invoice.amount;
        }
      });
      
      return summary;
    } catch (error) {
      console.error(`Erreur getInvoiceSummary (${period}):`, error);
      throw error;
    }
  }
};

export { supabaseInvoiceService };
