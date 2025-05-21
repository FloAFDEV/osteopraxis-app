
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
 * Validates invoice data before saving
 */
export const validateInvoiceData = (data: Partial<Invoice>): Partial<Invoice> => {
  // Make sure required fields are present
  if (!data.patientId) {
    throw new Error("Le patient est requis");
  }
  
  if (data.amount === undefined || data.amount === null) {
    throw new Error("Le montant est requis");
  }
  
  // Ensure date is properly set
  const date = ensureDate(data.date);
  
  // Ensure notes is a string
  const notes = ensureNotes(data.notes);
  
  return {
    ...data,
    date,
    notes,
  };
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
