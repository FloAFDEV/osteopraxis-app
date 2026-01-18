/**
 * Service HDS pour les Comptes-Rendus ostéopathiques
 * Stockage 100% LOCAL et CHIFFRÉ (AES-256-GCM)
 * AUCUNE donnée CR ne transite vers le cloud
 */

import { EnhancedSecureStorage } from '../security/enhanced-secure-storage';
import { ConsultationReport, CreateConsultationReportPayload } from '@/types';

class HDSSecureConsultationReportService {
  private storage: EnhancedSecureStorage<ConsultationReport>;

  constructor() {
    this.storage = new EnhancedSecureStorage<ConsultationReport>('consultation_reports');
  }

  // ===========================================================================
  // CRUD Comptes-Rendus - 100% LOCAL
  // ===========================================================================

  /**
   * Créer un nouveau compte-rendu (LOCAL uniquement)
   */
  async createConsultationReport(
    reportData: CreateConsultationReportPayload
  ): Promise<ConsultationReport> {
    try {
      console.log('🔐 Création CR dans le stockage HDS sécurisé (LOCAL UNIQUEMENT)...');

      const newReport: ConsultationReport = {
        id: Date.now(), // ID temporaire basé sur timestamp
        ...reportData,
        chiefComplaint: reportData.chiefComplaint || '',
        historyOfPresentIllness: reportData.historyOfPresentIllness || null,
        painScale: reportData.painScale || null,
        observation: reportData.observation || null,
        palpation: reportData.palpation || null,
        mobility: reportData.mobility || null,
        testsPerformed: reportData.testsPerformed || null,
        diagnosis: reportData.diagnosis || null,
        techniquesUsed: reportData.techniquesUsed || null,
        treatmentNotes: reportData.treatmentNotes || null,
        treatmentAreas: reportData.treatmentAreas || null,
        outcome: reportData.outcome || null,
        recommendations: reportData.recommendations || null,
        nextAppointmentSuggested: reportData.nextAppointmentSuggested || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedReport = await this.storage.save(newReport);
      console.log('✅ CR créé et sécurisé localement:', savedReport.id);

      return savedReport;
    } catch (error) {
      console.error('❌ Erreur création CR HDS sécurisé:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les comptes-rendus (LOCAL)
   */
  async getAllConsultationReports(): Promise<ConsultationReport[]> {
    try {
      const reports = await this.storage.getAll();
      console.log(`📖 ${reports.length} CR HDS récupérés depuis le stockage local sécurisé`);
      return reports;
    } catch (error) {
      console.error('❌ Erreur récupération CR HDS:', error);
      return [];
    }
  }

  /**
   * Récupérer un compte-rendu par ID (LOCAL)
   */
  async getConsultationReportById(id: number): Promise<ConsultationReport | null> {
    try {
      const report = await this.storage.getById(id);
      if (report) {
        console.log(`📖 CR ${id} trouvé dans le stockage HDS sécurisé`);
      }
      return report;
    } catch (error) {
      console.error(`❌ Erreur récupération CR ${id}:`, error);
      return null;
    }
  }

  /**
   * Récupérer tous les CR d'un patient (LOCAL)
   */
  async getConsultationReportsByPatientId(patientId: number): Promise<ConsultationReport[]> {
    try {
      const allReports = await this.getAllConsultationReports();
      const patientReports = allReports.filter(report => report.patientId === patientId);
      console.log(`📖 ${patientReports.length} CR trouvés pour patient ${patientId}`);
      return patientReports;
    } catch (error) {
      console.error(`❌ Erreur récupération CR patient ${patientId}:`, error);
      return [];
    }
  }

  /**
   * Récupérer le CR lié à un rendez-vous (LOCAL)
   */
  async getConsultationReportByAppointmentId(appointmentId: number): Promise<ConsultationReport | null> {
    try {
      const allReports = await this.getAllConsultationReports();
      const report = allReports.find(r => r.appointmentId === appointmentId);
      if (report) {
        console.log(`📖 CR trouvé pour RDV ${appointmentId}`);
      }
      return report || null;
    } catch (error) {
      console.error(`❌ Erreur récupération CR RDV ${appointmentId}:`, error);
      return null;
    }
  }

  /**
   * Mettre à jour un compte-rendu (LOCAL)
   */
  async updateConsultationReport(
    id: number,
    updates: Partial<ConsultationReport>
  ): Promise<ConsultationReport> {
    try {
      console.log(`🔐 Mise à jour CR ${id} dans le stockage HDS sécurisé...`);

      const updatedReport: Partial<ConsultationReport> = {
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      const result = await this.storage.update(id, updatedReport);
      console.log(`✅ CR ${id} mis à jour dans le stockage HDS sécurisé`);

      return result;
    } catch (error) {
      console.error(`❌ Erreur mise à jour CR ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer un compte-rendu (LOCAL)
   */
  async deleteConsultationReport(id: number): Promise<boolean> {
    try {
      console.log(`🗑️ Suppression CR ${id} du stockage HDS sécurisé...`);
      const success = await this.storage.delete(id);
      console.log(`${success ? '✅' : '❌'} CR ${id} ${success ? 'supprimé' : 'erreur suppression'}`);
      return success;
    } catch (error) {
      console.error(`❌ Erreur suppression CR ${id}:`, error);
      return false;
    }
  }

  // ===========================================================================
  // Utilitaires
  // ===========================================================================

  /**
   * Rechercher des CR par mot-clé (LOCAL)
   */
  async searchConsultationReports(query: string): Promise<ConsultationReport[]> {
    try {
      const allReports = await this.getAllConsultationReports();
      const lowerQuery = query.toLowerCase();

      return allReports.filter(report => {
        const searchableText = [
          report.chiefComplaint,
          report.historyOfPresentIllness,
          report.diagnosis,
          report.treatmentNotes,
          report.outcome,
          report.recommendations,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(lowerQuery);
      });
    } catch (error) {
      console.error('❌ Erreur recherche CR:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques des CR
   */
  async getConsultationReportStats(): Promise<{
    total: number;
    thisMonth: number;
    thisYear: number;
    byTechnique: Record<string, number>;
    byArea: Record<string, number>;
  }> {
    try {
      const allReports = await this.getAllConsultationReports();
      const now = new Date();
      const thisMonth = allReports.filter(r => {
        const reportDate = new Date(r.date);
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      });
      const thisYear = allReports.filter(r => {
        const reportDate = new Date(r.date);
        return reportDate.getFullYear() === now.getFullYear();
      });

      // Compter les techniques utilisées
      const byTechnique: Record<string, number> = {};
      allReports.forEach(report => {
        if (report.techniquesUsed) {
          report.techniquesUsed.forEach(technique => {
            byTechnique[technique] = (byTechnique[technique] || 0) + 1;
          });
        }
      });

      // Compter les zones traitées
      const byArea: Record<string, number> = {};
      allReports.forEach(report => {
        if (report.treatmentAreas) {
          report.treatmentAreas.forEach(area => {
            byArea[area] = (byArea[area] || 0) + 1;
          });
        }
      });

      return {
        total: allReports.length,
        thisMonth: thisMonth.length,
        thisYear: thisYear.length,
        byTechnique,
        byArea,
      };
    } catch (error) {
      console.error('❌ Erreur stats CR:', error);
      return {
        total: 0,
        thisMonth: 0,
        thisYear: 0,
        byTechnique: {},
        byArea: {},
      };
    }
  }

  /**
   * Export sécurisé des CR (pour backup)
   */
  async exportSecure(): Promise<void> {
    try {
      await this.storage.exportSecure();
      console.log('✅ Export sécurisé des CR réussi');
    } catch (error) {
      console.error('❌ Erreur export sécurisé CR:', error);
      throw error;
    }
  }

  /**
   * Import sécurisé des CR (depuis backup)
   */
  async importSecure(file: File): Promise<number> {
    try {
      const count = await this.storage.importSecure(file);
      console.log(`✅ Import sécurisé de ${count} CR réussi`);
      return count;
    } catch (error) {
      console.error('❌ Erreur import sécurisé CR:', error);
      throw error;
    }
  }

  /**
   * Statistiques de stockage
   */
  async getStorageStats() {
    try {
      const stats = await this.storage.getStorageStats();
      return stats;
    } catch (error) {
      console.error('❌ Erreur stats stockage CR:', error);
      return null;
    }
  }
}

// ===========================================================================
// Export singleton
// ===========================================================================

export const hdsSecureConsultationReportService = new HDSSecureConsultationReportService();
