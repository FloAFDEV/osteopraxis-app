import { api } from '@/services/api';
import CryptoJS from 'crypto-js';
import type { SecureExportData } from './usb-export-service';

export interface ImportResult {
  success: boolean;
  imported: {
    patients: number;
    appointments: number;
    invoices: number;
  };
  errors: string[];
  skipped: {
    patients: number;
    appointments: number;
    invoices: number;
  };
  conflicts: ImportConflict[];
}

export interface ImportConflict {
  type: 'patient' | 'appointment' | 'invoice';
  existingId: number;
  importedData: any;
  reason: string;
}

export interface ImportOptions {
  password: string;
  conflictResolution: 'skip' | 'overwrite' | 'merge';
  validateIntegrity: boolean;
}

export class USBImportService {
  /**
   * Importe les données depuis un fichier chiffré
   */
  async importSecureData(file: File, options: ImportOptions): Promise<ImportResult> {
    const { usbMonitoringService } = await import('./usb-monitoring-service');
    const timer = usbMonitoringService.startOperation('import');
    
    const result: ImportResult = {
      success: false,
      imported: { patients: 0, appointments: 0, invoices: 0 },
      errors: [],
      skipped: { patients: 0, appointments: 0, invoices: 0 },
      conflicts: []
    };

    try {
      console.log('🔓 Starting secure data import...');

      // Lire le fichier
      const fileContent = await this.readFileAsText(file);
      
      // Déchiffrer les données
      timer.startDecryption();
      const decryptedData = this.decryptData(fileContent, options.password);
      const decryptionTime = timer.endDecryption();
      const exportData: SecureExportData = JSON.parse(decryptedData);

      // Valider l'intégrité si demandé
      if (options.validateIntegrity) {
        const isValid = this.validateDataIntegrity(exportData);
        if (!isValid) {
          result.errors.push('Échec de la validation d\'intégrité des données');
          return result;
        }
      }

      // Importer les patients
      if (exportData.patients.length > 0) {
        const patientResult = await this.importPatients(exportData.patients, options);
        result.imported.patients = patientResult.imported;
        result.skipped.patients = patientResult.skipped;
        result.conflicts.push(...patientResult.conflicts);
        result.errors.push(...patientResult.errors);
      }

      // Importer les rendez-vous
      if (exportData.appointments.length > 0) {
        const appointmentResult = await this.importAppointments(exportData.appointments, options);
        result.imported.appointments = appointmentResult.imported;
        result.skipped.appointments = appointmentResult.skipped;
        result.conflicts.push(...appointmentResult.conflicts);
        result.errors.push(...appointmentResult.errors);
      }

      // Importer les factures
      if (exportData.invoices.length > 0) {
        const invoiceResult = await this.importInvoices(exportData.invoices, options);
        result.imported.invoices = invoiceResult.imported;
        result.skipped.invoices = invoiceResult.skipped;
        result.conflicts.push(...invoiceResult.conflicts);
        result.errors.push(...invoiceResult.errors);
      }

      result.success = result.errors.length === 0;
      console.log('✅ Import completed', result);
      return result;

    } catch (error) {
      console.error('❌ Import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Erreur inconnue lors de l\'import');
      return result;
    }
  }

  /**
   * Déchiffre les données
   */
  private decryptData(encryptedData: string, password: string): string {
    try {
      // Décoder depuis Base64
      const combined = CryptoJS.enc.Base64.parse(encryptedData);
      
      // Extraire salt (32 bytes), IV (16 bytes) et données chiffrées
      const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 8));
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(8, 12));
      const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(12));
      
      // Dériver la clé
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });
      
      // Déchiffrer
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Mot de passe incorrect ou fichier corrompu');
    }
  }

  /**
   * Valide l'intégrité des données
   */
  private validateDataIntegrity(data: SecureExportData): boolean {
    try {
      const dataString = JSON.stringify({
        patients: data.patients,
        appointments: data.appointments,
        invoices: data.invoices
      });
      
      const calculatedChecksum = CryptoJS.SHA256(dataString).toString();
      return calculatedChecksum === data.metadata.checksum;
    } catch {
      return false;
    }
  }

  /**
   * Importe les patients
   */
  private async importPatients(patients: any[], options: ImportOptions) {
    const result = { imported: 0, skipped: 0, conflicts: [], errors: [] };

    for (const patient of patients) {
      try {
        // Vérifier si le patient existe déjà (par email ou nom+prénom+date de naissance)
        const existingPatients = await api.getPatients();
        const existing = existingPatients.find((p: any) => 
          p.email === patient.email || 
          (p.firstName === patient.firstName && 
           p.lastName === patient.lastName && 
           p.birthDate === patient.birthDate)
        );

        if (existing) {
          if (options.conflictResolution === 'skip') {
            result.skipped++;
            continue;
          } else if (options.conflictResolution === 'overwrite') {
            await api.updatePatient({ ...patient, id: existing.id });
            result.imported++;
          } else {
            result.conflicts.push({
              type: 'patient',
              existingId: existing.id,
              importedData: patient,
              reason: 'Patient existant avec même email ou identité'
            });
            result.skipped++;
          }
        } else {
          // Supprimer l'ID pour créer un nouveau patient
          const { id, createdAt, updatedAt, ...patientData } = patient;
          await api.createPatient(patientData);
          result.imported++;
        }
      } catch (error) {
        result.errors.push(`Erreur patient ${patient.firstName} ${patient.lastName}: ${error}`);
        result.skipped++;
      }
    }

    return result;
  }

  /**
   * Importe les rendez-vous
   */
  private async importAppointments(appointments: any[], options: ImportOptions) {
    const result = { imported: 0, skipped: 0, conflicts: [], errors: [] };

    for (const appointment of appointments) {
      try {
        // Vérifier les conflits de planning
        const existingAppointments = await api.getAppointments();
        const conflict = existingAppointments.find((a: any) => 
          a.osteopathId === appointment.osteopathId &&
          Math.abs(new Date(a.date).getTime() - new Date(appointment.date).getTime()) < 3600000 // 1 heure
        );

        if (conflict) {
          result.conflicts.push({
            type: 'appointment',
            existingId: conflict.id,
            importedData: appointment,
            reason: 'Conflit horaire détecté'
          });
          result.skipped++;
        } else {
          const { id, createdAt, updatedAt, ...appointmentData } = appointment;
          await api.createAppointment(appointmentData);
          result.imported++;
        }
      } catch (error) {
        result.errors.push(`Erreur rendez-vous ${appointment.date}: ${error}`);
        result.skipped++;
      }
    }

    return result;
  }

  /**
   * Importe les factures
   */
  private async importInvoices(invoices: any[], options: ImportOptions) {
    const result = { imported: 0, skipped: 0, conflicts: [], errors: [] };

    for (const invoice of invoices) {
      try {
        // Vérifier si la facture existe déjà
        const existingInvoices = await api.getInvoices();
        const existing = existingInvoices.find((i: any) => 
          i.patientId === invoice.patientId &&
          i.date === invoice.date &&
          i.amount === invoice.amount
        );

        if (existing && options.conflictResolution === 'skip') {
          result.skipped++;
          continue;
        }

        const { id, createdAt, updatedAt, ...invoiceData } = invoice;
        await api.createInvoice(invoiceData);
        result.imported++;
      } catch (error) {
        result.errors.push(`Erreur facture ${invoice.date}: ${error}`);
        result.skipped++;
      }
    }

    return result;
  }

  /**
   * Lit un fichier comme texte
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsText(file);
    });
  }
}

export const usbImportService = new USBImportService();