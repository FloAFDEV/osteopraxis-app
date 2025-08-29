/**
 * Service de stockage local éphémère pour le mode démo
 * Les données sont isolées par session et disparaissent à la fermeture du navigateur
 */

import { Patient, Appointment, Invoice, Cabinet } from '@/types';
import { nanoid } from 'nanoid';

export interface DemoSession {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface DemoLocalData {
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  cabinets: Cabinet[];
  session: DemoSession;
}

class DemoLocalStorageService {
  private readonly SESSION_KEY = 'demo_session';
  private readonly DATA_KEY_PREFIX = 'demo_data_';
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Crée une nouvelle session démo avec des données isolées
   */
  createSession(): DemoSession {
    const sessionId = nanoid(10);
    const now = new Date();
    const session: DemoSession = {
      sessionId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.SESSION_DURATION),
      isActive: true
    };

    // Sauvegarder la session
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    
    // Initialiser les données vides pour cette session
    const initialData: Omit<DemoLocalData, 'session'> = {
      patients: [],
      appointments: [],
      invoices: [],
      cabinets: []
    };
    
    sessionStorage.setItem(this.getDataKey(sessionId), JSON.stringify(initialData));
    
    console.log(`🎭 Nouvelle session démo créée: ${sessionId} (expire dans 30min)`);
    return session;
  }

  /**
   * Récupère la session démo actuelle
   */
  getCurrentSession(): DemoSession | null {
    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: DemoSession = JSON.parse(sessionData);
      
      // Vérifier si la session a expiré
      if (new Date() > new Date(session.expiresAt)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session démo:', error);
      return null;
    }
  }

  /**
   * Vérifie si une session démo est active
   */
  isSessionActive(): boolean {
    const session = this.getCurrentSession();
    return session !== null && session.isActive;
  }

  /**
   * Récupère les données de la session actuelle
   */
  private getSessionData(): DemoLocalData | null {
    const session = this.getCurrentSession();
    if (!session) return null;

    try {
      const dataKey = this.getDataKey(session.sessionId);
      const data = sessionStorage.getItem(dataKey);
      if (!data) return null;

      const parsedData = JSON.parse(data);
      return {
        ...parsedData,
        session
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données démo:', error);
      return null;
    }
  }

  /**
   * Sauvegarde les données de la session actuelle
   */
  private saveSessionData(data: Omit<DemoLocalData, 'session'>): void {
    const session = this.getCurrentSession();
    if (!session) throw new Error('Aucune session démo active');

    const dataKey = this.getDataKey(session.sessionId);
    sessionStorage.setItem(dataKey, JSON.stringify(data));
  }

  /**
   * Récupère tous les patients de la session
   */
  getPatients(): Patient[] {
    const data = this.getSessionData();
    return data?.patients || [];
  }

  /**
   * Ajoute un patient à la session
   */
  addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const now = new Date().toISOString();
    const tempId = this.generateTempId();
    
    // Générer un email technique uniquement si aucun email n'est fourni
    // Cela conserve les données saisies par l'utilisateur
    const email = patient.email || `patient-${Date.now()}-${tempId}@temp.local`;
    
    const newPatient: Patient = {
      ...patient,
      id: tempId,
      email: email,
      createdAt: now,
      updatedAt: now
    };

    data.patients.push(newPatient);
    this.saveSessionData(data);
    
    console.log(`🎭 Patient ajouté en session démo:`, newPatient);
    return newPatient;
  }

  /**
   * Met à jour un patient
   */
  updatePatient(id: number, updates: Partial<Patient>): Patient {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const patientIndex = data.patients.findIndex(p => p.id === id);
    if (patientIndex === -1) throw new Error(`Patient ${id} non trouvé`);

    const updatedPatient = {
      ...data.patients[patientIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    data.patients[patientIndex] = updatedPatient;
    this.saveSessionData(data);
    
    console.log(`🎭 Patient mis à jour en session démo:`, updatedPatient);
    return updatedPatient;
  }

  /**
   * Supprime un patient
   */
  deletePatient(id: number): boolean {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const initialLength = data.patients.length;
    data.patients = data.patients.filter(p => p.id !== id);
    
    if (data.patients.length === initialLength) {
      return false; // Patient non trouvé
    }

    this.saveSessionData(data);
    console.log(`🎭 Patient ${id} supprimé de la session démo`);
    return true;
  }

  /**
   * Récupère un patient par ID
   */
  getPatientById(id: number): Patient | null {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  /**
   * Récupère tous les rendez-vous de la session
   */
  getAppointments(): Appointment[] {
    const data = this.getSessionData();
    return data?.appointments || [];
  }

  /**
   * Ajoute un rendez-vous à la session
   */
  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointment,
      id: this.generateTempId(),
      createdAt: now,
      updatedAt: now
    };

    data.appointments.push(newAppointment);
    this.saveSessionData(data);
    
    console.log(`🎭 Rendez-vous ajouté en session démo:`, newAppointment);
    return newAppointment;
  }

  /**
   * Met à jour un rendez-vous
   */
  updateAppointment(id: number, updates: Partial<Appointment>): Appointment {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const appointmentIndex = data.appointments.findIndex(a => a.id === id);
    if (appointmentIndex === -1) throw new Error(`Rendez-vous ${id} non trouvé`);

    const updatedAppointment = {
      ...data.appointments[appointmentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    data.appointments[appointmentIndex] = updatedAppointment;
    this.saveSessionData(data);
    
    console.log(`🎭 Rendez-vous mis à jour en session démo:`, updatedAppointment);
    return updatedAppointment;
  }

  /**
   * Supprime un rendez-vous
   */
  deleteAppointment(id: number): boolean {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const initialLength = data.appointments.length;
    data.appointments = data.appointments.filter(a => a.id !== id);
    
    if (data.appointments.length === initialLength) {
      return false; // Rendez-vous non trouvé
    }

    this.saveSessionData(data);
    console.log(`🎭 Rendez-vous ${id} supprimé de la session démo`);
    return true;
  }

  /**
   * Récupère toutes les factures de la session
   */
  getInvoices(): Invoice[] {
    const data = this.getSessionData();
    return data?.invoices || [];
  }

  /**
   * Ajoute une facture à la session
   */
  addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      ...invoice,
      id: this.generateTempId(),
      createdAt: now,
      updatedAt: now
    };

    data.invoices.push(newInvoice);
    this.saveSessionData(data);
    
    console.log(`🎭 Facture ajoutée en session démo:`, newInvoice);
    return newInvoice;
  }

  /**
   * Met à jour une facture
   */
  updateInvoice(id: number, updates: Partial<Invoice>): Invoice {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const invoiceIndex = data.invoices.findIndex(i => i.id === id);
    if (invoiceIndex === -1) throw new Error(`Facture ${id} non trouvée`);

    const updatedInvoice = {
      ...data.invoices[invoiceIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    data.invoices[invoiceIndex] = updatedInvoice;
    this.saveSessionData(data);
    
    console.log(`🎭 Facture mise à jour en session démo:`, updatedInvoice);
    return updatedInvoice;
  }

  /**
   * Supprime une facture
   */
  deleteInvoice(id: number): boolean {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const initialLength = data.invoices.length;
    data.invoices = data.invoices.filter(i => i.id !== id);
    
    if (data.invoices.length === initialLength) {
      return false; // Facture non trouvée
    }

    this.saveSessionData(data);
    console.log(`🎭 Facture ${id} supprimée de la session démo`);
    return true;
  }

  /**
   * Nettoie la session actuelle
   */
  clearSession(): void {
    const session = this.getCurrentSession();
    if (session) {
      const dataKey = this.getDataKey(session.sessionId);
      sessionStorage.removeItem(dataKey);
    }
    sessionStorage.removeItem(this.SESSION_KEY);
    console.log('🎭 Session démo nettoyée');
  }

  /**
   * Gestion des cabinets en mode démo
   */
  getCabinets(): Cabinet[] {
    const data = this.getSessionData();
    return data?.cabinets || [];
  }

  getCabinetById(id: number): Cabinet | undefined {
    const cabinets = this.getCabinets();
    return cabinets.find(c => c.id === id);
  }

  addCabinet(cabinet: Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>): Cabinet {
    const data = this.getSessionData();
    if (!data) throw new Error('Aucune session démo active');

    const now = new Date().toISOString();
    const newCabinet: Cabinet = {
      ...cabinet,
      id: this.generateTempId(),
      createdAt: now,
      updatedAt: now
    };

    data.cabinets.push(newCabinet);
    this.saveSessionData(data);
    
    console.log(`🎭 Cabinet ajouté en session démo:`, newCabinet);
    return newCabinet;
  }

  /**
   * Récupère les statistiques de la session
   */
  getSessionStats(): {
    sessionId: string | null;
    patientsCount: number;
    appointmentsCount: number;
    invoicesCount: number;
    cabinetCount: number;
    expiresAt: Date | null;
    timeRemaining: number;
  } {
    const session = this.getCurrentSession();
    const data = this.getSessionData();
    
    return {
      sessionId: session?.sessionId || null,
      patientsCount: data?.patients.length || 0,
      appointmentsCount: data?.appointments.length || 0,
      invoicesCount: data?.invoices.length || 0,
      cabinetCount: data?.cabinets.length || 0,
      expiresAt: session?.expiresAt ? new Date(session.expiresAt) : null,
      timeRemaining: session ? new Date(session.expiresAt).getTime() - Date.now() : 0
    };
  }

  /**
   * Génère un ID temporaire unique pour la session
   */
  private generateTempId(): number {
    // Utiliser un timestamp + random pour éviter les collisions
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Génère la clé de stockage pour une session
   */
  private getDataKey(sessionId: string): string {
    return `${this.DATA_KEY_PREFIX}${sessionId}`;
  }

  /**
   * Seed des données démo de base pour une nouvelle session
   */
  seedDemoData(): void {
    if (!this.isSessionActive()) {
      throw new Error('Aucune session démo active pour le seeding');
    }

    // En mode démo, on commence avec une liste vide
    // Les patients seront ajoutés par l'utilisateur avec ses propres données
    console.log('🎭 Session démo initialisée (liste vide, prête pour les données utilisateur)');
  }
}

export const demoLocalStorage = new DemoLocalStorageService();