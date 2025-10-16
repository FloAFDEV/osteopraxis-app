/**
 * Service de partage sécurisé via USB
 * Point d'entrée pour l'export et l'import chiffré de données
 */

export { usbExportService, type ExportOptions, type SecureExportData } from './usb-export-service';
export { usbImportService, type ImportOptions, type ImportResult, type ImportConflict } from './usb-import-service';
export { usbMonitoringService, type USBOperationMetrics, type USBUsageStats } from './usb-monitoring-service';

/**
 * Fonctions utilitaires pour le partage USB sécurisé
 */

/**
 * Valide qu'un fichier est un fichier PatientHub sécurisé
 */
export function isSecurePatientHubFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.phub');
}

/**
 * Estime la taille d'un export basé sur les données sélectionnées
 */
export function estimateExportSize(options: {
  patientCount: number;
  appointmentCount: number;
  invoiceCount: number;
}): string {
  // Estimation grossière : 
  // - Patient: ~2KB (données médicales complètes)
  // - Rendez-vous: ~0.5KB
  // - Facture: ~0.3KB
  
  const estimatedBytes = 
    (options.patientCount * 2000) +
    (options.appointmentCount * 500) +
    (options.invoiceCount * 300);
  
  if (estimatedBytes < 1024) {
    return `${estimatedBytes} B`;
  } else if (estimatedBytes < 1024 * 1024) {
    return `${Math.round(estimatedBytes / 1024)} KB`;
  } else {
    return `${Math.round(estimatedBytes / (1024 * 1024))} MB`;
  }
}

/**
 * Génère des recommandations de sécurité pour le partage USB
 */
export function getSecurityRecommendations(): string[] {
  return [
    "Utilisez un mot de passe fort (minimum 8 caractères avec majuscules, minuscules, chiffres)",
    "Chiffrez votre clé USB avec BitLocker (Windows) ou FileVault (macOS)",
    "Ne laissez jamais la clé USB sans surveillance",
    "Supprimez le fichier de la clé USB après utilisation",
    "Vérifiez l'intégrité des données après import",
    "N'envoyez jamais le mot de passe avec la clé USB"
  ];
}