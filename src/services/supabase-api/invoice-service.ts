
import { Invoice, PaymentStatus } from "@/types";
import { supabase, typedData, SUPABASE_API_URL, SUPABASE_API_KEY } from "./utils";
import { corsHeaders } from "@/services/corsHeaders";

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
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
          appointmentId: item.appointmentId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus as PaymentStatus,
          paymentMethod: item.paymentMethod,
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
        appointmentId: data.appointmentId,
        date: data.date,
        amount: data.amount,
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentMethod: data.paymentMethod,
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
          appointmentId: item.appointmentId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus as PaymentStatus,
          paymentMethod: item.paymentMethod
        } as Invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoicesByPatientId:", error);
      throw error;
    }
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    try {
      const query = supabase
        .from("Invoice")
        .select("*")
        .eq("appointmentId", appointmentId)
        .order('date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // Transform data with explicit typing
      return (data || []).map(item => {
        return {
          id: item.id,
          patientId: item.patientId,
          appointmentId: item.appointmentId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus as PaymentStatus,
          paymentMethod: item.paymentMethod
        } as Invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoicesByAppointmentId:", error);
      throw error;
    }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const { id: _omit, createdAt: _createdAt, updatedAt: _updatedAt, ...dataToInsert } = invoiceData as any;
      
      // Si appointmentId est 0 ou null, le supprimer du payload pour éviter la contrainte de clé étrangère
      if (!dataToInsert.appointmentId || dataToInsert.appointmentId === 0) {
        delete dataToInsert.appointmentId;
      }
      
      const { data, error } = await supabase
        .from("Invoice")
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error("[SUPABASE ERROR]", error.code, error.message);
        throw error;
      }

      return data as Invoice;
    } catch (error) {
      console.error("Erreur createInvoice:", error);
      throw error;
    }
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    try {
      // 1. Récupérer le token d'authentification utilisateur
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Utilisateur non authentifié");
      }
      const token = session.access_token;

      // 2. Utiliser REST pour contourner les problèmes CORS
      if (!SUPABASE_API_URL || !SUPABASE_API_KEY) {
        throw new Error("Configuration Supabase manquante (URL ou clé API)");
      }

      const URL_ENDPOINT = `${SUPABASE_API_URL}/rest/v1/Invoice?id=eq.${id}`;
      
      // Si appointmentId est 0 ou null, le supprimer du payload pour éviter la contrainte de clé étrangère
      if (invoiceData.appointmentId === 0 || invoiceData.appointmentId === null) {
        delete invoiceData.appointmentId;
      }
      
      // 3. Préparer le payload avec l'ID inclus
      const updatePayload = {
        id: id, // Important: inclure l'ID dans le corps
        ...invoiceData,
        updatedAt: new Date().toISOString(),
      };

      // 4. Nettoyer les valeurs undefined
      Object.keys(updatePayload).forEach(
        (k) => updatePayload[k] === undefined && delete updatePayload[k]
      );

      console.log("Payload de mise à jour de la facture:", updatePayload);

      // 5. Utiliser PUT au lieu de PATCH
      const res = await fetch(URL_ENDPOINT, {
        method: "PUT",
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
          ...corsHeaders
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Erreur HTTP ${res.status}:`, errorText);
        throw new Error(`Erreur lors de la mise à jour de la facture: ${res.status}`);
      }

      // Traiter la réponse
      const data = await res.json();
      console.log("Réponse de mise à jour de la facture:", data);
      
      if (Array.isArray(data) && data.length > 0) return data[0];
      if (data && typeof data === "object") return data as Invoice;
      
      throw new Error("Aucune donnée retournée lors de la mise à jour de la facture");
    } catch (error) {
      console.error("Erreur updateInvoice:", error);
      throw error;
    }
  },
  
  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Invoice | undefined> {
    return this.updateInvoice(id, { paymentStatus });
  },
  
  async deleteInvoice(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("Invoice")
        .delete()
        .eq("id", id);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      console.error("Erreur deleteInvoice:", error);
      throw error;
    }
  }
};
