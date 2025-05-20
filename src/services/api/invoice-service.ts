
import { Invoice, PaymentStatus } from "@/types";
import { USE_SUPABASE } from "./config";
import { supabaseInvoiceService } from "../supabase-api/invoice-service";
import { getCurrentOsteopathId, isInvoiceOwnedByCurrentOsteopath, isPatientOwnedByCurrentOsteopath } from "@/services";
import { SecurityViolationError } from "./appointment-service";

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    if (USE_SUPABASE) {
      try {
        // La fonction supabaseInvoiceService.getInvoices() 
        // filtre déjà par osteopathId en récupérant l'ID via getCurrentOsteopathId
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
        // Vérifier que la facture appartient à l'ostéopathe connecté
        const isOwned = await isInvoiceOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès à la facture ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à cette facture`);
        }
        
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
        // Vérifier que le patient appartient à l'ostéopathe connecté
        const isOwned = await isPatientOwnedByCurrentOsteopath(patientId);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès aux factures du patient ${patientId} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce patient`);
        }
        
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
        // Vérifier que le rendez-vous appartient à l'ostéopathe connecté
        const { isAppointmentOwnedByCurrentOsteopath } = await import("@/services");
        const isOwned = await isAppointmentOwnedByCurrentOsteopath(appointmentId);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative d'accès aux factures du rendez-vous ${appointmentId} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce rendez-vous`);
        }
        
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
        // Vérifier que le patient appartient à l'ostéopathe connecté
        const isOwned = await isPatientOwnedByCurrentOsteopath(invoiceData.patientId);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative de création d'une facture pour le patient ${invoiceData.patientId} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à ce patient`);
        }
        
        // Si un appointmentId est fourni, vérifier qu'il appartient aussi à l'ostéopathe
        if (invoiceData.appointmentId) {
          const { isAppointmentOwnedByCurrentOsteopath } = await import("@/services");
          const isAppointmentOwned = await isAppointmentOwnedByCurrentOsteopath(invoiceData.appointmentId);
          if (!isAppointmentOwned) {
            console.error(`[SECURITY VIOLATION] Tentative de création d'une facture pour le rendez-vous ${invoiceData.appointmentId} qui n'appartient pas à l'ostéopathe connecté`);
            throw new SecurityViolationError(`Vous n'avez pas accès à ce rendez-vous`);
          }
        }
        
        // Récupérer l'osteopathId de l'utilisateur connecté pour le forcer dans le payload
        const osteopathId = await getCurrentOsteopathId();
        if (!osteopathId) {
          throw new Error("Impossible de récupérer l'identifiant de l'ostéopathe connecté");
        }
        
        // Écraser l'osteopathId dans le payload avec celui de l'utilisateur connecté
        const securedInvoiceData = { 
          ...invoiceData, 
          osteopathId 
        };
        
        return await supabaseInvoiceService.createInvoice(securedInvoiceData);
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
        // Vérifier que la facture appartient à l'ostéopathe connecté
        const isOwned = await isInvoiceOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative de mise à jour de la facture ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à cette facture`);
        }
        
        // Empêcher la modification de l'osteopathId et du patientId
        if (invoiceData.osteopathId !== undefined) {
          console.warn(`[SECURITY] Tentative de modification de l'osteopathId dans updateInvoice. Cette modification sera ignorée.`);
          delete invoiceData.osteopathId;
        }
        
        if (invoiceData.patientId !== undefined) {
          // Vérifier que le nouveau patient appartient aussi à l'ostéopathe connecté
          const isNewPatientOwned = await isPatientOwnedByCurrentOsteopath(invoiceData.patientId);
          if (!isNewPatientOwned) {
            console.error(`[SECURITY VIOLATION] Tentative d'attribution de la facture ${id} au patient ${invoiceData.patientId} qui n'appartient pas à l'ostéopathe connecté`);
            throw new SecurityViolationError(`Vous n'avez pas accès à ce patient`);
          }
        }
        
        // Si on change le rendez-vous associé, vérifier qu'il appartient aussi à l'ostéopathe
        if (invoiceData.appointmentId) {
          const { isAppointmentOwnedByCurrentOsteopath } = await import("@/services");
          const isAppointmentOwned = await isAppointmentOwnedByCurrentOsteopath(invoiceData.appointmentId);
          if (!isAppointmentOwned) {
            console.error(`[SECURITY VIOLATION] Tentative de liaison de la facture ${id} au rendez-vous ${invoiceData.appointmentId} qui n'appartient pas à l'ostéopathe connecté`);
            throw new SecurityViolationError(`Vous n'avez pas accès à ce rendez-vous`);
          }
        }
        
        const updatedInvoice = await supabaseInvoiceService.updateInvoice(id, invoiceData);
        // Ne pas afficher de toast ici pour éviter les doublons
        // Le toast sera affiché dans le composant appelant
        return updatedInvoice;
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
        // Vérifier que la facture appartient à l'ostéopathe connecté
        const isOwned = await isInvoiceOwnedByCurrentOsteopath(id);
        if (!isOwned) {
          console.error(`[SECURITY VIOLATION] Tentative de suppression de la facture ${id} qui n'appartient pas à l'ostéopathe connecté`);
          throw new SecurityViolationError(`Vous n'avez pas accès à cette facture`);
        }
        
        return await supabaseInvoiceService.deleteInvoice(id);
      } catch (error) {
        console.error("Erreur Supabase deleteInvoice:", error);
        throw error;
      }
    }
    
    // Mock implementation
    return true;
  },
  
  // Nouvelle méthode pour exporter les factures d'une période donnée (mois ou année)
  async exportInvoicesByPeriod(year: string, month: string | null = null): Promise<Invoice[]> {
    // Récupérer toutes les factures - déjà filtré par osteopathId connecté
    const allInvoices = await this.getInvoices();
    
    // Filtrer par année et mois si spécifié
    return allInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      const invoiceYear = invoiceDate.getFullYear().toString();
      
      // Si l'année ne correspond pas, exclure
      if (invoiceYear !== year) return false;
      
      // Si un mois est spécifié, vérifier la correspondance
      if (month !== null) {
        const invoiceMonth = (invoiceDate.getMonth() + 1).toString().padStart(2, '0');
        return invoiceMonth === month;
      }
      
      // Sinon, inclure toutes les factures de l'année
      return true;
    });
  }
};
