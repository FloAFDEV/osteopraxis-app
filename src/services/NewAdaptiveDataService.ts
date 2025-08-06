
import { Patient, Appointment, Invoice, Osteopath, Cabinet } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export type AppMode = 'demo' | 'local';

interface DataService {
  getPatients(): Promise<Patient[]>;
  getPatientById(id: number): Promise<Patient | null>;
  createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  updatePatient(id: number, patient: Partial<Patient>): Promise<Patient>;
  deletePatient(id: number): Promise<boolean>;

  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | null>;
  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;

  getInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<boolean>;

  getOsteopathProfile(): Promise<Osteopath | null>;
  updateOsteopathProfile(profile: Partial<Osteopath>): Promise<Osteopath>;

  getCabinets(): Promise<Cabinet[]>;
  createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet>;
  updateCabinet(id: number, cabinet: Partial<Cabinet>): Promise<Cabinet>;
}

class LocalStorageService implements DataService {
  private getStorageKey(type: string): string {
    return `patienthub_${type}`;
  }

  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(key));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  async getPatients(): Promise<Patient[]> {
    return this.getFromStorage<Patient>('patients');
  }

  async getPatientById(id: number): Promise<Patient | null> {
    const patients = await this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const patients = await this.getPatients();
    const newPatient: Patient = {
      ...patient,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    this.saveToStorage('patients', patients);
    return newPatient;
  }

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient> {
    const patients = await this.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');
    
    patients[index] = {
      ...patients[index],
      ...patientData,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage('patients', patients);
    return patients[index];
  }

  async deletePatient(id: number): Promise<boolean> {
    const patients = await this.getPatients();
    const filtered = patients.filter(p => p.id !== id);
    if (filtered.length === patients.length) return false;
    
    this.saveToStorage('patients', filtered);
    return true;
  }

  async getAppointments(): Promise<Appointment[]> {
    return this.getFromStorage<Appointment>('appointments');
  }

  async getAppointmentById(id: number): Promise<Appointment | null> {
    const appointments = await this.getAppointments();
    return appointments.find(a => a.id === id) || null;
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const appointments = await this.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    this.saveToStorage('appointments', appointments);
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
    const appointments = await this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');
    
    appointments[index] = {
      ...appointments[index],
      ...appointmentData,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage('appointments', appointments);
    return appointments[index];
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const appointments = await this.getAppointments();
    const filtered = appointments.filter(a => a.id !== id);
    if (filtered.length === appointments.length) return false;
    
    this.saveToStorage('appointments', filtered);
    return true;
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.getFromStorage<Invoice>('invoices');
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const invoices = await this.getInvoices();
    const newInvoice: Invoice = {
      ...invoice,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    invoices.push(newInvoice);
    this.saveToStorage('invoices', invoices);
    return newInvoice;
  }

  async updateInvoice(id: number, invoiceData: Partial<Invoice>): Promise<Invoice> {
    const invoices = await this.getInvoices();
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Invoice not found');
    
    invoices[index] = {
      ...invoices[index],
      ...invoiceData,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage('invoices', invoices);
    return invoices[index];
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const invoices = await this.getInvoices();
    const filtered = invoices.filter(i => i.id !== id);
    if (filtered.length === invoices.length) return false;
    
    this.saveToStorage('invoices', filtered);
    return true;
  }

  async getOsteopathProfile(): Promise<Osteopath | null> {
    const profiles = this.getFromStorage<Osteopath>('osteopath');
    return profiles[0] || null;
  }

  async updateOsteopathProfile(profileData: Partial<Osteopath>): Promise<Osteopath> {
    let profile = await this.getOsteopathProfile();
    if (!profile) {
      profile = {
        id: this.generateId(),
        name: profileData.name || '',
        professional_title: profileData.professional_title || 'Ostéopathe D.O.',
        rpps_number: '',
        siret: '',
        ape_code: '8690F',
        userId: 'local-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...profileData,
      };
    } else {
      profile = {
        ...profile,
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
    }
    this.saveToStorage('osteopath', [profile]);
    return profile;
  }

  async getCabinets(): Promise<Cabinet[]> {
    return this.getFromStorage<Cabinet>('cabinets');
  }

  async createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet> {
    const cabinets = await this.getCabinets();
    const newCabinet: Cabinet = {
      ...cabinet,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    cabinets.push(newCabinet);
    this.saveToStorage('cabinets', cabinets);
    return newCabinet;
  }

  async updateCabinet(id: number, cabinetData: Partial<Cabinet>): Promise<Cabinet> {
    const cabinets = await this.getCabinets();
    const index = cabinets.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cabinet not found');
    
    cabinets[index] = {
      ...cabinets[index],
      ...cabinetData,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage('cabinets', cabinets);
    return cabinets[index];
  }
}

class EphemeralSupabaseService implements DataService {
  private sessionPrefix: string;

  constructor(sessionId: string) {
    this.sessionPrefix = `demo_${sessionId}_`;
  }

  private async initDemoData() {
    // Créer des données de démonstration éphémères dans Supabase
    // Ces données seront préfixées avec l'ID de session pour éviter les conflits
    const demoPatients = [
      {
        firstName: "Marie",
        lastName: "Dubois",
        email: "marie.dubois@demo.com",
        phone: "06 12 34 56 78",
        birthDate: "1985-06-15",
        address: "123 Rue de la Paix, 31000 Toulouse",
        gender: "FEMALE" as const,
        osteopathId: 1,
        cabinetId: null,
      },
      {
        firstName: "Jean",
        lastName: "Martin",
        email: "jean.martin@demo.com",
        phone: "06 98 76 54 32",
        birthDate: "1978-03-22",
        address: "456 Avenue de la République, 31100 Toulouse",
        gender: "MALE" as const,
        osteopathId: 1,
        cabinetId: null,
      }
    ];

    // Pour le mode démo, on utilise des données en mémoire temporaires
    return {
      patients: demoPatients.map((p, i) => ({ ...p, id: i + 1 })),
      appointments: [],
      invoices: [],
      osteopath: {
        id: 1,
        name: "Dr. Demo",
        professional_title: "Ostéopathe D.O.",
        rpps_number: "12345678901",
        siret: "12345678901234",
        ape_code: "8690F",
        userId: "demo-user",
      },
      cabinets: []
    };
  }

  async getPatients(): Promise<Patient[]> {
    const demoData = await this.initDemoData();
    return demoData.patients as Patient[];
  }

  async getPatientById(id: number): Promise<Patient | null> {
    const patients = await this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  async createPatient(): Promise<Patient> {
    throw new Error('Demo mode: Cannot create patients');
  }

  async updatePatient(): Promise<Patient> {
    throw new Error('Demo mode: Cannot update patients');
  }

  async deletePatient(): Promise<boolean> {
    throw new Error('Demo mode: Cannot delete patients');
  }

  async getAppointments(): Promise<Appointment[]> {
    const demoData = await this.initDemoData();
    return demoData.appointments as Appointment[];
  }

  async getAppointmentById(id: number): Promise<Appointment | null> {
    const appointments = await this.getAppointments();
    return appointments.find(a => a.id === id) || null;
  }

  async createAppointment(): Promise<Appointment> {
    throw new Error('Demo mode: Cannot create appointments');
  }

  async updateAppointment(): Promise<Appointment> {
    throw new Error('Demo mode: Cannot update appointments');
  }

  async deleteAppointment(): Promise<boolean> {
    throw new Error('Demo mode: Cannot delete appointments');
  }

  async getInvoices(): Promise<Invoice[]> {
    const demoData = await this.initDemoData();
    return demoData.invoices as Invoice[];
  }

  async createInvoice(): Promise<Invoice> {
    throw new Error('Demo mode: Cannot create invoices');
  }

  async updateInvoice(): Promise<Invoice> {
    throw new Error('Demo mode: Cannot update invoices');
  }

  async deleteInvoice(): Promise<boolean> {
    throw new Error('Demo mode: Cannot delete invoices');
  }

  async getOsteopathProfile(): Promise<Osteopath | null> {
    const demoData = await this.initDemoData();
    return demoData.osteopath as Osteopath;
  }

  async updateOsteopathProfile(): Promise<Osteopath> {
    throw new Error('Demo mode: Cannot update profile');
  }

  async getCabinets(): Promise<Cabinet[]> {
    const demoData = await this.initDemoData();
    return demoData.cabinets as Cabinet[];
  }

  async createCabinet(): Promise<Cabinet> {
    throw new Error('Demo mode: Cannot create cabinets');
  }

  async updateCabinet(): Promise<Cabinet> {
    throw new Error('Demo mode: Cannot update cabinets');
  }
}

export class NewAdaptiveDataService {
  static getInstance(mode: AppMode, sessionId?: string): DataService {
    switch (mode) {
      case 'demo':
        return new EphemeralSupabaseService(sessionId || 'default');
      case 'local':
        return new LocalStorageService();
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  }
}
