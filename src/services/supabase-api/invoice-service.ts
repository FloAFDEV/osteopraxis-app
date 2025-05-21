
import { Invoice } from "@/types";
import { supabase } from "./utils";
import { validateInvoiceData, removeNullProperties } from "./invoice-adapter";
import { getCurrentOsteopathId } from "./utils/getCurrentOsteopath";

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      console.log("Chargement des factures depuis Supabase");
      
      // Récupérer l'ID de l'ostéopathe connecté
      const osteopathId = await getCurrentOsteopathId();
      
      // Récupérer les factures pour cet ostéopathe
      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .eq("osteopathId", osteopathId)
        .order("date", { ascending: true });

      if (error) {
        console.error("Erreur de chargement des factures:", error);
        throw error;
      }

      console.log(`${data?.length || 0} factures chargées pour l'ostéopathe ${osteopathId}`);
      return (data || []) as Invoice[];
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    try {
      console.log(`Chargement de la facture ${id}`);
      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        console.log(`Facture avec l'id ${id} non trouvée`);
        return undefined;
      }

      return data as Invoice;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      console.log(`Chargement des factures pour le patient ${patientId}`);
      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .eq("patientId", patientId)
        .order("date", { ascending: true });

      if (error) throw error;

      return (data || []) as Invoice[];
    } catch (error) {
      console.error("Error fetching patient invoices:", error);
      throw error;
    }
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    try {
      console.log(`Chargement des factures pour le rendez-vous ${appointmentId}`);
      const { data, error } = await supabase
        .from("Invoice")
        .select("*")
        .eq("appointmentId", appointmentId)
        .order("date", { ascending: true });

      if (error) throw error;

      return (data || []) as Invoice[];
    } catch (error) {
      console.error("Error fetching appointment invoices:", error);
      throw error;
    }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      console.log("Création d'une nouvelle facture:", invoiceData);
      
      // Validation des données avant l'insertion
      const validatedData = validateInvoiceData(invoiceData);
      
      // Récupérer l'ID de l'ostéopathe connecté
      const osteopathId = await getCurrentOsteopathId();
      
      // Création de l'objet à insérer
      const insertData = {
        ...validatedData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ne pas inclure osteopathId dans l'insertion si ce n'est pas un champ valide
        // dans la table Invoice de Supabase
      };
      
      const { data, error } = await supabase
        .from("Invoice")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création de la facture:", error);
        throw error;
      }

      console.log("Facture créée avec succès:", data);
      return data as Invoice;
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    try {
      console.log(`Mise à jour de la facture ${id}:`, invoiceData);
      
      // Retirer les propriétés nulles de l'objet de mise à jour
      const cleanedData = removeNullProperties(invoiceData);
      
      const updateData = {
        ...cleanedData,
        updatedAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("Invoice")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la mise à jour de la facture:", error);
        throw error;
      }

      console.log("Facture mise à jour avec succès:", data);
      return data as Invoice;
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  },

  async deleteInvoice(id: number): Promise<boolean> {
    try {
      console.log(`Suppression de la facture ${id}`);
      const { error } = await supabase
        .from("Invoice")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erreur lors de la suppression de la facture:", error);
        throw error;
      }
      console.log(`Facture ${id} supprimée avec succès`);
      return true;
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }
};
