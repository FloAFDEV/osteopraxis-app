
import { Invoice } from "@/types";

/**
 * Ensures invoice notes are always a string
 * @param notes 
 */
export const ensureNotes = (notes: string | null | undefined): string => {
  return notes || "";
};

/**
 * Ensures a date is in the correct format
 * @param date 
 */
export const ensureDate = (date: string | Date | null | undefined): string => {
  if (!date) {
    return new Date().toISOString();
  }
  
  if (typeof date === 'string') {
    return date;
  }
  
  return date.toISOString();
};

/**
 * Formats a date for display
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Définition d'un type pour les données d'insertion de facture conforme au schéma Supabase
 * Cela évite les erreurs d'instantiation de type trop profondes
 */
export type InvoiceInsertData = {
  amount: number;
  patientId: number;
  appointmentId?: number | null;
  date?: string;
  notes?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: "PAID" | "PENDING" | "CANCELED";
  tvaExoneration?: boolean | null;
  tvaMotif?: string | null;
};

/**
 * Convertit un InvoiceStatus en PaymentStatus compatible
 */
export const convertStatusToPaymentStatus = (status: "DRAFT" | "SENT" | "PAID" | "CANCELED" | undefined): "PAID" | "PENDING" | "CANCELED" => {
  if (!status) return "PENDING";
  
  switch (status) {
    case "PAID": return "PAID";
    case "CANCELED": return "CANCELED";
    case "DRAFT":
    case "SENT":
    default:
      return "PENDING";
  }
};

/**
 * Validates invoice data before saving
 */
export const validateInvoiceData = (data: Partial<Invoice>): InvoiceInsertData => {
  // Make sure required fields are present
  if (!data.patientId) {
    throw new Error("Le patient est requis");
  }
  
  if (data.amount === undefined && data.totalAmount === undefined) {
    throw new Error("Le montant est requis");
  }
  
  // Ensure date is properly set
  const date = ensureDate(data.date);
  
  // Ensure notes is a string
  const notes = ensureNotes(data.notes);
  
  // Convertir le status en paymentStatus compatible
  const paymentStatus = convertStatusToPaymentStatus(data.status);
  
  // Utiliser amount ou totalAmount (ils sont synonymes dans l'application)
  const amount = data.amount !== undefined ? data.amount : (data.totalAmount || 0);
  
  // Créer un objet conforme au schéma de la table Invoice dans Supabase
  const insertData: InvoiceInsertData = {
    patientId: data.patientId,
    amount: amount,
    date,
    notes,
    appointmentId: data.appointmentId || null,
    paymentMethod: data.paymentMethod || null,
    paymentStatus
  };
  
  if (data.tvaExoneration !== undefined) {
    insertData.tvaExoneration = data.tvaExoneration;
  }
  
  if (data.tvaMotif !== undefined) {
    insertData.tvaMotif = data.tvaMotif;
  }
  
  return insertData;
};

/**
 * Removes null properties from an object
 */
export const removeNullProperties = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const result: Partial<T> = {};
  
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  
  return result;
};
