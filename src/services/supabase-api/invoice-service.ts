
import { Invoice, PaymentStatus } from "@/types";
import { supabase } from "./utils";

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*, Patient!Invoice_patientId_fkey(firstName, lastName)")
      .order('date', { ascending: false });
      
    if (error) throw new Error(error.message);
    
    // Utiliser un cast plus explicite et sûr
    return data as Array<Omit<Invoice, 'Patient'> & {
      Patient?: {
        firstName: string;
        lastName: string;
      }
    }>;
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*, Patient!Invoice_patientId_fkey(firstName, lastName)")
      .eq("id", id)
      .maybeSingle();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    // Utiliser un cast plus explicite et sûr
    return data ? data as (Omit<Invoice, 'Patient'> & {
      Patient?: {
        firstName: string;
        lastName: string;
      }
    }) : undefined;
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*, Patient!Invoice_patientId_fkey(firstName, lastName)")
      .eq("patientId", patientId)
      .order('date', { ascending: false });
      
    if (error) throw new Error(error.message);
    
    // Utiliser un cast plus explicite et sûr
    return data as Array<Omit<Invoice, 'Patient'> & {
      Patient?: {
        firstName: string;
        lastName: string;
      }
    }>;
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    const { data, error } = await supabase
      .from("Invoice")
      .insert(invoiceData)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return data as Invoice;
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    const { data, error } = await supabase
      .from("Invoice")
      .update(invoiceData)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return data as Invoice;
  },
  
  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Invoice | undefined> {
    return this.updateInvoice(id, { paymentStatus });
  }
};
