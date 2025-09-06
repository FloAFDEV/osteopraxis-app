import { Invoice, PaymentStatus } from "@/types";
import { USE_SUPABASE } from "./config";
import { supabaseInvoiceService } from "../supabase-api/invoice-service";
import { getCurrentOsteopathId, isInvoiceOwnedByCurrentOsteopath, isPatientOwnedByCurrentOsteopath } from "../supabase-api/utils/getCurrentOsteopath";
import { SecurityViolationError } from "./appointment-service";
import { hdsPatientService } from "@/services/hds-local-storage";

// Hook pour accéder au contexte démo depuis les services
let demoContext: any = null;
export const setDemoContext = (context: any) => {
  demoContext = context;
};

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Mode démo: Filtrage des données Invoice pour ne montrer que les données démo');
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      // S'assurer qu'une session démo existe
      if (!demoLocalStorage.isSessionActive()) {
        console.log('🎭 Aucune session démo active, création d\'une nouvelle session');
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      return demoLocalStorage.getInvoices();
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      return [...demoContext.demoData.invoices];
    }

    if (USE_SUPABASE) {
      try {
        // En mode connecté, utiliser le service HDS local pour les factures
        const { hdsInvoiceService } = await import('@/services/hds-local-storage');
        return await hdsInvoiceService.getInvoices();
      } catch (error) {
        console.error("Erreur HDS getInvoices:", error);
        throw error;
      }
    }
    return [];
  },

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("getInvoiceById appelé avec un ID invalide:", id);
      return undefined;
    }

    // Démo: lecture locale
    if (demoContext?.isDemoMode) {
      return demoContext.demoData.invoices.find((inv: Invoice) => inv.id === id);
    }

    if (USE_SUPABASE) {
      try {
        const { hdsInvoiceService } = await import('@/services/hds-local-storage');
        const res = await hdsInvoiceService.getInvoiceById(id);
        return res || undefined;
      } catch (error) {
        console.error("Erreur HDS getInvoiceById:", error);
        throw error;
      }
    }
    return undefined;
  },

  async getInvoicesByPatientId(patientId: number): Promise<Invoice[]> {
    if (!patientId || isNaN(patientId) || patientId <= 0) {
      console.warn("getInvoicesByPatientId appelé avec un ID patient invalide:", patientId);
      return [];
    }

    // Démo: lecture locale
    if (demoContext?.isDemoMode) {
      return demoContext.demoData.invoices.filter((inv: Invoice) => inv.patientId === patientId);
    }

    if (USE_SUPABASE) {
      try {
        const { hdsInvoiceService } = await import('@/services/hds-local-storage');
        return await hdsInvoiceService.getInvoicesByPatientId(patientId);
      } catch (error) {
        console.error("Erreur HDS getInvoicesByPatientId:", error);
        throw error;
      }
    }
    return [];
  },

  async getInvoicesByAppointmentId(appointmentId: number): Promise<Invoice[]> {
    if (!appointmentId || isNaN(appointmentId) || appointmentId <= 0) {
      console.warn("getInvoicesByAppointmentId appelé avec un ID rendez-vous invalide:", appointmentId);
      return [];
    }

    // Démo: lecture locale
    if (demoContext?.isDemoMode) {
      return demoContext.demoData.invoices.filter((inv: Invoice) => inv.appointmentId === appointmentId);
    }

    if (USE_SUPABASE) {
      try {
        const { hdsInvoiceService } = await import('@/services/hds-local-storage');
        return await hdsInvoiceService.getInvoicesByAppointmentId(appointmentId);
      } catch (error) {
        console.error("Erreur HDS getInvoicesByAppointmentId:", error);
        throw error;
      }
    }
    return [];
  },

  async createInvoice(invoiceData: Partial<Invoice> & { osteopathId?: number }): Promise<Invoice> {
    // Vérifier d'abord le mode démo éphémère local
    const { isDemoSession } = await import('@/utils/demo-detection');
    const isDemoMode = await isDemoSession();
    
    if (isDemoMode) {
      console.log('🎭 Création facture en session démo locale');
      // Mode démo éphémère: utiliser le stockage local temporaire
      const { demoLocalStorage } = await import('@/services/demo-local-storage');
      
      // S'assurer qu'une session démo existe
      if (!demoLocalStorage.isSessionActive()) {
        console.log('🎭 Aucune session démo active pour la facture, création d\'une nouvelle session');
        demoLocalStorage.createSession();
        demoLocalStorage.seedDemoData();
      }
      
      // Assurer les valeurs par défaut pour le mode démo
      const demoInvoiceData = {
        amount: invoiceData.amount ?? 0,
        paymentStatus: (invoiceData.paymentStatus ?? "PENDING") as PaymentStatus,
        date: (invoiceData.date as any) ?? new Date().toISOString(),
        notes: invoiceData.notes ?? null,
        paymentMethod: invoiceData.paymentMethod ?? null,
        patientId: invoiceData.patientId!,
        appointmentId: invoiceData.appointmentId ?? null,
        osteopathId: 999, // ID factice pour le mode démo
        cabinetId: invoiceData.cabinetId ?? 1, // Cabinet démo par défaut
        tvaExoneration: true,
        tvaMotif: 'TVA non applicable - Article 261-4-1° du CGI'
      };
      
      console.log('🎭 Création facture avec données:', demoInvoiceData);
      const createdInvoice = demoLocalStorage.addInvoice(demoInvoiceData);
      console.log('🎭 Facture créée en mode démo:', createdInvoice);
      return createdInvoice;
    }

    // Fallback vers ancien contexte démo si présent
    if (demoContext?.isDemoMode) {
      const now = new Date().toISOString();
      const nextId = Math.max(0, ...demoContext.demoData.invoices.map((i: Invoice) => i.id)) + 1;
      const toCreate: Invoice = {
        id: nextId,
        amount: invoiceData.amount ?? 0,
        paymentStatus: (invoiceData.paymentStatus ?? "PENDING") as PaymentStatus,
        date: (invoiceData.date as any) ?? now,
        notes: invoiceData.notes ?? null,
        paymentMethod: invoiceData.paymentMethod ?? null,
        patientId: invoiceData.patientId!,
        appointmentId: invoiceData.appointmentId ?? null,
        osteopathId: invoiceData.osteopathId ?? demoContext.demoData.osteopath.id,
        cabinetId: invoiceData.cabinetId ?? demoContext.demoData.cabinets[0]?.id ?? null,
        createdAt: now as any,
        updatedAt: now as any,
        tvaExoneration: true,
        tvaMotif: 'TVA non applicable - Article 261-4-1° du CGI'
      } as Invoice;
      demoContext.addDemoInvoice({ ...(toCreate as any), id: undefined });
      return toCreate;
    }

    if (USE_SUPABASE) {
      try {
        const { hdsInvoiceService } = await import('@/services/hds-local-storage');
        let dataToSend = { ...invoiceData } as any;
        if (!dataToSend.osteopathId) {
          dataToSend.osteopathId = await getCurrentOsteopathId();
        }
        const created = await hdsInvoiceService.createInvoice(dataToSend);
        return created;
      } catch (error) {
        console.error("Erreur HDS createInvoice:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    throw new Error("Service facture indisponible");
  },

  async updateInvoice(id: number, invoiceData: Partial<Invoice> & { osteopathId?: number }): Promise<Invoice | undefined> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("updateInvoice appelé avec un ID invalide:", id);
      return undefined;
    }

    // Démo: mise à jour locale
    if (demoContext?.isDemoMode) {
      demoContext.updateDemoInvoice?.(id, invoiceData);
      const updated = demoContext.demoData.invoices.find((i: Invoice) => i.id === id);
      return updated;
    }

    if (USE_SUPABASE) {
      try {
        const { hdsInvoiceService } = await import('@/services/hds-local-storage');
        let dataToSend = { ...invoiceData } as any;
        if (!dataToSend.osteopathId) {
          dataToSend.osteopathId = await getCurrentOsteopathId();
        }
        const updated = await hdsInvoiceService.updateInvoice(id, dataToSend);
        return updated;
      } catch (error) {
        console.error("Erreur HDS updateInvoice:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    throw new Error("Service facture indisponible");
  },

  async deleteInvoice(id: number): Promise<boolean> {
    if (!id || isNaN(id) || id <= 0) {
      console.warn("deleteInvoice appelé avec un ID invalide:", id);
      return false;
    }

    // Démo: suppression locale
    if (demoContext?.isDemoMode) {
      demoContext.deleteDemoInvoice?.(id);
      return true;
    }

    if (USE_SUPABASE) {
      try {
        const { hdsInvoiceService } = await import('@/services/hds-local-storage');
        const ok = await hdsInvoiceService.deleteInvoice(id);
        return ok;
      } catch (error) {
        console.error("Erreur HDS deleteInvoice:", error);
        throw error;
      }
    }

    // Pas de mode démo et Supabase désactivé
    return false;
  },
  
  async exportInvoicesByPeriod(year: string, month: string | null = null): Promise<Invoice[]> {
    const allInvoices = await this.getInvoices();
    return allInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      const invoiceYear = invoiceDate.getFullYear().toString();
      if (invoiceYear !== year) return false;
      if (month !== null) {
        const invoiceMonth = (invoiceDate.getMonth() + 1).toString().padStart(2, '0');
        return invoiceMonth === month;
      }
      return true;
    });
  },
  
  // Méthode pour injecter le contexte démo
  setDemoContext,
};
