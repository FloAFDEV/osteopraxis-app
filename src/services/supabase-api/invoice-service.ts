import { Invoice, PaymentStatus } from "@/types";
import { supabase, typedData } from "./utils";

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      // Correction: suppression de l'embed "*, Patient(firstName, lastName)" qui cause l'erreur
      // quand plusieurs relations existent entre Invoice et Patient
      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .order('date', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      // Transform data with explicit typing
      return (data || []).map(item => {
        return {
          id: item.id,
          patientId: item.patientId,
          consultationId: item.consultationId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus as PaymentStatus
        } as Invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoices:", error);
      throw error;
    }
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    try {
      const query = supabase
        .from("Invoice")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      const { data, error } = await query;
      
      if (error) {
        if (error.code === "PGRST116") {
          return undefined;
        }
        throw new Error(error.message);
      }
      
      if (!data) return undefined;
      
      // Return the properly typed invoice
      return {
        id: data.id,
        patientId: data.patientId,
        consultationId: data.consultationId,
        date: data.date,
        amount: data.amount,
        paymentStatus: data.paymentStatus as PaymentStatus
      } as Invoice;
    } catch (error) {
      console.error("Erreur getInvoiceById:", error);
      throw error;
    }
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      const query = supabase
        .from("Invoice")
        .select("*")
        .eq("patientId", patientId)
        .order('date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Transform data with explicit typing
      return (data || []).map(item => {
        return {
          id: item.id,
          patientId: item.patientId,
          consultationId: item.consultationId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus as PaymentStatus
        } as Invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoicesByPatientId:", error);
      throw error;
    }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      console.log("Création d'une facture avec les données:", invoiceData);
      const query = supabase
        .from("Invoice")
        .insert(invoiceData)
        .select()
        .single();
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return data as Invoice;
    } catch (error) {
      console.error("Erreur createInvoice:", error);
      throw error;
    }
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    try {
      const query = supabase
        .from("Invoice")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single();
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return data as Invoice;
    } catch (error) {
      console.error("Erreur updateInvoice:", error);
      throw error;
    }
  },
  
  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Invoice | undefined> {
    return this.updateInvoice(id, { paymentStatus });
  }
};
