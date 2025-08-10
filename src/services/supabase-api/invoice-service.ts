import { Invoice, PaymentStatus } from "@/types";
import { supabase, SUPABASE_API_URL, SUPABASE_API_KEY } from "./utils";
import { corsHeaders } from "@/services/corsHeaders";
import { getCurrentOsteopathId } from "./utils/getCurrentOsteopath";

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      // Récupérer l'ID de l'ostéopathe connecté
      const osteopathId = await getCurrentOsteopathId();
      const { data: patients, error: patientError } = await supabase
        .from("Patient")
        .select("id")
        .eq("osteopathId", osteopathId);
      if (patientError) {
        console.error("Erreur de chargement des patients:", patientError);
        throw patientError;
      }
      if (!patients || patients.length === 0) {
        console.log("Aucun patient trouvé pour l'ostéopathe", osteopathId);
        return [];
      }
      const patientIds = patients.map(p => p.id);
      console.log(`Filtrage des factures pour ${patientIds.length} patients de l'ostéopathe ${osteopathId}`);

      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .in("patientId", patientIds)
        .order('date', { ascending: false });
      if (error) throw new Error(error.message);
      
      // Correction : toujours inclure cabinetId et osteopathId dans le mapping, jamais undefined
      return (data || []).map(item => {
        const invoice: Invoice = {
          id: item.id,
          patientId: item.patientId,
          cabinetId: item.cabinetId === null || typeof item.cabinetId === "undefined" ? null : Number(item.cabinetId),
          osteopathId: item.osteopathId === null || typeof item.osteopathId === "undefined" ? null : Number(item.osteopathId),
          appointmentId: item.appointmentId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus as PaymentStatus,
          paymentMethod: item.paymentMethod || undefined,
          notes: item.notes || undefined,
          createdAt: item.createdAt || undefined,
          updatedAt: item.updatedAt || undefined,
          tvaExoneration: item.tvaExoneration ?? true,
          tvaMotif: item.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI",
        };
        return invoice;
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

      const invoice: Invoice = {
        id: data.id,
        patientId: data.patientId,
        cabinetId: data.cabinetId === null || typeof data.cabinetId === "undefined" ? null : Number(data.cabinetId),
        osteopathId: data.osteopathId === null || typeof data.osteopathId === "undefined" ? null : Number(data.osteopathId),
        appointmentId: data.appointmentId,
        date: data.date,
        amount: data.amount,
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentMethod: data.paymentMethod || undefined,
        notes: data.notes || undefined,
        createdAt: data.createdAt || undefined,
        updatedAt: data.updatedAt || undefined,
        tvaExoneration: data.tvaExoneration ?? true,
        tvaMotif: data.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI",
      };
      return invoice;
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

      return (data || []).map(item => {
        const invoice: Invoice = {
          id: item.id,
          patientId: item.patientId,
          cabinetId: item.cabinetId === null || typeof item.cabinetId === "undefined" ? null : Number(item.cabinetId),
          osteopathId: item.osteopathId === null || typeof item.osteopathId === "undefined" ? null : Number(item.osteopathId),
          appointmentId: item.appointmentId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus as PaymentStatus,
          paymentMethod: item.paymentMethod || undefined,
          notes: item.notes || undefined,
          createdAt: item.createdAt || undefined,
          updatedAt: item.updatedAt || undefined,
          tvaExoneration: item.tvaExoneration ?? true,
          tvaMotif: item.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI",
        };
        return invoice;
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

      return (data || []).map(item => {
        const invoice: Invoice = {
          id: item.id,
          patientId: item.patientId,
          cabinetId: item.cabinetId === null || typeof item.cabinetId === "undefined" ? null : Number(item.cabinetId),
          osteopathId: item.osteopathId === null || typeof item.osteopathId === "undefined" ? null : Number(item.osteopathId),
          appointmentId: item.appointmentId,
          date: item.date,
          amount: item.amount,
          paymentStatus: item.paymentStatus as PaymentStatus,
          paymentMethod: item.paymentMethod || undefined,
          notes: item.notes || undefined,
          createdAt: item.createdAt || undefined,
          updatedAt: item.updatedAt || undefined,
          tvaExoneration: item.tvaExoneration ?? true,
          tvaMotif: item.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI",
        };
        return invoice;
      });
    } catch (error) {
      console.error("Erreur getInvoicesByAppointmentId:", error);
      throw error;
    }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      // Vérifier que le patient appartient bien à l'ostéopathe connecté
      const osteopathId = await getCurrentOsteopathId();
      
      const { data: patientCheck, error: patientError } = await supabase
        .from("Patient")
        .select("osteopathId")
        .eq("id", invoiceData.patientId)
        .maybeSingle();
        
      if (patientError || !patientCheck) {
        console.error("Patient introuvable ou erreur:", patientError);
        throw new Error("Patient introuvable");
      }
      
      if (patientCheck.osteopathId !== osteopathId) {
        console.error("Tentative d'accès non autorisé: le patient n'appartient pas à cet ostéopathe");
        throw new Error("Vous n'êtes pas autorisé à créer une facture pour ce patient");
      }
      
      // Si appointmentId est 0 ou null, le supprimer du payload pour éviter la contrainte de clé étrangère
      if (!invoiceData.appointmentId || invoiceData.appointmentId === 0) {
        delete (invoiceData as any).appointmentId;
      }
      
      // Préparer les données pour l'insertion en base (seulement les champs qui existent)
      const dataForDb = {
        patientId: invoiceData.patientId,
        cabinetId: invoiceData.cabinetId || undefined,
        appointmentId: invoiceData.appointmentId || undefined,
        amount: invoiceData.amount,
        date: invoiceData.date,
        paymentStatus: invoiceData.paymentStatus,
        paymentMethod: invoiceData.paymentMethod || undefined,
        notes: invoiceData.notes || undefined,
        tvaExoneration: invoiceData.tvaExoneration ?? true,
        tvaMotif: invoiceData.tvaMotif || "TVA non applicable - Article 261-4-1° du CGI",
        osteopathId: osteopathId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("Données à insérer en base:", dataForDb);
      
      const { data, error } = await supabase
        .from("Invoice")
        .insert(dataForDb)
        .select()
        .single();

      if (error) {
        console.error("[SUPABASE ERROR]", error.code, error.message);
        throw error;
      }

      // Retourner la facture avec tous les champs attendus par le frontend
      const invoice: Invoice = {
        id: data.id,
        patientId: data.patientId,
        cabinetId: data.cabinetId,
        appointmentId: data.appointmentId,
        date: data.date,
        amount: data.amount,
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        tvaExoneration: data.tvaExoneration,
        tvaMotif: data.tvaMotif,
      };

      return invoice;
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
        id: id,
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
      
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as Invoice;
      }
      if (data && typeof data === "object") {
        return data as Invoice;
      }
      
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
  },
  
  // Nouvelle méthode pour exporter les factures d'une période donnée (mois ou année)
  async exportInvoicesByPeriod(year: string, month: string | null = null): Promise<Invoice[]> {
    // Récupérer toutes les factures
    const allInvoices = await this.getInvoices();
    
    // Filtrer par année et mois si spécifié
    return allInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      const invoiceYear = invoiceDate.getFullYear().toString();
      
      // Si l'année ne correspond pas, exclure
      if (invoiceYear !== year) return false;
      
      // Si un mois est spécifié, vérifier la correspondance
      if (month !== null) {
        const invoiceMonth = (invoiceDate.getMonth() + 1).toString().padStart(2, '0');
        return invoiceMonth === month;
      }
      
      // Sinon, inclure toutes les factures de l'année
      return true;
    });
  }
};
