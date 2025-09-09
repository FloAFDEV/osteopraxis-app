/**
 * 🏥 Classification des données HDS vs Non-HDS
 * 
 * Cette classification détermine où stocker chaque type de donnée :
 * - HDS (sensibles) → Stockage local persistant sécurisé
 * - Non-HDS → Supabase cloud
 */

export type DataType = 
  // 🔴 DONNÉES HDS (SENSIBLES) - Stockage local obligatoire
  | 'patients'
  | 'appointments' 
  | 'medical_records'
  | 'patient_documents'
  | 'appointment_notes'
  | 'billing_data'
  
  // 🟢 DONNÉES NON-HDS - Stockage Supabase autorisé
  | 'invoices'      // Factures = données comptables non-HDS
  | 'user_preferences'
  | 'system_settings'
  | 'audit_logs'
  | 'osteopaths'
  | 'cabinets'
  | 'users'
  | 'subscriptions'
  | 'cabinet_invitations'
  | 'system_metrics'
  | 'rate_limits'
  | 'google_calendar_tokens';

/**
 * Classification stricte des données
 */
export const DATA_CLASSIFICATION = {
  // 🔴 HDS - DONNÉES SENSIBLES (stockage local obligatoire)
  HDS: [
    'patients',
    'appointments',
    'medical_records',
    'patient_documents',
    'appointment_notes',
    'billing_data'
  ] as const,
  
  // 🟢 NON-HDS - DONNÉES NON SENSIBLES (Supabase autorisé)
  NON_HDS: [
    'invoices',        // Factures = données comptables non-HDS
    'user_preferences',
    'system_settings',
    'audit_logs',
    'osteopaths',
    'cabinets',
    'users',
    'subscriptions',
    'cabinet_invitations',
    'system_metrics',
    'rate_limits',
    'google_calendar_tokens'
  ] as const
} as const;

/**
 * Vérifier si une donnée est classée HDS (sensible)
 */
export function isHDSData(dataType: DataType): boolean {
  return DATA_CLASSIFICATION.HDS.includes(dataType as any);
}

/**
 * Vérifier si une donnée est classée Non-HDS (non sensible)
 */
export function isNonHDSData(dataType: DataType): boolean {
  return DATA_CLASSIFICATION.NON_HDS.includes(dataType as any);
}

/**
 * Obtenir la classification d'une donnée
 */
export function getDataClassification(dataType: DataType): 'HDS' | 'NON_HDS' | 'UNKNOWN' {
  if (isHDSData(dataType)) return 'HDS';
  if (isNonHDSData(dataType)) return 'NON_HDS';
  return 'UNKNOWN';
}

/**
 * Valider qu'aucune donnée HDS ne peut aller vers Supabase
 */
export function validateHDSSecurityPolicy(dataType: DataType, targetStorage: 'local' | 'supabase'): void {
  if (isHDSData(dataType) && targetStorage === 'supabase') {
    throw new Error(
      `🚨 VIOLATION SÉCURITÉ HDS: Les données "${dataType}" sont classées HDS et ne peuvent pas être stockées sur Supabase. ` +
      `Utilisation du stockage local obligatoire.`
    );
  }
}

/**
 * Configuration de sécurité HDS
 */
export const HDS_SECURITY_CONFIG = {
  // Chiffrement obligatoire pour les données HDS
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2'
  },
  
  // Export sécurisé
  export: {
    requiresUserConsent: true,
    encryptionRequired: true,
    auditRequired: true
  },
  
  // Accès local uniquement
  access: {
    localOnly: true,
    noCloudSync: true,
    requiresAuthentication: true
  }
} as const;

/**
 * Documentation des données pour audit
 */
export const DATA_DOCUMENTATION = {
  HDS: {
    description: "Données de santé sensibles selon réglementation HDS",
    storage: "Stockage local persistant sécurisé obligatoire",
    examples: ["Patients", "Rendez-vous", "Factures", "Dossiers médicaux"],
    regulations: ["HDS", "RGPD", "Code de la santé publique"],
    restrictions: [
      "Stockage cloud interdit",
      "Chiffrement obligatoire", 
      "Export contrôlé",
      "Audit obligatoire"
    ]
  },
  NON_HDS: {
    description: "Données non sensibles, métadonnées système",
    storage: "Supabase cloud autorisé",
    examples: ["Préférences utilisateur", "Paramètres", "Logs système"],
    regulations: ["RGPD"],
    restrictions: [
      "Anonymisation recommandée",
      "Chiffrement en transit"
    ]
  }
} as const;