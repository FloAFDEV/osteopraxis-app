import { Invoice, PaymentStatus } from "@/types";
import { supabase, SUPABASE_API_URL, SUPABASE_API_KEY } from "./utils";
import { corsHeaders } from "@/services/corsHeaders";
import { getCurrentOsteopathId } from "./utils/getCurrentOsteopath";

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      // Récupérer l'ID de l'ostéopathe connecté
      const osteopathId = await getCurrentOsteopathId();
      
      // Récupérer d'abord les patients liés à cet ostéopathe
      const { data: patients, error: patientError } = await supabase
        .from("Patient")
        .select("id")
        .eq("osteopathId", osteopathId);
        
      if (patientError) {
        console.error("Erreur de chargement des patients:", patientError);
        throw patientError;
      }
      
      // Si aucun patient trouvé, retourner un tableau vide
      if (!patients || patients.length === 0) {
        console.log("Aucun patient trouvé pour l'ostéopathe", osteopathId);
        return [];
      }
      
      // Extraire les IDs de patients pour le filtre
      const patientIds = patients.map(p => p.id);
      console.log(`Filtrage des factures pour ${patientIds.length} patients de l'ostéopathe ${osteopathId}`);

      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .in("patientId", patientIds)
        .order('date', { ascending: false });
      
      if (error) throw new Error(error.message);
      
      // Transform data with explicit typing and add missing fields
      return (data || []).map(item => {
        const invoice: Invoice = {
          id: item.id,
          patientId: item.patientId,
          cabinetId: 1, // Default value
          osteopathId: osteopathId, // Use connected osteopath ID
          appointmentId: item.appointmentId,
          date: item.date,
          // Fix for the invoice number property
          number: item.number || `INV-${item.id}`,
          // Fix for the status property - use 'CANCELLED' instead of 'CANCELED'
          status: item.paymentStatus === 'CANCELED' ? 'CANCELLED' : item.paymentStatus || "DRAFT",
          totalAmount: item.amount,
          amount: item.amount, // Alias for compatibility
          // Fix for paymentStatus property
          paymentStatus: item.paymentStatus as PaymentStatus,
          // Fix for paymentDate property
          paymentDate: item.paymentDate || null,
          paymentMethod: item.paymentMethod || null,
          notes: item.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tvaExoneration: item.tvaExoneration || true,
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
      
      // Get connected osteopath ID
      const osteopathId = await getCurrentOsteopathId();
      
      // Return the properly typed invoice with all required fields
      const invoice: Invoice = {
        id: data.id,
        patientId: data.patientId,
        cabinetId: data.cabinetId || 1,
        osteopathId: data.osteopathId || osteopathId,
        appointmentId: data.appointmentId,
        date: data.date,
        number: data.number || `INV-${data.id}`,
        // Fix for status property value
        status: data.paymentStatus === 'CANCELED' ? 'CANCELLED' : data.paymentStatus || "DRAFT",
        totalAmount: data.amount,
        amount: data.amount, // Alias for compatibility
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentDate: data.paymentDate || null,
        paymentMethod: data.paymentMethod || null,
        notes: data.notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tvaExoneration: data.tvaExoneration || true,
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
      
      // Get connected osteopath ID
      const osteopathId = await getCurrentOsteopathId();
      
      // Transform data with explicit typing and add missing fields
      return (data || []).map(item => {
        const invoice: Invoice = {
          id: item.id,
          patientId: item.patientId,
          cabinetId: item.cabinetId || 1,
          osteopathId: item.osteopathId || osteopathId,
          appointmentId: item.appointmentId,
          date: item.date,
          number: item.number || `INV-${item.id}`,
          // Fix for status property value
          status: item.paymentStatus === 'CANCELED' ? 'CANCELLED' : item.paymentStatus || "DRAFT",
          totalAmount: item.amount,
          amount: item.amount, // Alias for compatibility
          paymentStatus: item.paymentStatus as PaymentStatus,
          paymentDate: item.paymentDate || null,
          paymentMethod: item.paymentMethod || null,
          notes: item.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tvaExoneration: item.tvaExoneration || true,
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
      
      // Get connected osteopath ID
      const osteopathId = await getCurrentOsteopathId();
      
      // Transform data with explicit typing
      return (data || []).map(item => {
        const invoice: Invoice = {
          id: item.id,
          patientId: item.patientId,
          cabinetId: item.cabinetId || 1,
          osteopathId: item.osteopathId || osteopathId,
          appointmentId: item.appointmentId,
          date: item.date,
          number: item.number || `INV-${item.id}`,
          // Fix for status property value
          status: item.paymentStatus === 'CANCELED' ? 'CANCELLED' : item.paymentStatus || "DRAFT",
          totalAmount: item.amount,
          amount: item.amount, // Alias for compatibility
          paymentStatus: item.paymentStatus as PaymentStatus,
          paymentDate: item.paymentDate || null,
          paymentMethod: item.paymentMethod || null,
          notes: item.notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tvaExoneration: item.tvaExoneration || true,
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
      const { id: _omit, createdAt: _createdAt, updatedAt: _updatedAt, ...dataToInsert } = invoiceData as any;
      
      // Vérifier que le patient appartient bien à l'ostéopathe connecté
      const osteopathId = await getCurrentOsteopathId();
      
      const { data: patientCheck, error: patientError } = await supabase
        .from("Patient")
        .select("osteopathId")
        .eq("id", dataToInsert.patientId)
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
      if (!dataToInsert.appointmentId || dataToInsert.appointmentId === 0) {
        delete dataToInsert.appointmentId;
      }
      
      // Assurons-nous que tous les champs requis sont présents
      const dataWithDefaults = {
        ...dataToInsert,
        cabinetId: dataToInsert.cabinetId || 1,
        osteopathId: dataToInsert.osteopathId || osteopathId,
        number: dataToInsert.number || `INV-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("Invoice")
        .insert(dataWithDefaults)
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
