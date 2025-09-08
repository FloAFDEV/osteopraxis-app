/**
 * 🔐 Services HDS Sécurisés - Point d'entrée centralisé
 * 
 * Stockage local sécurisé EXCLUSIF pour les données HDS
 * AUCUNE donnée sensible ne va vers Supabase
 */

export { hdsSecureManager, type HDSSecureStatus, type HDSSecureConfig } from './hds-secure-manager';
export { hdsSecurePatientService, type HDSSecurePatientService } from './hds-secure-patient-service';
export { hdsSecureAppointmentService, type HDSSecureAppointmentService } from './hds-secure-appointment-service';
export { hdsSecureInvoiceService, type HDSSecureInvoiceService } from './hds-secure-invoice-service';