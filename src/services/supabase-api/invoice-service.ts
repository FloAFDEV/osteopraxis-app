import { Invoice, PaymentStatus } from "@/types";
import { supabase } from "./utils";
import { corsHeaders } from "@/services/corsHeaders";

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return [];
      }

      // Now get invoices for this osteopath by getting patients first
      const { data: patients, error: patientsError } = await supabase
        .from("Patient")
        .select("id")
        .eq("osteopathId", userData.osteopathId);

      if (patientsError) {
        throw patientsError;
      }

      if (!patients || patients.length === 0) {
        return [];
      }

      // Extract patient IDs
      const patientIds = patients.map(p => p.id);

      // Now get invoices for these patients
      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .in("patientId", patientIds)
        .order("date", { ascending: false });

      if (error) throw error;
      
      return data as Invoice[];
    } catch (error) {
      console.error("Error in getInvoices:", error);
      throw error;
    }
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return undefined;
      }

      // Get the invoice
      const { data, error } = await supabase
        .from("Invoice")
        .select("*, Patient(osteopathId)")
        .eq("id", id)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          return undefined;
        }
        throw new Error(error.message);
      }
      
      // Verify this invoice belongs to the current osteopath
      if (data.Patient?.osteopathId !== userData.osteopathId) {
        console.error("Invoice does not belong to the current osteopath");
        return undefined;
      }
      
      return data as Invoice;
    } catch (error) {
      console.error("Error in getInvoiceById:", error);
      throw error;
    }
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      // First get the current user's osteopath ID
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      // Get the user's osteopathId
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("osteopathId")
        .eq("id", session.session.user.id)
        .single();

      if (userError || !userData || !userData.osteopathId) {
        console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
        return [];
      }

      // Verify this patient belongs to the current osteopath
      const { data: patient, error: patientError } = await supabase
        .from("Patient")
        .select("osteopathId")
        .eq("id", patientId)
        .single();

      if (patientError || !patient || patient.osteopathId !== userData.osteopathId) {
        console.error("Patient does not belong to the current osteopath");
        return [];
      }

      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .eq("patientId", patientId);
      
      if (error) throw new Error(error.message);
      
      return (data || []) as Invoice[];
    } catch (error) {
      console.error("Error in getInvoicesByPatientId:", error);
      throw error;
    }
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*")
      .eq("appointmentId", appointmentId);
      
    if (error) throw new Error(error.message);
    
    return (data || []) as Invoice[];
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    const { data, error } = await supabase
      .from("Invoice")
      .insert(invoiceData)
      .single();

    if (error) {
      console.error("[SUPABASE ERROR]", error.code, error.message);
      throw error;
    }

    return data as Invoice;
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    try {
      console.log(`Mise à jour de la facture ${id}:`, invoiceData);

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
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Configuration Supabase manquante (URL ou clé API)");
      }

      const URL_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/Invoice?id=eq.${id}`;

      // 3. Préparer le payload avec l'ID inclus
      const updatePayload = {
        id: id, // Important: inclure l'ID dans le corps pour les requêtes PATCH/PUT
        ...invoiceData,
        updatedAt: new Date().toISOString(),
      };

      // 4. Nettoyer les valeurs undefined
      Object.keys(updatePayload).forEach(
        (k) => updatePayload[k] === undefined && delete updatePayload[k]
      );

      console.log("Payload de mise à jour:", updatePayload);

      // 5. Utiliser PUT au lieu de PATCH
      const res = await fetch(URL_ENDPOINT, {
        method: "PUT",
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
      console.log("Réponse de mise à jour:", data);
      
      // Éviter d'afficher le toast ici pour éviter les doubles toasts
      // Le composant qui appelle cette fonction affichera le toast

      if (Array.isArray(data) && data.length > 0) return data[0];
      if (data && typeof data === "object") return data as Invoice;
      throw new Error("Aucune donnée retournée lors de la mise à jour de la facture");
    } catch (error) {
      console.error("[SUPABASE ERROR]", error);
      throw error;
    }
  },

  async deleteInvoice(id: number): Promise<boolean> {
    const { error } = await supabase
      .from("Invoice")
      .delete()
      .eq("id", id);
      
    if (error) throw new Error(error.message);

    return true;
  }
};
