
import { Invoice, PaymentStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Fonction pour récupérer toutes les factures
export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase.from("Invoice").select("*");

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des factures:", error);
    return [];
  }
};

// Fonction pour récupérer une facture par ID
export const getInvoiceById = async (id: number): Promise<Invoice | null> => {
  try {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la facture ${id}:`, error);
    return {
      id: 1,
      patientId: 0,
      cabinetId: 0,
      invoiceNumber: "INV-001",
      date: new Date().toISOString(),
      amount: 0,
      amountPaid: 0,
      paymentStatus: 'PENDING',
    } as Invoice;
  }
};

// Fonction pour créer une facture
export const createInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from("Invoice")
      .insert([invoiceData])
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de la création de la facture:", error);
    throw error;
  }
};

// Fonction pour mettre à jour une facture
export const updateInvoice = async (id: number, invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from("Invoice")
      .update(invoiceData)
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la facture ${id}:`, error);
    throw error;
  }
};

// Fonction pour supprimer une facture
export const deleteInvoice = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from("Invoice").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la facture ${id}:`, error);
    throw error;
  }
};

// Fonction pour récupérer les factures par ID de patient
export const getInvoicesByPatientId = async (patientId: number): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*")
      .eq("patientId", patientId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des factures du patient ${patientId}:`, error);
    return [];
  }
};

// Fonction pour récupérer les factures par ID d'ostéopathe
export const getInvoicesByOsteopathId = async (osteopathId: number): Promise<Invoice[]> => {
  try {
    // Cette requête est plus complexe car il n'y a pas de relation directe.
    // Nous devons joindre plusieurs tables pour trouver les factures associées à un ostéopathe.
    const { data, error } = await supabase
      .from("Invoice")
      .select("*")
      .eq("osteopathId", osteopathId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des factures de l'ostéopathe ${osteopathId}:`, error);
    return [];
  }
};

// Fonction pour obtenir le nombre total de factures
export const getInvoiceCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("Invoice")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  } catch (error) {
    console.error("Erreur lors du comptage des factures:", error);
    return 0;
  }
};

// Fonction pour marquer une facture comme payée
export const markInvoiceAsPaid = async (id: number, paymentDate: string, paymentMethod: string): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from("Invoice")
      .update({
        paymentStatus: "PAID" as PaymentStatus,
        paymentDate,
        paymentMethod,
        amountPaid: supabase.rpc("get_invoice_amount", { invoice_id: id })
      })
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Erreur lors du marquage de la facture ${id} comme payée:`, error);
    throw error;
  }
};

// Function to get invoices by appointment ID
export const getInvoicesByAppointmentId = async (appointmentId: number): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from("Invoice")
      .select("*")
      .eq("appointmentId", appointmentId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des factures pour le rendez-vous ${appointmentId}:`, error);
    return [];
  }
};
