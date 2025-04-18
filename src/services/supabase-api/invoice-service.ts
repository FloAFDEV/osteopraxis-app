import { supabase } from "./utils";
import { Invoice, PaymentStatus } from "@/types";

// Helper function to adapt Invoice data from Supabase
const adaptInvoiceFromSupabase = (data: any): Invoice => ({
  id: data.id,
  patientId: data.patientId,
  consultationId: data.consultationId,
  amount: data.amount,
  date: data.date,
  paymentStatus: data.paymentStatus,
  tvaExoneration: data.tvaExoneration,
  tvaMotif: data.tvaMotif
});

export const supabaseInvoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .select('*');

      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }

      return (data || []).map(adaptInvoiceFromSupabase);
    } catch (error) {
      console.error('Error in getInvoices:', error);
      throw error;
    }
  },

  async getInvoiceById(id: number): Promise<Invoice | null> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching invoice by id:', error);
        throw error;
      }

      return adaptInvoiceFromSupabase(data);
    } catch (error) {
      console.error('Error in getInvoiceById:', error);
      throw error;
    }
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .select('*')
        .eq('patientId', patientId);

      if (error) {
        console.error('Error fetching invoices by patientId:', error);
        throw error;
      }

      return (data || []).map(adaptInvoiceFromSupabase);
    } catch (error) {
      console.error('Error in getInvoicesByPatientId:', error);
      throw error;
    }
  },

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const invoiceData = {
        patientId: invoice.patientId,
        consultationId: invoice.consultationId,
        amount: invoice.amount,
        date: invoice.date,
        paymentStatus: invoice.paymentStatus,
        tvaExoneration: invoice.tvaExoneration,
        tvaMotif: invoice.tvaMotif
      };
      
      const { data, error } = await supabase
        .from('Invoice')
        .insert(invoiceData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
      
      return adaptInvoiceFromSupabase(data);
    } catch (error) {
      console.error('Error in createInvoice:', error);
      throw error;
    }
  },

  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice | undefined> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .update(invoice)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating invoice:', error);
        throw error;
      }

      return data ? adaptInvoiceFromSupabase(data) : undefined;
    } catch (error) {
      console.error('Error in updateInvoice:', error);
      throw error;
    }
  },

  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Invoice | undefined> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .update({ paymentStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }

      return data ? adaptInvoiceFromSupabase(data) : undefined;
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  },

  async deleteInvoice(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Invoice')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      throw error;
    }
  }
};

export default supabaseInvoiceService;
