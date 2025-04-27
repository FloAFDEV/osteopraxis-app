
import { Invoice, PaymentStatus } from "@/types";
import { USE_SUPABASE } from "./config";
import { supabaseInvoiceService } from "../supabase-api/invoice-service";

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
    
    // Mock implementation
    return [];
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
    
    // Mock implementation
    return undefined;
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.getInvoicesByPatientId(patientId);
      } catch (error) {
        console.error("Erreur Supabase getInvoicesByPatientId:", error);
        throw error;
      }
    }
    
    // Mock implementation
    return [];
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.getInvoicesByAppointmentId(appointmentId);
      } catch (error) {
        console.error("Erreur Supabase getInvoicesByAppointmentId:", error);
        throw error;
      }
    }
    
    // Mock implementation
    return [];
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.createInvoice(invoiceData);
      } catch (error) {
        console.error("Erreur Supabase createInvoice:", error);
        throw error;
      }
    }
    
    // Mock implementation
    return {
      id: Math.floor(Math.random() * 1000),
      ...invoiceData,
      date: new Date().toISOString(),
      paymentStatus: "PENDING"
    } as Invoice;
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice | undefined> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.updateInvoice(id, invoiceData);
      } catch (error) {
        console.error("Erreur Supabase updateInvoice:", error);
        throw error;
      }
    }
    
    // Mock implementation
    return { 
      id, 
      ...invoiceData 
    } as Invoice;
  },

  async deleteInvoice(id: number): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.deleteInvoice(id);
      } catch (error) {
        console.error("Erreur Supabase deleteInvoice:", error);
        throw error;
      }
    }
    
    // Mock implementation
    return true;
  }
};
