/**
 * Service de synchronisation entre cabinets
 * Gère l'orchestration des partages de données patients entre praticiens
 */

import { supabase } from '@/integrations/supabase/client';
import { cabinetSyncEncryption, SyncPackage } from './encryption-service';
import { getCurrentOsteopathId } from '@/services/supabase-api/utils/getCurrentOsteopath';
import { toast } from 'sonner';

export interface SyncPermission {
  id: string;
  cabinetId: number;
  patientLocalHash: string;
  ownerOsteopathId: number;
  sharedWithOsteopathId: number;
  syncPermission: 'read' | 'write' | 'full';
  patientSyncKeyHash: string;
  lastSyncTimestamp: Date;
  isActive: boolean;
  expiresAt: Date;
}

export interface SyncMetadata {
  syncId: string;
  action: 'created' | 'synced' | 'updated' | 'revoked' | 'expired';
  performedByOsteopathId: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

class CabinetSyncService {
  private readonly STORAGE_BUCKET = 'cabinet-sync';
  private readonly DEFAULT_EXPIRATION_HOURS = 24;

  /**
   * Partage un patient avec un autre ostéopathe du même cabinet
   */
  async sharePatientWithColleague(
    patientData: any,
    patientLocalId: string,
    targetOsteopathId: number,
    cabinetId: number,
    permission: 'read' | 'write' | 'full' = 'read'
  ): Promise<{ success: boolean; syncId?: string; error?: string }> {
    try {
      const currentOsteopathId = await getCurrentOsteopathId();
      if (!currentOsteopathId) {
        throw new Error('Ostéopathe non identifié');
      }

      // 1. Vérifier que les deux ostéopathes appartiennent au même cabinet
      const { data: cabinetMembers } = await supabase
        .from('osteopath_cabinet')
        .select('osteopath_id')
        .eq('cabinet_id', cabinetId)
        .in('osteopath_id', [currentOsteopathId, targetOsteopathId]);

      if (!cabinetMembers || cabinetMembers.length !== 2) {
        throw new Error('Les ostéopathes ne font pas partie du même cabinet');
      }

      // 2. Récupérer ou créer la clé de cabinet
      const cabinetKey = await this.getCabinetEncryptionKey(cabinetId);

      // 3. Créer le package de synchronisation chiffré
      const syncPackage = await cabinetSyncEncryption.createSyncPackage(
        patientData,
        currentOsteopathId,
        targetOsteopathId,
        cabinetId,
        patientLocalId,
        'patient',
        cabinetKey,
        this.DEFAULT_EXPIRATION_HOURS
      );

      // 4. Upload du fichier chiffré vers Storage
      const fileName = `${cabinetId}/${syncPackage.id}.encrypted`;
      const { error: uploadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(fileName, JSON.stringify(syncPackage.encryptedData), {
          contentType: 'application/json',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Erreur upload: ${uploadError.message}`);
      }

      // 5. Créer l'entrée de métadonnées
      const patientHash = cabinetSyncEncryption.generatePatientHash(patientLocalId, cabinetId);
      const { data: syncData, error: syncError } = await supabase
        .from('cabinet_patient_sync')
        .insert({
          cabinet_id: cabinetId,
          patient_local_hash: patientHash,
          owner_osteopath_id: currentOsteopathId,
          shared_with_osteopath_id: targetOsteopathId,
          sync_permission: permission,
          patient_sync_key_hash: cabinetSyncEncryption.hashKey(cabinetKey),
          expires_at: syncPackage.expiresAt.toISOString()
        })
        .select()
        .single();

      if (syncError) {
        // Nettoyer le fichier uploadé en cas d'erreur
        await supabase.storage
          .from(this.STORAGE_BUCKET)
          .remove([fileName]);
        throw new Error(`Erreur sync metadata: ${syncError.message}`);
      }

      // 6. Logger l'action
      await this.logSyncAction(syncData.id, 'created', currentOsteopathId, {
        patientHash,
        permission,
        fileName
      });

      toast.success('Patient partagé avec succès');
      return { success: true, syncId: syncData.id };

    } catch (error) {
      console.error('Erreur lors du partage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Échec du partage: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Récupère les données partagées par un collègue
   */
  async retrieveSharedPatient(syncId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const currentOsteopathId = await getCurrentOsteopathId();
      if (!currentOsteopathId) {
        throw new Error('Ostéopathe non identifié');
      }

      // 1. Récupérer les métadonnées de sync
      const { data: syncMeta, error: metaError } = await supabase
        .from('cabinet_patient_sync')
        .select('*')
        .eq('id', syncId)
        .eq('shared_with_osteopath_id', currentOsteopathId)
        .eq('is_active', true)
        .single();

      if (metaError || !syncMeta) {
        throw new Error('Synchronisation non trouvée ou non autorisée');
      }

      // 2. Vérifier l'expiration
      if (new Date() > new Date(syncMeta.expires_at)) {
        throw new Error('Synchronisation expirée');
      }

      // 3. Récupérer la clé de cabinet
      const cabinetKey = await this.getCabinetEncryptionKey(syncMeta.cabinet_id);

      // 4. Télécharger le fichier chiffré
      const fileName = `${syncMeta.cabinet_id}/${syncId}.encrypted`;
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .download(fileName);

      if (downloadError || !fileData) {
        throw new Error(`Erreur téléchargement: ${downloadError?.message}`);
      }

      // 5. Déchiffrer les données
      const fileContent = await fileData.text();
      const encryptedData = JSON.parse(fileContent);
      
      // TODO: Récupérer la session key (actuellement stockée avec les données)
      const sessionKey = ''; // À implémenter selon la stratégie de stockage des clés de session
      
      const decryptedData = await cabinetSyncEncryption.decryptSyncData(
        encryptedData,
        cabinetKey,
        sessionKey
      );

      // 6. Logger l'action
      await this.logSyncAction(syncId, 'synced', currentOsteopathId, {
        fileName
      });

      // 7. Mettre à jour le timestamp de dernière sync
      await supabase
        .from('cabinet_patient_sync')
        .update({ last_sync_timestamp: new Date().toISOString() })
        .eq('id', syncId);

      return { success: true, data: decryptedData };

    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Liste les synchronisations disponibles pour l'ostéopathe courant
   */
  async getAvailableSyncs(): Promise<SyncPermission[]> {
    try {
      const currentOsteopathId = await getCurrentOsteopathId();
      if (!currentOsteopathId) return [];

      const { data, error } = await supabase
        .from('cabinet_patient_sync')
        .select(`
          *,
          owner:Osteopath!owner_osteopath_id(name),
          cabinet:Cabinet(name)
        `)
        .eq('shared_with_osteopath_id', currentOsteopathId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération syncs:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        cabinetId: item.cabinet_id,
        patientLocalHash: item.patient_local_hash,
        ownerOsteopathId: item.owner_osteopath_id,
        sharedWithOsteopathId: item.shared_with_osteopath_id,
        syncPermission: item.sync_permission as 'read' | 'write' | 'full',
        patientSyncKeyHash: item.patient_sync_key_hash,
        lastSyncTimestamp: new Date(item.last_sync_timestamp),
        isActive: item.is_active,
        expiresAt: new Date(item.expires_at)
      }));
    } catch (error) {
      console.error('Erreur getAvailableSyncs:', error);
      return [];
    }
  }

  /**
   * Révoque un partage existant
   */
  async revokeSync(syncId: string): Promise<boolean> {
    try {
      const currentOsteopathId = await getCurrentOsteopathId();
      if (!currentOsteopathId) return false;

      // Désactiver la sync
      const { error: updateError } = await supabase
        .from('cabinet_patient_sync')
        .update({ is_active: false })
        .eq('id', syncId)
        .eq('owner_osteopath_id', currentOsteopathId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Logger l'action
      await this.logSyncAction(syncId, 'revoked', currentOsteopathId, {});

      // Supprimer le fichier chiffré (optionnel - peut être fait par un cron)
      // await this.cleanupExpiredSyncFiles();

      toast.success('Partage révoqué');
      return true;
    } catch (error) {
      console.error('Erreur révocation:', error);
      toast.error('Échec de la révocation');
      return false;
    }
  }

  /**
   * Récupère ou crée la clé de chiffrement pour un cabinet
   */
  private async getCabinetEncryptionKey(cabinetId: number): Promise<string> {
    try {
      // Chercher une clé existante active
      const { data: existingKey } = await supabase
        .from('cabinet_encryption_keys')
        .select('key_hash')
        .eq('cabinet_id', cabinetId)
        .eq('is_active', true)
        .order('key_version', { ascending: false })
        .limit(1)
        .single();

      if (existingKey) {
        // TODO: Récupérer la vraie clé depuis un stockage sécurisé
        // Pour l'instant, on génère une clé déterministe
        return cabinetSyncEncryption.generateCabinetKey(cabinetId, 'default_salt');
      }

      // Créer une nouvelle clé
      const newKey = cabinetSyncEncryption.generateCabinetKey(cabinetId);
      const keyHash = cabinetSyncEncryption.hashKey(newKey);
      
      const currentOsteopathId = await getCurrentOsteopathId();
      await supabase
        .from('cabinet_encryption_keys')
        .insert({
          cabinet_id: cabinetId,
          key_hash: keyHash,
          created_by_osteopath_id: currentOsteopathId
        });

      return newKey;
    } catch (error) {
      console.error('Erreur clé cabinet:', error);
      throw new Error('Impossible de récupérer la clé de chiffrement');
    }
  }

  /**
   * Enregistre une action de synchronisation dans les logs
   */
  private async logSyncAction(
    syncId: string,
    action: 'created' | 'synced' | 'updated' | 'revoked' | 'expired',
    osteopathId: number,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('cabinet_sync_logs')
        .insert({
          sync_id: syncId,
          action,
          performed_by_osteopath_id: osteopathId,
          metadata
        });
    } catch (error) {
      console.error('Erreur logging sync:', error);
      // Ne pas bloquer l'opération principale pour un échec de log
    }
  }
}

// Instance singleton
export const cabinetSyncService = new CabinetSyncService();
export default cabinetSyncService;