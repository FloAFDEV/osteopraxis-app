
import { Invoice, PaymentStatus } from "@/types";
import { supabase } from "./utils";

// Define a simple interface for the patient data we need
interface SimplePatient {
  firstName: string;
  lastName: string;
}

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*, Patient(firstName, lastName)")
      .order('date', { ascending: false });
      
    if (error) throw new Error(error.message);
    
    // Transform data with explicit typing
    return (data || []).map(item => {
      const patient = item.Patient ? {
        firstName: item.Patient.firstName || '',
        lastName: item.Patient.lastName || ''
      } : null;
      
      return {
        ...item,
        Patient: patient
      } as Invoice;
    });
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*, Patient(firstName, lastName)")
      .eq("id", id)
      .maybeSingle();
      
    if (error) {
      if (error.code === "PGRST116") {
        return undefined;
      }
      throw new Error(error.message);
    }
    
    if (!data) return undefined;
    
    // Safely handle the patient data
    let patientData: SimplePatient | null = null;
    if (data.Patient && typeof data.Patient === 'object') {
      patientData = {
        firstName: data.Patient.firstName || '',
        lastName: data.Patient.lastName || ''
      };
    }
    
    // Return the properly typed invoice
    return {
      ...data,
      Patient: patientData
    } as Invoice;
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*, Patient(firstName, lastName)")
      .eq("patientId", patientId)
      .order('date', { ascending: false });
      
    if (error) throw new Error(error.message);
    
    // Transform data with explicit typing
    return (data || []).map(item => {
      let patient: SimplePatient | null = null;
      if (item.Patient && typeof item.Patient === 'object') {
        patient = {
          firstName: item.Patient.firstName || '',
          lastName: item.Patient.lastName || ''
        };
      }
      
      return {
        ...item,
        Patient: patient
      } as Invoice;
    });
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
