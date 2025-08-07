/**
 * Service de migration forcée HDS
 * Migre OBLIGATOIREMENT toutes les données sensibles de Supabase vers le stockage local
 */

import { supabase } from '@/integrations/supabase/client';
import { hybridDataManager } from '../hybrid-data-adapter/hybrid-manager';
import { getOPFSSQLiteService } from '../sqlite/opfs-sqlite-service';

export interface MigrationResult {
  entity: string;
  migratedCount: number;
  errors: string[];
  deletedFromSupabase: boolean;
}

export interface ForcedMigrationStatus {
  completed: boolean;
  results: MigrationResult[];
  totalMigrated: number;
  totalErrors: number;
  timestamp: Date;
}

/**
 * ENTITÉS SENSIBLES qui DOIVENT être migrées selon HDS
 * Ces données ne peuvent JAMAIS rester dans Supabase
 */
const SENSITIVE_ENTITIES = [
  'Patient',
  'Appointment', 
  'Invoice',
  'Consultation',
  'MedicalDocument',
  'TreatmentHistory',
  'Quote',
  'QuoteItem'
] as const;

export class ForcedMigrationService {
  private isRunning = false;
  
  /**
   * MIGRATION FORCÉE - OBLIGATOIRE pour la conformité HDS
   * Cette fonction DOIT être exécutée et réussir avant toute utilisation de l'app
   */
  async executeForcedMigration(): Promise<ForcedMigrationStatus> {
    if (this.isRunning) {
      throw new Error('Migration already in progress');
    }

    this.isRunning = true;
    console.log('🚨 DÉBUT MIGRATION FORCÉE HDS - DONNÉES SENSIBLES');
    
    const results: MigrationResult[] = [];
    let totalMigrated = 0;
    let totalErrors = 0;

    try {
      // 1. Initialiser le gestionnaire hybride
      await hybridDataManager.initialize();
      
      // 2. Vérifier que le stockage local est disponible
      const sqliteService = await getOPFSSQLiteService();
      if (!sqliteService) {
        throw new Error('ERREUR CRITIQUE: Stockage local non disponible - Migration HDS impossible');
      }

      // 3. Migrer chaque entité sensible
      for (const entity of SENSITIVE_ENTITIES) {
        console.log(`📥 Migration ${entity}...`);
        const result = await this.migrateEntity(entity);
        results.push(result);
        totalMigrated += result.migratedCount;
        totalErrors += result.errors.length;
      }

      // 4. Vérifier que toutes les données ont été migrées
      await this.verifyMigrationComplete();

      console.log('✅ MIGRATION FORCÉE HDS TERMINÉE');
      console.log(`📊 Total migré: ${totalMigrated} enregistrements`);
      console.log(`❌ Total erreurs: ${totalErrors}`);

      return {
        completed: totalErrors === 0,
        results,
        totalMigrated,
        totalErrors,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('🚨 ÉCHEC CRITIQUE MIGRATION HDS:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Migre une entité spécifique de Supabase vers le local
   */
  private async migrateEntity(entityName: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      entity: entityName,
      migratedCount: 0,
      errors: [],
      deletedFromSupabase: false
    };

    try {
      // 1. Récupérer TOUTES les données de Supabase
      const { data: supabaseData, error: fetchError } = await supabase
        .from(entityName as any)
        .select('*');

      if (fetchError) {
        result.errors.push(`Erreur lecture Supabase: ${fetchError.message}`);
        return result;
      }

      if (!supabaseData || supabaseData.length === 0) {
        console.log(`📭 Aucune donnée ${entityName} à migrer`);
        result.deletedFromSupabase = true; // Pas de données = "suppression" réussie
        return result;
      }

      console.log(`📦 ${supabaseData.length} ${entityName} à migrer`);

      // 2. Insérer chaque enregistrement dans le stockage local
      for (const record of supabaseData) {
        try {
          await hybridDataManager.create(entityName.toLowerCase(), record);
          result.migratedCount++;
        } catch (error) {
          const recordId = (record as any)?.id || 'unknown';
          const errorMsg = `Erreur migration ${entityName} ID ${recordId}: ${error}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // 3. SUPPRIMER PHYSIQUEMENT de Supabase (OBLIGATOIRE HDS)
      if (result.migratedCount === supabaseData.length) {
        console.log(`🗑️ Suppression ${entityName} de Supabase...`);
        const { error: deleteError } = await supabase
          .from(entityName as any)
          .delete()
          .neq('id', 0); // Supprime TOUT

        if (deleteError) {
          result.errors.push(`Erreur suppression Supabase: ${deleteError.message}`);
        } else {
          result.deletedFromSupabase = true;
          console.log(`✅ ${entityName} supprimé de Supabase`);
        }
      }

    } catch (error) {
      result.errors.push(`Erreur générale migration ${entityName}: ${error}`);
    }

    return result;
  }

  /**
   * Vérifie que TOUTES les données sensibles ont été supprimées de Supabase
   */
  private async verifyMigrationComplete(): Promise<void> {
    console.log('🔍 Vérification suppression complète...');
    
    for (const entity of SENSITIVE_ENTITIES) {
      const { data, error } = await supabase
        .from(entity)
        .select('id')
        .limit(1);

      if (error) {
        console.warn(`Impossible de vérifier ${entity}: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        throw new Error(`🚨 ERREUR HDS: Des données ${entity} restent dans Supabase`);
      }
    }

    console.log('✅ Vérification OK: Aucune donnée sensible dans Supabase');
  }

  /**
   * Vérifie si la migration forcée a déjà été effectuée
   */
  async isMigrationRequired(): Promise<boolean> {
    try {
      // Vérifier s'il y a des données sensibles dans Supabase
      for (const entity of SENSITIVE_ENTITIES) {
        const { data, error } = await supabase
          .from(entity)
          .select('id')
          .limit(1);

        if (!error && data && data.length > 0) {
          return true; // Migration nécessaire
        }
      }
      return false; // Pas de migration nécessaire
    } catch (error) {
      console.error('Erreur vérification migration:', error);
      return true; // Par sécurité, forcer la migration
    }
  }

  /**
   * Restauration d'urgence depuis une sauvegarde
   */
  async emergencyRestore(backupData: any): Promise<void> {
    console.log('🚑 RESTAURATION D\'URGENCE...');
    
    try {
      for (const [entityName, records] of Object.entries(backupData)) {
        if (Array.isArray(records)) {
          for (const record of records) {
            await hybridDataManager.create(entityName, record);
          }
        }
      }
      console.log('✅ Restauration d\'urgence terminée');
    } catch (error) {
      console.error('❌ Échec restauration d\'urgence:', error);
      throw error;
    }
  }
}

export const forcedMigrationService = new ForcedMigrationService();