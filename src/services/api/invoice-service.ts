
import { Invoice, PaymentStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .select('*');
        
      if (error) throw new Error(error.message);
      return data as Invoice[];
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return [];
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
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      
      return data as Invoice;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      return null;
    }
  },
  
  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .insert(invoice)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data as Invoice;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  },
  
  async updateInvoice(id: number, update: Partial<Invoice>): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .update(update)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data as Invoice;
    } catch (error) {
      console.error(`Error updating invoice ${id}:`, error);
      throw error;
    }
  },
  
  async deleteInvoice(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('Invoice')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error(`Error deleting invoice ${id}:`, error);
      return false;
    }
  },
  
  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .select('*')
        .eq('patientId', patientId);
        
      if (error) throw new Error(error.message);
      return data as Invoice[];
    } catch (error) {
      console.error(`Error fetching invoices for patient ${patientId}:`, error);
      return [];
    }
  },
  
  async getInvoicesByOsteopathId(osteopathId: number): Promise<Invoice[]> {
    // In a real implementation, we'd join with patients or appointments
    // For now, just return all invoices as a mock
    return this.getInvoices();
  },
  
  async getInvoiceCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('Invoice')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw new Error(error.message);
      return count || 0;
    } catch (error) {
      console.error("Error counting invoices:", error);
      return 0;
    }
  },
  
  async markInvoiceAsPaid(id: number): Promise<Invoice> {
    return this.updateInvoice(id, { paymentStatus: 'PAID' });
  },
  
  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('Invoice')
        .select('*')
        .eq('appointmentId', appointmentId);
        
      if (error) throw new Error(error.message);
      return data as Invoice[];
    } catch (error) {
      console.error(`Error fetching invoices for appointment ${appointmentId}:`, error);
      return [];
    }
  }
};

// Export individual functions for the API module
export const getInvoices = async (): Promise<Invoice[]> => {
  return invoiceService.getInvoices();
};

export const getInvoiceById = async (id: number): Promise<Invoice | null> => {
  return invoiceService.getInvoiceById(id);
};

export const createInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
  return invoiceService.createInvoice(invoice);
};

export const updateInvoice = async (id: number, update: Partial<Invoice>): Promise<Invoice> => {
  return invoiceService.updateInvoice(id, update);
};

export const deleteInvoice = async (id: number): Promise<boolean> => {
  return invoiceService.deleteInvoice(id);
};

export const getInvoicesByPatientId = async (patientId: number): Promise<Invoice[]> => {
  return invoiceService.getInvoicesByPatientId(patientId);
};

export const getInvoicesByOsteopathId = async (osteopathId: number): Promise<Invoice[]> => {
  return invoiceService.getInvoicesByOsteopathId(osteopathId);
};

export const getInvoiceCount = async (): Promise<number> => {
  return invoiceService.getInvoiceCount();
};

export const markInvoiceAsPaid = async (id: number): Promise<Invoice> => {
  return invoiceService.markInvoiceAsPaid(id);
};

export const getInvoicesByAppointmentId = async (appointmentId: number): Promise<Invoice[]> => {
  return invoiceService.getInvoicesByAppointmentId(appointmentId);
};
