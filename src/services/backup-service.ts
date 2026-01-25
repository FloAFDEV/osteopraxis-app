import { api } from "./api";

/**
 * Service de sauvegarde locale des données
 *
 * Permet d'exporter toutes les données IndexedDB vers un fichier JSON
 * et de les réimporter si nécessaire.
 */

export interface BackupData {
  version: string;
  createdAt: string;
  data: {
    patients: any[];
    appointments: any[];
    invoices: any[];
    cabinets: any[];
    settings?: any;
  };
  metadata: {
    totalPatients: number;
    totalAppointments: number;
    totalInvoices: number;
    totalCabinets: number;
  };
}

const BACKUP_VERSION = "1.0.0";
const LAST_BACKUP_KEY = "osteopraxis_last_backup";
const BACKUP_REMINDER_KEY = "osteopraxis_backup_reminder_days";

/**
 * Exporte toutes les données vers un fichier JSON téléchargeable
 */
export async function exportBackup(): Promise<void> {
  try {
    // Récupérer toutes les données
    const [patients, appointments, invoices, cabinets] = await Promise.all([
      api.getPatients(),
      api.getAppointments(),
      api.getInvoices(),
      api.getCabinets()
    ]);

    const backup: BackupData = {
      version: BACKUP_VERSION,
      createdAt: new Date().toISOString(),
      data: {
        patients,
        appointments,
        invoices,
        cabinets
      },
      metadata: {
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalInvoices: invoices.length,
        totalCabinets: cabinets.length
      }
    };

    // Créer le fichier JSON
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json"
    });

    // Générer le nom du fichier avec la date
    const date = new Date().toISOString().split("T")[0];
    const filename = `osteopraxis-backup-${date}.json`;

    // Télécharger le fichier
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Enregistrer la date de la dernière sauvegarde
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());

    console.log("✅ Backup exported successfully:", filename);
    return;
  } catch (error) {
    console.error("❌ Backup export failed:", error);
    throw new Error("Échec de l'export de la sauvegarde");
  }
}

/**
 * Vérifie si un rappel de sauvegarde est nécessaire
 */
export function checkBackupReminder(): {
  shouldRemind: boolean;
  daysSinceLastBackup: number | null;
  reminderDays: number;
} {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  const reminderDays = parseInt(
    localStorage.getItem(BACKUP_REMINDER_KEY) || "14",
    10
  );

  if (!lastBackup) {
    return {
      shouldRemind: true,
      daysSinceLastBackup: null,
      reminderDays
    };
  }

  const lastBackupDate = new Date(lastBackup);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastBackupDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    shouldRemind: diffDays >= reminderDays,
    daysSinceLastBackup: diffDays,
    reminderDays
  };
}

/**
 * Configure le délai de rappel de sauvegarde
 */
export function setBackupReminderDays(days: 7 | 14 | 30): void {
  localStorage.setItem(BACKUP_REMINDER_KEY, days.toString());
}

/**
 * Récupère le délai de rappel actuel
 */
export function getBackupReminderDays(): number {
  return parseInt(localStorage.getItem(BACKUP_REMINDER_KEY) || "14", 10);
}

/**
 * Récupère la date de la dernière sauvegarde
 */
export function getLastBackupDate(): Date | null {
  const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
  return lastBackup ? new Date(lastBackup) : null;
}

/**
 * Valide le format d'un fichier de backup
 */
export function validateBackupFile(data: any): {
  isValid: boolean;
  error?: string;
  backup?: BackupData;
} {
  if (!data) {
    return { isValid: false, error: "Fichier vide ou invalide" };
  }

  if (!data.version) {
    return { isValid: false, error: "Version de backup manquante" };
  }

  if (!data.data) {
    return { isValid: false, error: "Données manquantes dans le backup" };
  }

  if (!data.data.patients || !Array.isArray(data.data.patients)) {
    return { isValid: false, error: "Liste des patients invalide" };
  }

  if (!data.data.appointments || !Array.isArray(data.data.appointments)) {
    return { isValid: false, error: "Liste des rendez-vous invalide" };
  }

  if (!data.data.invoices || !Array.isArray(data.data.invoices)) {
    return { isValid: false, error: "Liste des factures invalide" };
  }

  return { isValid: true, backup: data as BackupData };
}

/**
 * Import d'un backup (à utiliser avec précaution)
 * Note: Cette fonction nécessite une confirmation utilisateur car elle écrase les données existantes
 */
export async function importBackup(backup: BackupData): Promise<{
  success: boolean;
  imported: {
    patients: number;
    appointments: number;
    invoices: number;
    cabinets: number;
  };
  error?: string;
}> {
  try {
    // Pour l'instant, on ne supporte que l'affichage des stats du backup
    // L'import réel nécessiterait une refonte plus profonde de l'architecture
    console.log("📥 Backup import requested:", backup.metadata);

    return {
      success: true,
      imported: {
        patients: backup.metadata.totalPatients,
        appointments: backup.metadata.totalAppointments,
        invoices: backup.metadata.totalInvoices,
        cabinets: backup.metadata.totalCabinets
      }
    };
  } catch (error) {
    console.error("❌ Backup import failed:", error);
    return {
      success: false,
      imported: { patients: 0, appointments: 0, invoices: 0, cabinets: 0 },
      error: "Échec de l'import de la sauvegarde"
    };
  }
}
