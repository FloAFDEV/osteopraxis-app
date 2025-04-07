
import { Invoice, PaymentStatus } from "@/types";
import { supabase } from "./utils";
import { SIMULATE_AUTH } from "../api/config";

// Define a simple interface for the patient data we need
interface SimplePatient {
  firstName: string;
  lastName: string;
}

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      // Si SIMULATE_AUTH est actif, utilisons un rôle authentifié
      let query = supabase
        .from("Invoice")
        .select("*, Patient(firstName, lastName)")
        .order('date', { ascending: false });
      
      // Si SIMULATE_AUTH est actif, ajoutons un en-tête pour simuler un utilisateur authentifié
      if (SIMULATE_AUTH) {
        query = query.setHeader('X-Development-Mode', 'true');
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Transform data with explicit typing
      return (data || []).map(item => {
        // Ensure Patient exists and has correct shape
        let patient: SimplePatient | null = null;
        
        if (item.Patient && typeof item.Patient === 'object') {
          patient = {
            firstName: (item.Patient as any)?.firstName || '',
            lastName: (item.Patient as any)?.lastName || ''
          };
        }
        
        return {
          ...item,
          Patient: patient
        } as unknown as Invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoices:", error);
      throw error;
    }
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    try {
      let query = supabase
        .from("Invoice")
        .select("*, Patient(firstName, lastName)")
        .eq("id", id)
        .maybeSingle();
      
      // Si SIMULATE_AUTH est actif, ajoutons un en-tête
      if (SIMULATE_AUTH) {
        query = query.setHeader('X-Development-Mode', 'true');
      }
      
      const { data, error } = await query;
      
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
          firstName: (data.Patient as any).firstName || '',
          lastName: (data.Patient as any).lastName || ''
        };
      }
      
      // Return the properly typed invoice
      return {
        ...data,
        Patient: patientData
      } as unknown as Invoice;
    } catch (error) {
      console.error("Erreur getInvoiceById:", error);
      throw error;
    }
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      let query = supabase
        .from("Invoice")
        .select("*, Patient(firstName, lastName)")
        .eq("patientId", patientId)
        .order('date', { ascending: false });
      
      // Si SIMULATE_AUTH est actif, ajoutons un en-tête
      if (SIMULATE_AUTH) {
        query = query.setHeader('X-Development-Mode', 'true');
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Transform data with explicit typing
      return (data || []).map(item => {
        let patient: SimplePatient | null = null;
        
        if (item.Patient && typeof item.Patient === 'object') {
          patient = {
            firstName: (item.Patient as any).firstName || '',
            lastName: (item.Patient as any).lastName || ''
          };
        }
        
        return {
          ...item,
          Patient: patient
        } as unknown as Invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoicesByPatientId:", error);
      throw error;
    }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      let options = {};
      
      // Si SIMULATE_AUTH est actif, ajoutons un en-tête
      if (SIMULATE_AUTH) {
        options = {
          headers: {
            'X-Development-Mode': 'true'
          }
        };
      }
      
      const { data, error } = await supabase
        .from("Invoice")
        .insert(invoiceData)
        .select()
        .single(options);
      
      if (error) throw new Error(error.message);
      
      return data as Invoice;
    } catch (error) {
      console.error("Erreur createInvoice:", error);
      throw error;
    }
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    try {
      let options = {};
      
      // Si SIMULATE_AUTH est actif, ajoutons un en-tête
      if (SIMULATE_AUTH) {
        options = {
          headers: {
            'X-Development-Mode': 'true'
          }
        };
      }
      
      const { data, error } = await supabase
        .from("Invoice")
        .update(invoiceData)
        .eq("id", id)
        .select()
        .single(options);
      
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
