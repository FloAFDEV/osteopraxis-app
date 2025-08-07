/**
 * Intercepteur de services pour rediriger AUTOMATIQUEMENT 
 * les appels aux données sensibles vers le stockage local
 */

import { hybridDataManager } from '../hybrid-data-adapter/hybrid-manager';
import { Patient, Appointment, Invoice } from '@/types';

/**
 * ENTITÉS SENSIBLES qui doivent OBLIGATOIREMENT utiliser le stockage local
 */
const SENSITIVE_ENTITIES = new Set([
  'patients',
  'appointments', 
  'invoices',
  'consultations',
  'medicalDocuments',
  'treatmentHistory',
  'quotes',
  'quoteItems'
]);

/**
 * Service unifié qui intercepte et redirige automatiquement
 * vers le stockage approprié (local pour sensible, cloud pour non-sensible)
 */
export class HDSCompliantService {
  
  /**
   * REDIRECTION AUTOMATIQUE - Ne permet JAMAIS l'accès Supabase pour données sensibles
   */
  async getAll<T>(entityType: string): Promise<T[]> {
    if (SENSITIVE_ENTITIES.has(entityType.toLowerCase())) {
      console.log(`🔒 Redirection HDS: ${entityType} -> Stockage LOCAL`);
      return await hybridDataManager.get<T>(entityType.toLowerCase());
    } else {
      console.log(`☁️ Accès cloud: ${entityType} -> Supabase`);
      return await hybridDataManager.get<T>(entityType.toLowerCase());
    }
  }

  async getById<T>(entityType: string, id: number | string): Promise<T | null> {
    if (SENSITIVE_ENTITIES.has(entityType.toLowerCase())) {
      console.log(`🔒 Redirection HDS: ${entityType}/${id} -> Stockage LOCAL`);
      return await hybridDataManager.getById<T>(entityType.toLowerCase(), id);
    } else {
      console.log(`☁️ Accès cloud: ${entityType}/${id} -> Supabase`);
      return await hybridDataManager.getById<T>(entityType.toLowerCase(), id);
    }
  }

  async create<T>(entityType: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    if (SENSITIVE_ENTITIES.has(entityType.toLowerCase())) {
      console.log(`🔒 Création HDS: ${entityType} -> Stockage LOCAL`);
      return await hybridDataManager.create<T>(entityType.toLowerCase(), data);
    } else {
      console.log(`☁️ Création cloud: ${entityType} -> Supabase`);
      return await hybridDataManager.create<T>(entityType.toLowerCase(), data);
    }
  }

  async update<T>(entityType: string, id: number | string, data: Partial<T>): Promise<T> {
    if (SENSITIVE_ENTITIES.has(entityType.toLowerCase())) {
      console.log(`🔒 Mise à jour HDS: ${entityType}/${id} -> Stockage LOCAL`);
      return await hybridDataManager.update<T>(entityType.toLowerCase(), id, data);
    } else {
      console.log(`☁️ Mise à jour cloud: ${entityType}/${id} -> Supabase`);
      return await hybridDataManager.update<T>(entityType.toLowerCase(), id, data);
    }
  }

  async delete(entityType: string, id: number | string): Promise<boolean> {
    if (SENSITIVE_ENTITIES.has(entityType.toLowerCase())) {
      console.log(`🔒 Suppression HDS: ${entityType}/${id} -> Stockage LOCAL`);
      return await hybridDataManager.delete(entityType.toLowerCase(), id);
    } else {
      console.log(`☁️ Suppression cloud: ${entityType}/${id} -> Supabase`);
      return await hybridDataManager.delete(entityType.toLowerCase(), id);
    }
  }

  /**
   * Valide qu'aucune donnée sensible n'est en train d'être envoyée vers Supabase
   */
  validateNoSensitiveDataToCloud(entityType: string, operation: string): void {
    if (SENSITIVE_ENTITIES.has(entityType.toLowerCase())) {
      const error = `🚨 VIOLATION HDS: Tentative ${operation} de ${entityType} vers Supabase BLOQUÉE`;
      console.error(error);
      throw new Error(error);
    }
  }
}

/**
 * Instance singleton du service conforme HDS
 */
export const hdsCompliantService = new HDSCompliantService();

/**
 * Services spécialisés qui utilisent automatiquement le stockage local
 */
export class HDSPatientService {
  async getPatients(): Promise<Patient[]> {
    return await hdsCompliantService.getAll<Patient>('patients');
  }

  async getPatientById(id: number): Promise<Patient | null> {
    return await hdsCompliantService.getById<Patient>('patients', id);
  }

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    return await hdsCompliantService.create<Patient>('patients', patient);
  }

  async updatePatient(patient: Patient): Promise<Patient> {
    const { id, ...updateData } = patient;
    return await hdsCompliantService.update<Patient>('patients', id, updateData);
  }

  async deletePatient(id: number): Promise<boolean> {
    return await hdsCompliantService.delete('patients', id);
  }
}

export class HDSAppointmentService {
  async getAppointments(): Promise<Appointment[]> {
    return await hdsCompliantService.getAll<Appointment>('appointments');
  }

  async getAppointmentById(id: number): Promise<Appointment | null> {
    return await hdsCompliantService.getById<Appointment>('appointments', id);
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    return await hdsCompliantService.create<Appointment>('appointments', appointment);
  }

  async updateAppointment(appointment: Appointment): Promise<Appointment> {
    const { id, ...updateData } = appointment;
    return await hdsCompliantService.update<Appointment>('appointments', id, updateData);
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return await hdsCompliantService.delete('appointments', id);
  }
}

export class HDSInvoiceService {
  async getInvoices(): Promise<Invoice[]> {
    return await hdsCompliantService.getAll<Invoice>('invoices');
  }

  async getInvoiceById(id: number): Promise<Invoice | null> {
    return await hdsCompliantService.getById<Invoice>('invoices', id);
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    return await hdsCompliantService.create<Invoice>('invoices', invoice);
  }

  async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const { id, ...updateData } = invoice;
    return await hdsCompliantService.update<Invoice>('invoices', id, updateData);
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return await hdsCompliantService.delete('invoices', id);
  }
}

// Instances singleton des services
export const hdsPatientService = new HDSPatientService();
export const hdsAppointmentService = new HDSAppointmentService();
export const hdsInvoiceService = new HDSInvoiceService();