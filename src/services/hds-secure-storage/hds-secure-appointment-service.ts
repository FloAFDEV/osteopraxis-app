/**
 * 🔐 Service Rendez-vous HDS Sécurisé - STOCKAGE LOCAL EXCLUSIF
 * 
 * Service pour la gestion des rendez-vous avec stockage local sécurisé uniquement
 * Aucune donnée HDS ne va vers Supabase - Conformité HDS stricte
 */

import { Appointment } from '@/types';
import { hdsSecureManager } from './hds-secure-manager';
import { isDemoSession } from '@/utils/demo-detection';

interface HDSSecureAppointmentService {
  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: number): Promise<Appointment | null>;
  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;
}

class HDSSecureAppointmentServiceImpl implements HDSSecureAppointmentService {
  
  /**
   * Vérifier que nous ne sommes PAS en mode démo
   */
  private async ensureConnectedMode(): Promise<void> {
    const isDemoMode = await isDemoSession();
    if (isDemoMode) {
      throw new Error('🚨 VIOLATION SÉCURITÉ: Service HDS sécurisé appelé en mode démo. Utilisez demo-local-storage.');
    }
  }

  /**
   * Obtenir le stockage sécurisé pour les rendez-vous
   * Retourne null si non configuré
   */
  private async getSecureStorage() {
    await this.ensureConnectedMode();
    const storage = hdsSecureManager.getSecureStorage('appointments');
    return storage;
  }

  /**
   * Générer un ID unique pour un nouveau rendez-vous
   */
  private generateAppointmentId(): number {
    return Math.floor(Math.random() * 2000000000) + 1;
  }

  /**
   * 📖 Récupération des rendez-vous - STOCKAGE LOCAL EXCLUSIF
   */
  async getAppointments(): Promise<Appointment[]> {
    try {
      const storage = await this.getSecureStorage();
      if (!storage) return []; // Silencieux si non configuré
      
      const appointments = await storage.loadRecords<Appointment>();
      console.log(`📖 ${appointments.length} rendez-vous HDS récupérés depuis le stockage local sécurisé`);
      return appointments;
    } catch (error) {
      return []; // Silencieux
    }
  }

  /**
   * 🔍 Récupération d'un rendez-vous par ID - STOCKAGE LOCAL EXCLUSIF  
   */
  async getAppointmentById(id: number): Promise<Appointment | null> {
    try {
      const storage = await this.getSecureStorage();
      if (!storage) return null;
      
      const appointment = await storage.getRecordById<Appointment>(id);
      
      if (appointment) {
        console.log(`📖 Rendez-vous ${id} trouvé dans le stockage HDS sécurisé`);
      }
      
      return appointment;
    } catch (error) {
      return null; // Silencieux
    }
  }

  /**
   * 🏗️ Création d'un nouveau rendez-vous - STOCKAGE LOCAL EXCLUSIF
   */
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      await this.ensureConnectedMode();
      
      const storage = await this.getSecureStorage();
      if (!storage) {
        throw new Error('Configuration du stockage HDS sécurisé requise pour créer des rendez-vous');
      }
      
      // Créer le rendez-vous avec métadonnées
      const newAppointment: Appointment = {
        ...appointmentData,
        id: this.generateAppointmentId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔐 Création rendez-vous dans le stockage HDS sécurisé (LOCAL UNIQUEMENT)...');
      const savedAppointment = await storage.saveRecord(newAppointment);
      
      console.log('✅ Rendez-vous créé et sécurisé localement:', savedAppointment.id);
      return savedAppointment;
    } catch (error) {
      console.error('❌ Erreur création rendez-vous HDS sécurisé:', error);
      throw error;
    }
  }

  /**
   * 🔄 Mise à jour d'un rendez-vous - STOCKAGE LOCAL EXCLUSIF
   */
  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment> {
    try {
      const storage = await this.getSecureStorage();
      
      // Vérifier que le rendez-vous existe
      const existingAppointment = await storage.getRecordById<Appointment>(id);
      if (!existingAppointment) {
        throw new Error(`Rendez-vous ${id} non trouvé dans le stockage HDS sécurisé`);
      }

      // Fusionner les modifications
      const updatedAppointment: Appointment = {
        ...existingAppointment,
        ...updates,
        id, // S'assurer que l'ID ne change pas
        updatedAt: new Date().toISOString()
      };

      console.log(`🔐 Mise à jour rendez-vous ${id} dans le stockage HDS sécurisé...`);
      const savedAppointment = await storage.saveRecord(updatedAppointment);
      
      console.log(`✅ Rendez-vous ${id} mis à jour dans le stockage HDS sécurisé`);
      return savedAppointment;
    } catch (error) {
      console.error(`❌ Erreur mise à jour rendez-vous ${id}:`, error);
      throw error;
    }
  }

  /**
   * 🗑️ Suppression d'un rendez-vous - STOCKAGE LOCAL EXCLUSIF
   */
  async deleteAppointment(id: number): Promise<boolean> {
    try {
      const storage = await this.getSecureStorage();
      
      console.log(`🗑️ Suppression rendez-vous ${id} du stockage HDS sécurisé...`);
      const success = await storage.deleteRecord(id);
      
      console.log(`${success ? '✅' : '❌'} Rendez-vous ${id} ${success ? 'supprimé' : 'erreur suppression'}`);
      return success;
    } catch (error) {
      console.error(`❌ Erreur suppression rendez-vous ${id}:`, error);
      return false;
    }
  }

  /**
   * 📊 Statistiques du stockage rendez-vous sécurisé
   */
  async getStorageStats(): Promise<{
    count: number;
    size: number;
    lastModified: string;
    integrity: boolean;
  }> {
    try {
      const storage = await this.getSecureStorage();
      return await storage.getStats();
    } catch (error) {
      console.error('❌ Erreur stats stockage rendez-vous:', error);
      return { count: 0, size: 0, lastModified: '', integrity: false };
    }
  }
}

// Instance singleton
export const hdsSecureAppointmentService = new HDSSecureAppointmentServiceImpl();

// Export du type pour l'utilisation
export type { HDSSecureAppointmentService };