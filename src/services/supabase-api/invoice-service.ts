
import { Invoice, PaymentStatus } from "@/types";
import { supabase, addAuthHeaders } from "./utils";
import { SIMULATE_AUTH } from "../api/config";

// Define a simple interface for the patient data we need
interface SimplePatient {
  firstName: string;
  lastName: string;
}

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      // Utiliser la fonction addAuthHeaders pour gérer l'authentification
      const query = addAuthHeaders(
        supabase
          .from("Invoice")
          .select("*, Patient(firstName, lastName)")
          .order('date', { ascending: false })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Transform data with explicit typing
      return (data || []).map(item => {
        // Ensure Patient exists and has correct shape
        let patient: SimplePatient | null = null;
        
        if (item.Patient && typeof item.Patient === 'object') {
          const patientData = item.Patient as Record<string, any>;
          patient = {
            firstName: patientData?.firstName || '',
            lastName: patientData?.lastName || ''
          };
        }
        
        return {
          id: item.id,
          patientId: item.patientId,
          consultationId: item.consultationId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus,
          Patient: patient
        } as Invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoices:", error);
      throw error;
    }
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Invoice")
          .select("*, Patient(firstName, lastName)")
          .eq("id", id)
          .maybeSingle()
      );
      
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
        const rawPatient = data.Patient as Record<string, any>;
        patientData = {
          firstName: rawPatient.firstName || '',
          lastName: rawPatient.lastName || ''
        };
      }
      
      // Return the properly typed invoice
      return {
        id: data.id,
        patientId: data.patientId,
        consultationId: data.consultationId,
        date: data.date,
        amount: data.amount,
        paymentStatus: data.paymentStatus,
        Patient: patientData
      } as Invoice;
    } catch (error) {
      console.error("Erreur getInvoiceById:", error);
      throw error;
    }
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      const query = addAuthHeaders(
        supabase
          .from("Invoice")
          .select("*, Patient(firstName, lastName)")
          .eq("patientId", patientId)
          .order('date', { ascending: false })
      );
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Transform data with explicit typing
      return (data || []).map(item => {
        let patient: SimplePatient | null = null;
        
        if (item.Patient && typeof item.Patient === 'object') {
          const patientData = item.Patient as Record<string, any>;
          patient = {
            firstName: patientData.firstName || '',
            lastName: patientData.lastName || ''
          };
        }
        
        return {
          id: item.id,
          patientId: item.patientId,
          consultationId: item.consultationId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus,
          Patient: patient
        } as Invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoicesByPatientId:", error);
      throw error;
    }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      // Préparer les données pour l'insertion sans Patient
      const insertData = {
        patientId: invoiceData.patientId,
        consultationId: invoiceData.consultationId,
        date: invoiceData.date,
        amount: invoiceData.amount,
        paymentStatus: invoiceData.paymentStatus
      };
      
      const query = addAuthHeaders(
        supabase
          .from("Invoice")
          .insert(insertData)
          .select()
          .single()
      );
      
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
      // Préparer les données pour la mise à jour sans Patient
      const updateData: Record<string, any> = {};
      
      if ('patientId' in invoiceData) updateData.patientId = invoiceData.patientId;
      if ('consultationId' in invoiceData) updateData.consultationId = invoiceData.consultationId;
      if ('date' in invoiceData) updateData.date = invoiceData.date;
      if ('amount' in invoiceData) updateData.amount = invoiceData.amount;
      if ('paymentStatus' in invoiceData) updateData.paymentStatus = invoiceData.paymentStatus;
      
      const query = addAuthHeaders(
        supabase
          .from("Invoice")
          .update(updateData)
          .eq("id", id)
          .select()
          .single()
      );
      
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
