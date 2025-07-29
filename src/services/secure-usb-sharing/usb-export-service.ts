import { hybridDataManager } from '../hybrid-data-adapter/hybrid-manager';
import CryptoJS from 'crypto-js';

export interface SecureExportData {
  patients: any[];
  appointments: any[];
  invoices: any[];
  metadata: {
    exportDate: string;
    version: string;
    cabinetId?: number;
    osteopathId: number;
    checksum: string;
  };
}

export interface ExportOptions {
  password: string;
  includePatients: boolean;
  includeAppointments: boolean;
  includeInvoices: boolean;
  patientIds?: number[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class USBExportService {
  /**
   * Exporte les données sélectionnées avec chiffrement
   */
  async exportSecureData(options: ExportOptions): Promise<Blob> {
    try {
      console.log('🔒 Starting secure data export...');

      // Collecter les données selon les options
      const exportData: SecureExportData = {
        patients: [],
        appointments: [],
        invoices: [],
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          osteopathId: 1, // TODO: Get from current user
          checksum: ''
        }
      };

      // Exporter les patients
      if (options.includePatients) {
        let patients = await hybridDataManager.get('patients');
        
        // Filtrer par IDs si spécifié
        if (options.patientIds?.length) {
          patients = patients.filter((p: any) => options.patientIds!.includes(p.id));
        }
        
        exportData.patients = patients;
        console.log(`📊 Exported ${patients.length} patients`);
      }

      // Exporter les rendez-vous
      if (options.includeAppointments) {
        let appointments = await hybridDataManager.get('appointments');
        
        // Filtrer par patients et date si spécifié
        if (options.patientIds?.length) {
          appointments = appointments.filter((a: any) => 
            options.patientIds!.includes(a.patientId)
          );
        }
        
        if (options.dateRange) {
          appointments = appointments.filter((a: any) => {
            const appointmentDate = new Date(a.date);
            return appointmentDate >= options.dateRange!.start && 
                   appointmentDate <= options.dateRange!.end;
          });
        }
        
        exportData.appointments = appointments;
        console.log(`📅 Exported ${appointments.length} appointments`);
      }

      // Exporter les factures
      if (options.includeInvoices) {
        let invoices = await hybridDataManager.get('invoices');
        
        // Filtrer par patients si spécifié
        if (options.patientIds?.length) {
          invoices = invoices.filter((i: any) => 
            options.patientIds!.includes(i.patientId)
          );
        }
        
        exportData.invoices = invoices;
        console.log(`💰 Exported ${invoices.length} invoices`);
      }

      // Générer le checksum
      const dataString = JSON.stringify({
        patients: exportData.patients,
        appointments: exportData.appointments,
        invoices: exportData.invoices
      });
      exportData.metadata.checksum = CryptoJS.SHA256(dataString).toString();

      // Chiffrer les données
      const encryptedData = this.encryptData(JSON.stringify(exportData), options.password);
      
      // Créer le fichier
      const blob = new Blob([encryptedData], { 
        type: 'application/octet-stream' 
      });

      console.log('✅ Secure export completed');
      return blob;

    } catch (error) {
      console.error('❌ Export failed:', error);
      throw new Error('Échec de l\'export des données');
    }
  }

  /**
   * Chiffre les données avec AES-256
   */
  private encryptData(data: string, password: string): string {
    try {
      // Générer un salt aléatoire
      const salt = CryptoJS.lib.WordArray.random(256/8);
      
      // Dériver la clé avec PBKDF2
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });
      
      // Générer un IV aléatoire
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      // Chiffrer avec AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Combiner salt + iv + données chiffrées
      const combined = salt.concat(iv).concat(encrypted.ciphertext);
      
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      throw new Error('Échec du chiffrement des données');
    }
  }

  /**
   * Valide les options d'export
   */
  validateExportOptions(options: ExportOptions): string[] {
    const errors: string[] = [];

    if (!options.password || options.password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!options.includePatients && !options.includeAppointments && !options.includeInvoices) {
      errors.push('Vous devez sélectionner au moins un type de données à exporter');
    }

    if (options.dateRange) {
      if (options.dateRange.start >= options.dateRange.end) {
        errors.push('La date de fin doit être postérieure à la date de début');
      }
    }

    return errors;
  }

  /**
   * Génère le nom de fichier pour l'export
   */
  generateFileName(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    return `patienthub-export-${dateStr}-${timeStr}.phub`;
  }
}

export const usbExportService = new USBExportService();