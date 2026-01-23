import { Patient, Appointment, Invoice, Cabinet } from '@/types';
import { DemoStorage } from './demo-storage';

export class DemoLocalStorageService {
  constructor(private cabinetId: string) {}

  getPatients(): Patient[] {
    return DemoStorage.getAll<Patient>(this.cabinetId, 'patients');
  }

  addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    const now = new Date().toISOString();
    const newPatient: Patient = {
      ...patient,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    DemoStorage.add(this.cabinetId, 'patients', newPatient);
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const patients = this.getPatients();
    const patient = patients.find(p => p.id === id);
    if (!patient) return null;

    const updated: Patient = {
      ...patient,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    DemoStorage.update(this.cabinetId, 'patients', id, updated);
    return updated;
  }

  deletePatient(id: string): void {
    DemoStorage.delete(this.cabinetId, 'patients', id);
  }

  getAppointments(): Appointment[] {
    return DemoStorage.getAll<Appointment>(this.cabinetId, 'appointments');
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointment,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    DemoStorage.add(this.cabinetId, 'appointments', newAppointment);
    return newAppointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const appointments = this.getAppointments();
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return null;

    const updated: Appointment = {
      ...appointment,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    DemoStorage.update(this.cabinetId, 'appointments', id, updated);
    return updated;
  }

  deleteAppointment(id: string): void {
    DemoStorage.delete(this.cabinetId, 'appointments', id);
  }

  getInvoices(): Invoice[] {
    return DemoStorage.getAll<Invoice>(this.cabinetId, 'invoices');
  }

  addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    DemoStorage.add(this.cabinetId, 'invoices', newInvoice);
    return newInvoice;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const invoices = this.getInvoices();
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return null;

    const updated: Invoice = {
      ...invoice,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    DemoStorage.update(this.cabinetId, 'invoices', id, updated);
    return updated;
  }

  deleteInvoice(id: string): void {
    DemoStorage.delete(this.cabinetId, 'invoices', id);
  }

  getCabinets(): Cabinet[] {
    console.log('📂 [DemoLocalStorage] getCabinets() appelé pour cabinetId:', this.cabinetId);
    const cabinet = DemoStorage.get<Cabinet>(this.cabinetId, 'cabinet');
    console.log('📂 [DemoLocalStorage] Cabinet récupéré:', cabinet);
    return cabinet ? [cabinet] : [];
  }

  getOsteopath(): any | null {
    return DemoStorage.get(this.cabinetId, 'osteopath');
  }
}

export const demoLocalStorage = (cabinetId: string) => new DemoLocalStorageService(cabinetId);
