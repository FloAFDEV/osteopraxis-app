/**
 * Service de validation et monitoring pour le partage USB sécurisé
 */

import { hybridDataManager } from '../hybrid-data-adapter/hybrid-manager';
import type { SecureExportData, ImportResult } from './index';

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
  performance: PerformanceMetrics;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'data' | 'security' | 'performance' | 'integrity';
  message: string;
  details?: any;
}

export interface PerformanceMetrics {
  exportTime?: number;
  importTime?: number;
  fileSize?: number;
  compressionRatio?: number;
  encryptionTime?: number;
  decryptionTime?: number;
}

export class USBValidationService {
  /**
   * Valide les données avant export
   */
  async validateExportData(options: any): Promise<ValidationReport> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];
    
    try {
      // Validation des données patients
      if (options.includePatients) {
        const patients = await hybridDataManager.get('patients');
        await this.validatePatientData(patients, issues);
      }

      // Validation des rendez-vous
      if (options.includeAppointments) {
        const appointments = await hybridDataManager.get('appointments');
        await this.validateAppointmentData(appointments, issues);
      }

      // Validation des factures
      if (options.includeInvoices) {
        const invoices = await hybridDataManager.get('invoices');
        await this.validateInvoiceData(invoices, issues);
      }

      // Validation de sécurité
      this.validateSecurityOptions(options, issues);

      const endTime = Date.now();
      const performanceMetrics: PerformanceMetrics = {
        exportTime: endTime - startTime
      };

      return {
        isValid: !issues.some(issue => issue.type === 'error'),
        issues,
        performance: performanceMetrics
      };

    } catch (error) {
      issues.push({
        type: 'error',
        category: 'data',
        message: 'Erreur lors de la validation des données',
        details: error
      });

      return {
        isValid: false,
        issues,
        performance: { exportTime: Date.now() - startTime }
      };
    }
  }

  /**
   * Valide les données après import
   */
  async validateImportResult(result: ImportResult): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];

    // Vérifier les statistiques d'import
    if (result.errors.length > 0) {
      issues.push({
        type: 'warning',
        category: 'data',
        message: `${result.errors.length} erreurs détectées lors de l'import`,
        details: result.errors
      });
    }

    // Vérifier les conflits
    if (result.conflicts.length > 0) {
      issues.push({
        type: 'info',
        category: 'data',
        message: `${result.conflicts.length} conflits détectés`,
        details: result.conflicts
      });
    }

    // Valider l'intégrité post-import
    await this.validatePostImportIntegrity(result, issues);

    return {
      isValid: result.success && issues.filter(i => i.type === 'error').length === 0,
      issues,
      performance: {}
    };
  }

  /**
   * Valide l'intégrité d'un fichier exporté
   */
  async validateSecureFile(file: File): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];

    // Vérifier l'extension
    if (!file.name.endsWith('.phub')) {
      issues.push({
        type: 'error',
        category: 'security',
        message: 'Extension de fichier invalide. Seuls les fichiers .phub sont acceptés.'
      });
    }

    // Vérifier la taille
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      issues.push({
        type: 'error',
        category: 'performance',
        message: `Fichier trop volumineux (${Math.round(file.size / 1024 / 1024)}MB). Maximum autorisé: 100MB`
      });
    }

    // Vérifier que le fichier n'est pas vide
    if (file.size === 0) {
      issues.push({
        type: 'error',
        category: 'data',
        message: 'Le fichier est vide'
      });
    }

    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      performance: { fileSize: file.size }
    };
  }

  /**
   * Valide les données patients
   */
  private async validatePatientData(patients: any[], issues: ValidationIssue[]): Promise<void> {
    if (patients.length === 0) {
      issues.push({
        type: 'warning',
        category: 'data',
        message: 'Aucun patient à exporter'
      });
      return;
    }

    // Vérifier les champs obligatoires
    const missingFields = patients.filter(p => !p.prenom || !p.nom);
    if (missingFields.length > 0) {
      issues.push({
        type: 'warning',
        category: 'data',
        message: `${missingFields.length} patients avec des champs obligatoires manquants`,
        details: missingFields.map(p => ({ id: p.id, nom: p.nom, prenom: p.prenom }))
      });
    }

    // Vérifier les données sensibles
    const patientsWithSensitiveData = patients.filter(p => 
      p.numeroSecuriteSociale || p.antecedentsMedicaux || p.allergies
    );
    
    if (patientsWithSensitiveData.length > 0) {
      issues.push({
        type: 'info',
        category: 'security',
        message: `${patientsWithSensitiveData.length} patients contiennent des données médicales sensibles`,
        details: 'Ces données seront chiffrées avec AES-256'
      });
    }

    console.log(`✅ Validation: ${patients.length} patients analysés`);
  }

  /**
   * Valide les données de rendez-vous
   */
  private async validateAppointmentData(appointments: any[], issues: ValidationIssue[]): Promise<void> {
    if (appointments.length === 0) {
      issues.push({
        type: 'warning',
        category: 'data',
        message: 'Aucun rendez-vous à exporter'
      });
      return;
    }

    // Vérifier les rendez-vous futurs
    const futureAppointments = appointments.filter(a => new Date(a.date) > new Date());
    if (futureAppointments.length > 0) {
      issues.push({
        type: 'info',
        category: 'data',
        message: `${futureAppointments.length} rendez-vous futurs seront exportés`
      });
    }

    // Vérifier les conflits potentiels
    const sortedAppointments = appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let conflicts = 0;
    
    for (let i = 0; i < sortedAppointments.length - 1; i++) {
      const current = sortedAppointments[i];
      const next = sortedAppointments[i + 1];
      
      const currentEnd = new Date(current.date);
      currentEnd.setMinutes(currentEnd.getMinutes() + (current.duree || 60));
      
      if (currentEnd > new Date(next.date)) {
        conflicts++;
      }
    }

    if (conflicts > 0) {
      issues.push({
        type: 'warning',
        category: 'data',
        message: `${conflicts} conflits de planning détectés dans les rendez-vous`
      });
    }

    console.log(`✅ Validation: ${appointments.length} rendez-vous analysés`);
  }

  /**
   * Valide les données de facturation
   */
  private async validateInvoiceData(invoices: any[], issues: ValidationIssue[]): Promise<void> {
    if (invoices.length === 0) {
      issues.push({
        type: 'warning',
        category: 'data',
        message: 'Aucune facture à exporter'
      });
      return;
    }

    // Vérifier les montants
    const invalidAmounts = invoices.filter(i => !i.montant || i.montant <= 0);
    if (invalidAmounts.length > 0) {
      issues.push({
        type: 'error',
        category: 'data',
        message: `${invalidAmounts.length} factures avec des montants invalides`,
        details: invalidAmounts.map(i => ({ id: i.id, montant: i.montant }))
      });
    }

    // Calculer le total des revenus
    const totalRevenue = invoices.reduce((sum, i) => sum + (i.montant || 0), 0);
    if (totalRevenue > 100000) {
      issues.push({
        type: 'info',
        category: 'security',
        message: `Export de données financières importantes (${totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })})`,
        details: 'Assurez-vous de sécuriser le fichier appropriément'
      });
    }

    console.log(`✅ Validation: ${invoices.length} factures analysées`);
  }

  /**
   * Valide les options de sécurité
   */
  private validateSecurityOptions(options: any, issues: ValidationIssue[]): void {
    // Vérifier la force du mot de passe
    if (options.password) {
      const password = options.password;
      
      if (password.length < 12) {
        issues.push({
          type: 'warning',
          category: 'security',
          message: 'Mot de passe court. Recommandé: minimum 12 caractères'
        });
      }

      if (!/[A-Z]/.test(password)) {
        issues.push({
          type: 'warning',
          category: 'security',
          message: 'Mot de passe sans majuscule. Ajoutez des majuscules pour plus de sécurité'
        });
      }

      if (!/[0-9]/.test(password)) {
        issues.push({
          type: 'warning',
          category: 'security',
          message: 'Mot de passe sans chiffre. Ajoutez des chiffres pour plus de sécurité'
        });
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        issues.push({
          type: 'warning',
          category: 'security',
          message: 'Mot de passe sans caractère spécial. Ajoutez des caractères spéciaux pour plus de sécurité'
        });
      }
    }
  }

  /**
   * Valide l'intégrité après import
   */
  private async validatePostImportIntegrity(result: ImportResult, issues: ValidationIssue[]): Promise<void> {
    try {
      // Vérifier que les données importées sont bien présentes
      const patients = await hybridDataManager.get('patients');
      const appointments = await hybridDataManager.get('appointments');
      const invoices = await hybridDataManager.get('invoices');

      // Vérifier la cohérence des données
      const orphanAppointments = appointments.filter((a: any) => 
        a.patientId && !patients.some((p: any) => p.id === a.patientId)
      );

      if (orphanAppointments.length > 0) {
        issues.push({
          type: 'warning',
          category: 'integrity',
          message: `${orphanAppointments.length} rendez-vous référencent des patients inexistants`,
          details: orphanAppointments.map((a: any) => ({ id: a.id, patientId: a.patientId }))
        });
      }

      const orphanInvoices = invoices.filter((i: any) => 
        i.patientId && !patients.some((p: any) => p.id === i.patientId)
      );

      if (orphanInvoices.length > 0) {
        issues.push({
          type: 'warning',
          category: 'integrity',
          message: `${orphanInvoices.length} factures référencent des patients inexistants`,
          details: orphanInvoices.map((i: any) => ({ id: i.id, patientId: i.patientId }))
        });
      }

    } catch (error) {
      issues.push({
        type: 'error',
        category: 'integrity',
        message: 'Erreur lors de la validation post-import',
        details: error
      });
    }
  }
}

export const usbValidationService = new USBValidationService();