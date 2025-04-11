
import { Invoice, PaymentStatus } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseInvoiceService } from "../supabase-api/invoice-service";

// Simulated data for invoices
const invoices: Invoice[] = [
  {
    id: 1,
    patientId: 1,
    consultationId: 1,
    amount: 50,
    date: new Date().toISOString(),
    paymentStatus: "PENDING",
    Patient: {
      firstName: "Jean",
      lastName: "Dupont"
    }
  }
];

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.getInvoices();
      } catch (error) {
        console.error("Erreur Supabase getInvoices:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    return [...invoices];
  },
  
  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.getInvoiceById(id);
      } catch (error) {
        console.error("Erreur Supabase getInvoiceById:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    return invoices.find(invoice => invoice.id === id);
  },
  
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'Patient'>): Promise<Invoice> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.createInvoice(invoiceData);
      } catch (error) {
        console.error("Erreur Supabase createInvoice:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(400);
    const newInvoice = {
      ...invoiceData,
      id: invoices.length + 1
    } as Invoice;
    
    invoices.push(newInvoice);
    return newInvoice;
  },
  
  async updatePaymentStatus(id: number, status: PaymentStatus): Promise<Invoice | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.updatePaymentStatus(id, status);
      } catch (error) {
        console.error("Erreur Supabase updatePaymentStatus:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(300);
    const index = invoices.findIndex(i => i.id === id);
    if (index !== -1) {
      invoices[index].paymentStatus = status;
      return invoices[index];
    }
    return undefined;
  }
};
