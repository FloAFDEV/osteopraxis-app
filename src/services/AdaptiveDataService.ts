import { Patient, Appointment, Invoice, Osteopath, Cabinet } from '@/types';

export type AppMode = 'demo' | 'production' | 'local';

interface DataService {
  // Patients
  getPatients(): Promise<Patient[]>;
  getPatientById(id: number): Promise<Patient | null>;
  createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  updatePatient(id: number, patient: Partial<Patient>): Promise<Patient>;
  deletePatient(id: number): Promise<boolean>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | null>;
  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice>;
  deleteInvoice(id: number): Promise<boolean>;

  // Profile
  getOsteopathProfile(): Promise<Osteopath | null>;
  updateOsteopathProfile(profile: Partial<Osteopath>): Promise<Osteopath>;

  // Cabinet
  getCabinets(): Promise<Cabinet[]>;
  createCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cabinet>;
  updateCabinet(id: number, cabinet: Partial<Cabinet>): Promise<Cabinet>;
}

class LocalStorageDataService implements DataService {
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

  // Patients
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

  // Appointments
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

  // Invoices
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

  // Profile & Cabinet - Simplified for local storage
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

class DemoDataService implements DataService {
  private demoData = {
    patients: [
      {
        id: 1,
        firstName: "Marie",
        lastName: "Dubois",
        email: "marie.dubois@demo.com",
        phone: "06 12 34 56 78",
        birthDate: "1985-06-15",
        address: "123 Rue de la Paix, 31000 Toulouse",
        gender: "FEMALE" as const,
        osteopathId: 1,
        cabinetId: null,
        height: null,
        weight: null,
        bmi: null,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      } as Patient,
      {
        id: 2,
        firstName: "Jean",
        lastName: "Martin",
        email: "jean.martin@demo.com",
        phone: "06 98 76 54 32",
        birthDate: "1978-03-22",
        address: "456 Avenue de la République, 31100 Toulouse",
        gender: "MALE" as const,
        osteopathId: 1,
        cabinetId: null,
        height: null,
        weight: null,
        bmi: null,
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
      } as Patient
    ],
    appointments: [
      {
        id: 1,
        patientId: 1,
        osteopathId: 1,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        reason: "Douleurs lombaires",
        status: "SCHEDULED" as const,
        notes: "Première consultation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    invoices: [
      {
        id: 1,
        patientId: 1,
        osteopathId: 1,
        appointmentId: 1,
        amount: 60,
        date: new Date().toISOString(),
        paymentStatus: "PAID" as const,
        paymentMethod: "Espèces",
        notes: "Consultation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
    osteopath: {
      id: 1,
      name: "Dr. Demo",
      professional_title: "Ostéopathe D.O.",
      authId: "demo-user",
      userId: "demo-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    cabinets: [
      {
        id: 1,
        name: "Cabinet Demo",
        address: "123 Rue Demo",
        phone: "01 23 45 67 89",
        email: "demo@cabinet.com",
        osteopathId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]
  };

  // Note: Demo data is read-only, so all mutations are no-ops
  async getPatients(): Promise<Patient[]> {
    return [...this.demoData.patients];
  }

  async getPatientById(id: number): Promise<Patient | null> {
    return this.demoData.patients.find(p => p.id === id) || null;
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
    return [...this.demoData.appointments];
  }

  async getAppointmentById(id: number): Promise<Appointment | null> {
    return this.demoData.appointments.find(a => a.id === id) || null;
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
    return [...this.demoData.invoices];
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
    return this.demoData.osteopath;
  }

  async updateOsteopathProfile(): Promise<Osteopath> {
    throw new Error('Demo mode: Cannot update profile');
  }

  async getCabinets(): Promise<Cabinet[]> {
    return [...this.demoData.cabinets];
  }

  async createCabinet(): Promise<Cabinet> {
    throw new Error('Demo mode: Cannot create cabinets');
  }

  async updateCabinet(): Promise<Cabinet> {
    throw new Error('Demo mode: Cannot update cabinets');
  }
}

// Service factory
export class AdaptiveDataService {
  private static instance: DataService | null = null;

  static getInstance(mode: AppMode): DataService {
    // Always create a new instance based on current mode
    switch (mode) {
      case 'demo':
        return new DemoDataService();
      case 'local':
        return new LocalStorageDataService();
      case 'production':
      default:
        // For production, we would use the existing Supabase services
        // This is a placeholder - the real implementation would import and use
        // the existing Supabase services from src/services/api/
        throw new Error('Production mode should use existing Supabase services');
    }
  }
}