
import { patientService } from './patient-service';
import { appointmentService } from './appointment-service';
import { cabinetService } from './cabinet-service';
import { osteopathService } from './osteopath-service';
import { authService } from './auth-service';
import { USE_SUPABASE } from './config';
import { supabaseInvoiceService } from '../supabase-api/invoice-service';

// API principale
export const api = {
  ...patientService,
  ...appointmentService,
  ...cabinetService,
  ...osteopathService,
  ...authService,
  
  // Service de facturation (directement depuis Supabase)
  getInvoices: () => {
    if (USE_SUPABASE) {
      return supabaseInvoiceService.getInvoices();
    }
    throw new Error("Fonctionnalité de facturation non disponible en mode local");
  },
  
  getInvoiceById: (id: number) => {
    if (USE_SUPABASE) {
      return supabaseInvoiceService.getInvoiceById(id);
    }
    throw new Error("Fonctionnalité de facturation non disponible en mode local");
  },
  
  getInvoicesByPatientId: (patientId: number) => {
    if (USE_SUPABASE) {
      return supabaseInvoiceService.getInvoicesByPatientId(patientId);
    }
    throw new Error("Fonctionnalité de facturation non disponible en mode local");
  },
  
  createInvoice: (invoiceData: any) => {
    if (USE_SUPABASE) {
      return supabaseInvoiceService.createInvoice(invoiceData);
    }
    throw new Error("Fonctionnalité de facturation non disponible en mode local");
  },
  
  updateInvoice: (id: number, invoiceData: any) => {
    if (USE_SUPABASE) {
      return supabaseInvoiceService.updateInvoice(id, invoiceData);
    }
    throw new Error("Fonctionnalité de facturation non disponible en mode local");
  },
  
  updatePaymentStatus: (id: number, paymentStatus: 'PAID' | 'PENDING' | 'CANCELED') => {
    if (USE_SUPABASE) {
      return supabaseInvoiceService.updatePaymentStatus(id, paymentStatus);
    }
    throw new Error("Fonctionnalité de facturation non disponible en mode local");
  }
};
