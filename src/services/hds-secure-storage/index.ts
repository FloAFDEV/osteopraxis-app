/**
 * 🔐 Services HDS Sécurisés - Point d'entrée centralisé
 * 
 * Stockage local sécurisé EXCLUSIF pour les données HDS
 * AUCUNE donnée sensible ne va vers Supabase
 */

// Gestionnaire principal
export { hdsSecureManager, type HDSSecureStatus, type HDSSecureConfig } from './hds-secure-manager';

// Services par entité
export { hdsSecurePatientService, type HDSSecurePatientService } from './hds-secure-patient-service';

// Placeholder pour les autres services (à créer si nécessaire)
export const hdsSecureAppointmentService = {
  createAppointment: async (data: any) => {
    throw new Error('Service appointments HDS sécurisé à implémenter');
  },
  getAppointmentById: async (id: number) => {
    throw new Error('Service appointments HDS sécurisé à implémenter');
  },
  getAppointments: async () => {
    throw new Error('Service appointments HDS sécurisé à implémenter');
  },
  updateAppointment: async (id: number, updates: any) => {
    throw new Error('Service appointments HDS sécurisé à implémenter');
  },
  deleteAppointment: async (id: number) => {
    throw new Error('Service appointments HDS sécurisé à implémenter');
  }
};

export const hdsSecureInvoiceService = {
  createInvoice: async (data: any) => {
    throw new Error('Service factures HDS sécurisé à implémenter');
  },
  getInvoiceById: async (id: number) => {
    throw new Error('Service factures HDS sécurisé à implémenter');
  },
  getInvoices: async () => {
    throw new Error('Service factures HDS sécurisé à implémenter');
  },
  updateInvoice: async (id: number, updates: any) => {
    throw new Error('Service factures HDS sécurisé à implémenter');
  },
  deleteInvoice: async (id: number) => {
    throw new Error('Service factures HDS sécurisé à implémenter');
  }
};