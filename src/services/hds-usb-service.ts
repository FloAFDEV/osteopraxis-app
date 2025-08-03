/**
 * Service HDS USB - Export sécurisé des données sensibles
 * Conforme à la réglementation HDS pour le transfert de données de santé
 */

import { hdsDemoService } from "./hds-demo-service";
import { hdsLocalDataService } from "./hds-data-adapter/local-service";
import CryptoJS from "crypto-js";

interface HDSExportOptions {
  password: string;
  includePatients: boolean;
  includeAppointments: boolean;
  includeInvoices: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface HDSExportResult {
  success: boolean;
  filename: string;
  data?: ArrayBuffer;
  error?: string;
  warnings?: string[];
}

class HDSUSBService {
  private static instance: HDSUSBService;

  static getInstance(): HDSUSBService {
    if (!HDSUSBService.instance) {
      HDSUSBService.instance = new HDSUSBService();
    }
    return HDSUSBService.instance;
  }

  /**
   * Exporte les données sensibles HDS vers un fichier chiffré pour USB
   */
  async exportSensitiveData(options: HDSExportOptions): Promise<HDSExportResult> {
    try {
      console.log("🔐 Début de l'export HDS sécurisé");

      // Validation du mot de passe
      if (!this.isPasswordSecure(options.password)) {
        return {
          success: false,
          filename: "",
          error: "Le mot de passe doit contenir au moins 8 caractères avec majuscules, minuscules et chiffres"
        };
      }

      // Récupérer les données à exporter
      const exportData = await this.gatherExportData(options);
      
      if (this.isEmpty(exportData)) {
        return {
          success: false,
          filename: "",
          error: "Aucune donnée à exporter"
        };
      }

      // Chiffrer les données
      const encryptedData = this.encryptData(exportData, options.password);
      
      // Créer le fichier d'export
      const filename = this.generateFilename();
      const buffer = this.createExportBuffer(encryptedData, filename);

      console.log("✅ Export HDS terminé avec succès");
      
      return {
        success: true,
        filename,
        data: buffer,
        warnings: this.getSecurityWarnings()
      };

    } catch (error) {
      console.error("❌ Erreur lors de l'export HDS:", error);
      return {
        success: false,
        filename: "",
        error: `Erreur lors de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  /**
   * Importe et déchiffre un fichier HDS depuis USB
   */
  async importSensitiveData(file: File, password: string): Promise<HDSExportResult> {
    try {
      console.log("🔓 Début de l'import HDS sécurisé");

      // Vérifier le format du fichier
      if (!file.name.endsWith('.phub')) {
        return {
          success: false,
          filename: "",
          error: "Format de fichier invalide. Seuls les fichiers .phub sont acceptés."
        };
      }

      // Lire le fichier
      const fileBuffer = await file.arrayBuffer();
      const encryptedContent = new TextDecoder().decode(fileBuffer);

      // Déchiffrer les données
      const decryptedData = this.decryptData(encryptedContent, password);
      
      if (!decryptedData) {
        return {
          success: false,
          filename: "",
          error: "Mot de passe incorrect ou fichier corrompu"
        };
      }

      // Valider et traiter les données
      const importResult = await this.processImportedData(decryptedData);
      
      console.log("✅ Import HDS terminé avec succès");
      
      return {
        success: true,
        filename: file.name,
        warnings: [`${importResult.imported} éléments importés`]
      };

    } catch (error) {
      console.error("❌ Erreur lors de l'import HDS:", error);
      return {
        success: false,
        filename: "",
        error: `Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  /**
   * Récupère les données à exporter selon les options
   */
  private async gatherExportData(options: HDSExportOptions): Promise<any> {
    const exportData: any = {
      exportInfo: {
        date: new Date().toISOString(),
        source: "PatientHub HDS",
        version: "1.0"
      }
    };

    // Récupérer les patients si demandé
    if (options.includePatients) {
      if (hdsDemoService.isDemoModeActive()) {
        const session = hdsDemoService.getCurrentSession();
        exportData.patients = session?.patients || [];
      } else {
        try {
          exportData.patients = await hdsLocalDataService.patients.getAll();
        } catch (error) {
          console.warn("Impossible de récupérer les patients:", error);
          exportData.patients = [];
        }
      }
    }

    // Récupérer les rendez-vous si demandé
    if (options.includeAppointments) {
      if (hdsDemoService.isDemoModeActive()) {
        const session = hdsDemoService.getCurrentSession();
        exportData.appointments = session?.appointments || [];
      } else {
        // À implémenter quand les appointments seront dans le service local
        exportData.appointments = [];
      }
    }

    // Récupérer les factures si demandé
    if (options.includeInvoices) {
      if (hdsDemoService.isDemoModeActive()) {
        const session = hdsDemoService.getCurrentSession();
        exportData.invoices = session?.invoices || [];
      } else {
        // À implémenter quand les invoices seront dans le service local
        exportData.invoices = [];
      }
    }

    return exportData;
  }

  /**
   * Chiffre les données avec le mot de passe fourni
   */
  private encryptData(data: any, password: string): string {
    const jsonData = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonData, password).toString();
    
    // Ajouter des métadonnées de chiffrement
    const exportPackage = {
      version: "1.0",
      algorithm: "AES-256",
      timestamp: Date.now(),
      data: encrypted
    };
    
    return JSON.stringify(exportPackage);
  }

  /**
   * Déchiffre les données avec le mot de passe fourni
   */
  private decryptData(encryptedContent: string, password: string): any | null {
    try {
      const exportPackage = JSON.parse(encryptedContent);
      
      if (!exportPackage.data || !exportPackage.algorithm) {
        throw new Error("Format de fichier invalide");
      }
      
      const decryptedBytes = CryptoJS.AES.decrypt(exportPackage.data, password);
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        return null; // Mot de passe incorrect
      }
      
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error("Erreur de déchiffrement:", error);
      return null;
    }
  }

  /**
   * Traite les données importées
   */
  private async processImportedData(data: any): Promise<{ imported: number }> {
    let imported = 0;

    // Traiter les patients
    if (data.patients && Array.isArray(data.patients)) {
      for (const patient of data.patients) {
        try {
          // Si on est en mode démo, on ignore l'import
          if (!hdsDemoService.isDemoModeActive()) {
            await hdsLocalDataService.patients.create(patient);
            imported++;
          }
        } catch (error) {
          console.warn("Erreur import patient:", error);
        }
      }
    }

    // Traiter les autres données (appointments, invoices) quand ils seront implémentés

    return { imported };
  }

  /**
   * Valide la sécurité du mot de passe
   */
  private isPasswordSecure(password: string): boolean {
    if (password.length < 8) return false;
    
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return hasUppercase && hasLowercase && hasNumbers;
  }

  /**
   * Vérifie si les données d'export sont vides
   */
  private isEmpty(data: any): boolean {
    const hasPatients = data.patients && data.patients.length > 0;
    const hasAppointments = data.appointments && data.appointments.length > 0;
    const hasInvoices = data.invoices && data.invoices.length > 0;
    
    return !hasPatients && !hasAppointments && !hasInvoices;
  }

  /**
   * Génère un nom de fichier unique
   */
  private generateFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    return `hds_export_${timestamp}.phub`;
  }

  /**
   * Crée le buffer du fichier d'export
   */
  private createExportBuffer(encryptedData: string, filename: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(encryptedData).buffer;
  }

  /**
   * Retourne les avertissements de sécurité
   */
  private getSecurityWarnings(): string[] {
    return [
      "Ne partagez jamais le mot de passe avec le fichier",
      "Supprimez le fichier de la clé USB après utilisation",
      "Utilisez une clé USB chiffrée pour plus de sécurité",
      "Vérifiez l'intégrité des données après import"
    ];
  }

  /**
   * Estime la taille de l'export
   */
  estimateExportSize(options: HDSExportOptions): Promise<{ 
    estimatedSize: string; 
    patientCount: number; 
    appointmentCount: number; 
    invoiceCount: number; 
  }> {
    return new Promise(async (resolve) => {
      let patientCount = 0;
      let appointmentCount = 0;
      let invoiceCount = 0;

      if (hdsDemoService.isDemoModeActive()) {
        const session = hdsDemoService.getCurrentSession();
        if (session) {
          patientCount = options.includePatients ? session.patients.length : 0;
          appointmentCount = options.includeAppointments ? session.appointments.length : 0;
          invoiceCount = options.includeInvoices ? session.invoices.length : 0;
        }
      } else {
        // Estimation basée sur le stockage local
        if (options.includePatients) {
          try {
            const patients = await hdsLocalDataService.patients.getAll();
            patientCount = patients.length;
          } catch {
            patientCount = 0;
          }
        }
      }

      // Estimation grossière de la taille
      const estimatedBytes = 
        (patientCount * 2000) +     // 2KB par patient
        (appointmentCount * 500) +  // 500B par rendez-vous
        (invoiceCount * 300);       // 300B par facture

      let estimatedSize: string;
      if (estimatedBytes < 1024) {
        estimatedSize = `${estimatedBytes} B`;
      } else if (estimatedBytes < 1024 * 1024) {
        estimatedSize = `${Math.round(estimatedBytes / 1024)} KB`;
      } else {
        estimatedSize = `${Math.round(estimatedBytes / (1024 * 1024))} MB`;
      }

      resolve({
        estimatedSize,
        patientCount,
        appointmentCount,
        invoiceCount
      });
    });
  }
}

export const hdsUSBService = HDSUSBService.getInstance();
export type { HDSExportOptions, HDSExportResult };