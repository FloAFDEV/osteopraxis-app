/**
 * 🏥 Services de stockage local HDS
 * 
 * EXCLUSIVEMENT pour le mode connecté - conformité HDS
 * Données sensibles stockées localement sur la machine de l'utilisateur
 * 
 * ⚠️ SÉPARÉ du mode démo qui utilise localStorage temporaire
 */

import { 
  hdsLocalStorage as _hdsLocalStorage, 
  isConnectedMode as _isConnectedMode, 
  initializeHDSStorage as _initializeHDSStorage 
} from './hds-storage-manager';
import { 
  hdsPatientService as _hdsPatientService, 
  type HDSPatientService 
} from './hds-patient-service';

export { _hdsLocalStorage as hdsLocalStorage };
export { _isConnectedMode as isConnectedMode };
export { _initializeHDSStorage as initializeHDSStorage };
export { _hdsPatientService as hdsPatientService };
export type { HDSPatientService };

// Importer et exporter les nouveaux services
import { hdsInvoiceService } from './hds-invoice-service';
import { hdsAppointmentService } from './hds-appointment-service';

export { hdsInvoiceService };
export { hdsAppointmentService };

// Configuration HDS
export const HDS_CONFIG = {
  // Version du schéma de données HDS
  SCHEMA_VERSION: '1.0.0',
  
  // Entités stockées localement (données sensibles HDS)
  LOCAL_ENTITIES: ['patients', 'appointments', 'invoices'],
  
  // Entités stockées en cloud (données non-sensibles)
  CLOUD_ENTITIES: ['quotes', 'osteopaths', 'cabinets', 'users'],
  
  // Paramètres de sauvegarde automatique
  AUTO_BACKUP: {
    enabled: true,
    intervalMinutes: 60,
    maxBackups: 7
  },
  
  // Chiffrement des données locales
  ENCRYPTION: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2'
  }
} as const;

/**
 * Initialisation complète du système HDS
 */
export async function initializeHDSSystem(): Promise<{
  success: boolean;
  message: string;
  localStorage: boolean;
  cloudAccess: boolean;
}> {
  const result = {
    success: false,
    message: '',
    localStorage: false,
    cloudAccess: false
  };

  try {
    // Vérifier le mode connecté
    if (!_isConnectedMode()) {
      result.message = 'Mode démo détecté - HDS non initialisé';
      result.success = true; // Ce n'est pas une erreur
      return result;
    }

    // Initialiser le stockage local HDS
    await _initializeHDSStorage();
    result.localStorage = true;

    // Tester l'accès Supabase
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('User').select('id').limit(1);
      result.cloudAccess = true;
    } catch (cloudError) {
      console.warn('⚠️ Accès Supabase limité, mode local HDS uniquement');
    }

    result.success = true;
    result.message = `HDS initialisé: local=${result.localStorage}, cloud=${result.cloudAccess}`;
    
    console.log('✅ Système HDS initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation système HDS:', error);
    result.message = `Erreur HDS: ${error}`;
  }

  return result;
}

/**
 * Diagnostic du système HDS
 */
export async function diagnoseHDSSystem(): Promise<{
  mode: 'demo' | 'connected';
  localStorage: {
    available: boolean;
    patients: number;
    appointments: number;
    invoices: number;
  };
  cloudStorage: {
    available: boolean;
    authenticated: boolean;
  };
  integrity: {
    valid: boolean;
    errors: string[];
  };
}> {
  const result = {
    mode: _isConnectedMode() ? 'connected' as const : 'demo' as const,
    localStorage: {
      available: false,
      patients: 0,
      appointments: 0,
      invoices: 0
    },
    cloudStorage: {
      available: false,
      authenticated: false
    },
    integrity: {
      valid: true,
      errors: [] as string[]
    }
  };

  // Test stockage local
  try {
    if (_isConnectedMode()) {
      const integrity = await _hdsLocalStorage.verifyDataIntegrity();
      result.localStorage.available = true;
      result.localStorage.patients = integrity.patients.count;
      result.localStorage.appointments = integrity.appointments.count;
      result.localStorage.invoices = integrity.invoices.count;
      
      if (!integrity.patients.valid) {
        result.integrity.errors.push('Données patients corrompues');
        result.integrity.valid = false;
      }
      if (!integrity.appointments.valid) {
        result.integrity.errors.push('Données rendez-vous corrompues');
        result.integrity.valid = false;
      }
      if (!integrity.invoices.valid) {
        result.integrity.errors.push('Données factures corrompues');
        result.integrity.valid = false;
      }
    }
  } catch (error) {
    result.integrity.errors.push(`Erreur stockage local: ${error}`);
    result.integrity.valid = false;
  }

  // Test cloud storage
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    result.cloudStorage.authenticated = !!session?.user;
    
    await supabase.from('User').select('id').limit(1);
    result.cloudStorage.available = true;
  } catch (error) {
    result.integrity.errors.push(`Erreur cloud: ${error}`);
  }

  console.log('🔍 Diagnostic HDS:', result);
  return result;
}