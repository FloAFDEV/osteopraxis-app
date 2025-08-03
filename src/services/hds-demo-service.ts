/**
 * Service HDS Démo - Gestion des données fictives temporaires
 * Les données sensibles sont stockées temporairement et supprimées automatiquement
 */

import { Patient, Appointment, Invoice } from "@/types";
import { hdsLocalDataService } from "./hds-data-adapter/local-service";

interface DemoDataSession {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
}

class HDSDemoService {
  private static instance: HDSDemoService;
  private currentSession: DemoDataSession | null = null;
  private sessionTimeoutId: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  static getInstance(): HDSDemoService {
    if (!HDSDemoService.instance) {
      HDSDemoService.instance = new HDSDemoService();
    }
    return HDSDemoService.instance;
  }

  private constructor() {
    // Vérifier et nettoyer les sessions expirées au démarrage
    this.cleanupExpiredSessions();
  }

  /**
   * Crée une nouvelle session démo avec des données fictives
   */
  async createDemoSession(): Promise<DemoDataSession> {
    try {
      console.log("🎭 Création d'une session démo HDS");
      
      // Nettoyer la session précédente si elle existe
      if (this.currentSession) {
        await this.clearCurrentSession();
      }

      // Initialiser le stockage local
      await hdsLocalDataService.initialize();

      const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.SESSION_DURATION);

      // Créer des données fictives
      const demoPatients = this.generateDemoPatients();
      const demoAppointments = this.generateDemoAppointments(demoPatients);
      const demoInvoices = this.generateDemoInvoices(demoAppointments);

      // Stocker les données en local
      await this.storeDemoDataLocally(demoPatients, demoAppointments, demoInvoices);

      this.currentSession = {
        sessionId,
        createdAt: now,
        expiresAt,
        patients: demoPatients,
        appointments: demoAppointments,
        invoices: demoInvoices
      };

      // Programmer la suppression automatique
      this.scheduleSessionCleanup();

      console.log(`✅ Session démo créée: ${sessionId}, expire à ${expiresAt.toLocaleTimeString()}`);
      
      return this.currentSession;
    } catch (error) {
      console.error("Erreur lors de la création de la session démo:", error);
      throw error;
    }
  }

  /**
   * Récupère la session démo active
   */
  getCurrentSession(): DemoDataSession | null {
    if (this.currentSession && new Date() > this.currentSession.expiresAt) {
      console.log("⏰ Session démo expirée, suppression automatique");
      this.clearCurrentSession();
      return null;
    }
    return this.currentSession;
  }

  /**
   * Vérifie si on est en mode démo actif
   */
  isDemoModeActive(): boolean {
    return this.getCurrentSession() !== null;
  }

  /**
   * Nettoie la session actuelle
   */
  async clearCurrentSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      console.log("🧹 Suppression de la session démo HDS");
      
      // Annuler le timeout de suppression
      if (this.sessionTimeoutId) {
        clearTimeout(this.sessionTimeoutId);
        this.sessionTimeoutId = null;
      }

      // Supprimer les données du stockage local
      await this.clearDemoDataFromStorage();

      this.currentSession = null;
      
      console.log("✅ Session démo supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de la session démo:", error);
    }
  }

  /**
   * Étend la durée de la session de 30 minutes
   */
  extendSession(): void {
    if (this.currentSession) {
      const newExpiresAt = new Date(Date.now() + this.SESSION_DURATION);
      this.currentSession.expiresAt = newExpiresAt;
      
      // Reprogrammer la suppression
      this.scheduleSessionCleanup();
      
      console.log(`⏱️ Session démo étendue jusqu'à ${newExpiresAt.toLocaleTimeString()}`);
    }
  }

  /**
   * Génère des patients fictifs pour la démo
   */
  private generateDemoPatients(): Patient[] {
    return [
      {
        id: 1001,
        firstName: "Marie",
        lastName: "Martin",
        email: "marie.martin@demo.com",
        phone: "06.12.34.56.78",
        birthDate: "1985-03-15",
        gender: "Femme",
        address: "123 Rue de la Démo, Démoville",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        osteopathId: 1,
        cabinetId: null
      } as Patient,
      {
        id: 1002,
        firstName: "Pierre",
        lastName: "Dupont",
        email: "pierre.dupont@demo.com",
        phone: "06.87.65.43.21",
        birthDate: "1978-07-22",
        gender: "Homme",
        address: "456 Avenue de Test, Testville",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        osteopathId: 1,
        cabinetId: null
      } as Patient,
      {
        id: 1003,
        firstName: "Sophie",
        lastName: "Bernard",
        email: "sophie.bernard@demo.com",
        phone: "06.55.44.33.22",
        birthDate: "1992-11-08",
        gender: "Femme",
        address: "789 Boulevard Fictif, Simulville",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        osteopathId: 1,
        cabinetId: null
      } as Patient
    ];
  }

  /**
   * Génère des rendez-vous fictifs
   */
  private generateDemoAppointments(patients: Patient[]): Appointment[] {
    const appointments: Appointment[] = [];
    const now = new Date();
    
    patients.forEach((patient, index) => {
      // Rendez-vous passé
      const pastDate = new Date(now.getTime() - (index + 1) * 7 * 24 * 60 * 60 * 1000);
      appointments.push({
        id: 2001 + index * 2,
        patientId: patient.id,
        osteopathId: 1,
        cabinetId: null,
        date: pastDate.toISOString(),
        start: pastDate.toISOString(),
        end: new Date(pastDate.getTime() + 60 * 60 * 1000).toISOString(),
        reason: "Consultation démo passée",
        status: "COMPLETED",
        notes: `Séance terminée pour ${patient.firstName}`,
        notificationSent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Rendez-vous futur
      const futureDate = new Date(now.getTime() + (index + 1) * 7 * 24 * 60 * 60 * 1000);
      appointments.push({
        id: 2002 + index * 2,
        patientId: patient.id,
        osteopathId: 1,
        cabinetId: null,
        date: futureDate.toISOString(),
        start: futureDate.toISOString(),
        end: new Date(futureDate.getTime() + 60 * 60 * 1000).toISOString(),
        reason: "Consultation démo programmée",
        status: "SCHEDULED",
        notes: `Rendez-vous programmé pour ${patient.firstName}`,
        notificationSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    return appointments;
  }

  /**
   * Génère des factures fictives
   */
  private generateDemoInvoices(appointments: Appointment[]): Invoice[] {
    return appointments
      .filter(apt => apt.status === "COMPLETED")
      .map((appointment, index) => ({
        id: 3001 + index,
        patientId: appointment.patientId,
        osteopathId: appointment.osteopathId,
        appointmentId: appointment.id,
        amount: 60 + (index * 5),
        date: appointment.date,
        paymentStatus: index % 2 === 0 ? "PAID" : "PENDING",
        notes: `Facture démo pour consultation`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })) as Invoice[];
  }

  /**
   * Stocke les données démo dans le stockage local
   */
  private async storeDemoDataLocally(
    patients: Patient[], 
    appointments: Appointment[], 
    invoices: Invoice[]
  ): Promise<void> {
    try {
      // Stocker les patients
      for (const patient of patients) {
        await hdsLocalDataService.patients.create(patient);
      }

      // Note: Les rendez-vous et factures ne sont pas encore implémentés dans le service local
      // Ils seront ajoutés dans une prochaine itération
      
      console.log(`📦 Données démo stockées: ${patients.length} patients`);
    } catch (error) {
      console.error("Erreur lors du stockage des données démo:", error);
      throw error;
    }
  }

  /**
   * Supprime les données démo du stockage local
   */
  private async clearDemoDataFromStorage(): Promise<void> {
    try {
      if (!this.currentSession) return;

      // Supprimer tous les patients de la session
      for (const patient of this.currentSession.patients) {
        await hdsLocalDataService.patients.delete(patient.id);
      }

      console.log("🗑️ Données démo supprimées du stockage local");
    } catch (error) {
      console.error("Erreur lors de la suppression des données démo:", error);
    }
  }

  /**
   * Programme la suppression automatique de la session
   */
  private scheduleSessionCleanup(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    if (this.currentSession) {
      const timeUntilExpiry = this.currentSession.expiresAt.getTime() - Date.now();
      
      this.sessionTimeoutId = setTimeout(() => {
        console.log("⏰ Suppression automatique de la session démo");
        this.clearCurrentSession();
      }, Math.max(0, timeUntilExpiry));
    }
  }

  /**
   * Nettoie les sessions expirées au démarrage
   */
  private cleanupExpiredSessions(): void {
    // Cette méthode pourrait être étendue pour nettoyer les données
    // persistantes d'anciennes sessions en cas de crash de l'application
    console.log("🔍 Vérification des sessions expirées au démarrage");
  }

  /**
   * Exporte les données sensibles pour transfert USB
   */
  async exportSensitiveData(password: string): Promise<{
    data: ArrayBuffer;
    filename: string;
  }> {
    if (!this.currentSession) {
      throw new Error("Aucune session démo active");
    }

    // Créer un export chiffré avec mot de passe
    const exportData = {
      sessionId: this.currentSession.sessionId,
      exportDate: new Date().toISOString(),
      patients: this.currentSession.patients,
      appointments: this.currentSession.appointments,
      invoices: this.currentSession.invoices
    };

    // Simuler le chiffrement (en production, utiliser crypto-js)
    const jsonData = JSON.stringify(exportData, null, 2);
    const encoder = new TextEncoder();
    const buffer = encoder.encode(jsonData);

    const filename = `hds_demo_export_${Date.now()}.phub`;

    return {
      data: buffer.buffer,
      filename
    };
  }
}

export const hdsDemoService = HDSDemoService.getInstance();