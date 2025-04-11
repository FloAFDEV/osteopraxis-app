
import { patientService } from './patient-service';
import { appointmentService } from './appointment-service';
import { cabinetService } from './cabinet-service';
import { osteopathService } from './osteopath-service';
import { authService } from './auth-service';
import { USE_SUPABASE } from './config';
import { supabaseInvoiceService } from '../supabase-api/invoice-service';

// API principale
export const api = {
  // Services existants
  ...patientService,
  ...appointmentService,
  ...cabinetService,
  ...osteopathService,
  ...authService,
  
  // Méthodes de cabinet (ajoutées ou modifiées)
  getCabinets: cabinetService.getCabinets,
  getCabinetById: cabinetService.getCabinetById,
  getCabinetsByOsteopathId: cabinetService.getCabinetsByOsteopathId,
  createCabinet: cabinetService.createCabinet,
  updateCabinet: cabinetService.updateCabinet,
  deleteCabinet: cabinetService.deleteCabinet,
  
  // Service de facturation (directement depuis Supabase)
  getInvoices: async () => {
    if (USE_SUPABASE) {
      try {
        return await supabaseInvoiceService.getInvoices();
      } catch (error) {
        console.error("Erreur lors de la récupération des factures:", error);
        throw error;
      }
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
