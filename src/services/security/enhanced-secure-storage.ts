/**
 * 🔐 Stockage sécurisé amélioré avec écriture atomique et gestion des concurrences
 * Utilise les helpers crypto robustes et les meilleures pratiques
 */

import { encryptJSON, decryptJSON, testCrypto, type EncryptedPayload } from '@/utils/crypto';

export interface SecureFileMetadata {
  entity: string;
  version: string;
  timestamp: number;
  checksum: string;
  recordCount: number;
  fileSize: number;
  lastModified: string;
}

export interface FileStorageStats {
  count: number;
  size: number;
  lastModified: string;
  integrity: boolean;
}

export class EnhancedSecureFileStorage {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private password: string | null = null;
  private fileName: string;
  private lock: Promise<void> = Promise.resolve(); // Queue simple pour éviter concurrence

  constructor(private entityName: string) {
    this.fileName = `${entityName}.hds.json`;
  }

  /**
   * Initialiser le stockage avec test de compatibilité
   */
  async initialize(directoryHandle: FileSystemDirectoryHandle, password: string): Promise<void> {
    try {
      console.log(`🔐 Initialisation stockage sécurisé ${this.entityName}...`);
      
      this.directoryHandle = directoryHandle;
      this.password = password;
      
      // Test crypto avec le mot de passe
      const cryptoTest = await testCrypto(password);
      if (!cryptoTest) {
        throw new Error('Test cryptographique échoué');
      }
      
      // Test d'écriture pour vérifier les permissions
      try {
        const testHandle = await directoryHandle.getFileHandle('permission-test.tmp', { create: true });
        const writable = await testHandle.createWritable();
        await writable.write('test-permission');
        await writable.close();
        
        // Nettoyer le fichier de test
        try {
          await directoryHandle.removeEntry('permission-test.tmp');
        } catch {}
        
        console.log('✅ Permissions d\'écriture confirmées');
      } catch (error) {
        throw new Error('Permissions d\'écriture insuffisantes');
      }
      
      console.log(`✅ Stockage sécurisé ${this.entityName} initialisé`);
    } catch (error) {
      console.error(`❌ Erreur initialisation ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Écriture atomique pour éviter la corruption
   */
  private async _atomicWrite(contentStr: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('Stockage non initialisé');
    }

    const tmpName = `${this.fileName}.tmp`;
    
    try {
      // Écrire dans fichier temporaire
      const tmpHandle = await this.directoryHandle.getFileHandle(tmpName, { create: true });
      const writable = await tmpHandle.createWritable();
      await writable.write(contentStr);
      await writable.close();
      
      // Remplacer le fichier final
      const finalHandle = await this.directoryHandle.getFileHandle(this.fileName, { create: true });
      const finalWritable = await finalHandle.createWritable();
      await finalWritable.write(contentStr);
      await finalWritable.close();
      
      // Nettoyer le fichier temporaire
      try {
        await this.directoryHandle.removeEntry(tmpName);
      } catch {
        // Ignore si impossible de supprimer le tmp
      }
      
    } catch (error) {
      // Nettoyer en cas d'erreur
      try {
        await this.directoryHandle.removeEntry(tmpName);
      } catch {
        // Ignore
      }
      throw error;
    }
  }

  /**
   * Charger les enregistrements avec vérification d'intégrité
   */
  async loadRecords<T>(): Promise<T[]> {
    if (!this.directoryHandle || !this.password) {
      throw new Error('Stockage non initialisé');
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(this.fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      
      if (!text.trim()) {
        console.log(`📁 Fichier ${this.entityName} vide - retour tableau vide`);
        return [];
      }
      
      const encrypted: EncryptedPayload = JSON.parse(text);
      const decrypted = await decryptJSON(encrypted, this.password);
      
      const records = decrypted.records ?? [];
      console.log(`✅ ${records.length} enregistrements ${this.entityName} chargés`);
      return records;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        console.log(`📁 Aucun fichier ${this.entityName} existant`);
        return [];
      }
      
      console.error(`❌ Erreur chargement ${this.entityName}:`, error);
      
      if (error instanceof Error && error.message.includes('password')) {
        throw new Error('Mot de passe incorrect pour déchiffrer les données');
      }
      
      throw error;
    }
  }

  /**
   * Sauvegarder un enregistrement avec queue anti-concurrence
   */
  async saveRecord<T>(record: T): Promise<T> {
    // Queue simple pour éviter les écritures concurrentes
    const savedRecord = await new Promise<T>((resolve, reject) => {
      this.lock = this.lock.then(async () => {
        try {
          console.log(`💾 Sauvegarde ${this.entityName}/${(record as any).id || 'nouveau'}...`);
          
          const records = await this.loadRecords<T>();
          const recordWithMeta = {
            ...record,
            updatedAt: new Date().toISOString()
          };

          const idx = records.findIndex((r: any) => r.id === (recordWithMeta as any).id);
          if (idx >= 0) {
            records[idx] = recordWithMeta;
            console.log(`🔄 Mise à jour ${this.entityName}/${(recordWithMeta as any).id}`);
          } else {
            records.push({
              ...recordWithMeta,
              createdAt: new Date().toISOString()
            });
            console.log(`➕ Création ${this.entityName}/${(recordWithMeta as any).id}`);
          }

          const payload = { 
            records,
            metadata: {
              entity: this.entityName,
              count: records.length,
              lastSaved: new Date().toISOString()
            }
          };
          
          const encrypted = await encryptJSON(payload, this.password!);
          await this._atomicWrite(JSON.stringify(encrypted, null, 2));
          
          console.log(`✅ Sauvegarde ${this.entityName} réussie`);
          resolve(recordWithMeta);
        } catch (error) {
          console.error(`❌ Erreur sauvegarde ${this.entityName}:`, error);
          reject(error);
        }
      });
    });
    
    return savedRecord;
  }

  /**
   * Supprimer un enregistrement
   */
  async deleteRecord(id: string | number): Promise<boolean> {
    const result = await new Promise<boolean>((resolve, reject) => {
      this.lock = this.lock.then(async () => {
        try {
          const records = await this.loadRecords();
          const initialCount = records.length;
          const filteredRecords = records.filter((r: any) => r.id !== id);
          
          if (filteredRecords.length < initialCount) {
            const payload = { 
              records: filteredRecords,
              metadata: {
                entity: this.entityName,
                count: filteredRecords.length,
                lastSaved: new Date().toISOString()
              }
            };
            
            const encrypted = await encryptJSON(payload, this.password!);
            await this._atomicWrite(JSON.stringify(encrypted, null, 2));
            
            console.log(`🗑️ Enregistrement ${id} supprimé de ${this.entityName}`);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.error(`❌ Erreur suppression ${this.entityName}/${id}:`, error);
          reject(error);
        }
      });
    });
    
    return result;
  }

  /**
   * Obtenir un enregistrement par ID
   */
  async getRecordById<T>(id: string | number): Promise<T | null> {
    const records = await this.loadRecords<T>();
    return records.find((r: any) => r.id === id) || null;
  }

  /**
   * Obtenir les statistiques avec vérification d'intégrité
   */
  async getStats(): Promise<FileStorageStats> {
    if (!this.directoryHandle) {
      return { count: 0, size: 0, lastModified: '', integrity: false };
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(this.fileName);
      const file = await fileHandle.getFile();
      
      let integrity = false;
      let count = 0;
      
      try {
        const records = await this.loadRecords();
        count = records.length;
        integrity = true;
      } catch (error) {
        console.warn(`⚠️ Problème d'intégrité ${this.entityName}:`, error);
        integrity = false;
      }

      return {
        count,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString(),
        integrity
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        return { count: 0, size: 0, lastModified: '', integrity: true };
      }
      
      return { count: 0, size: 0, lastModified: '', integrity: false };
    }
  }

  /**
   * Export sécurisé avec format portable
   */
  async exportSecure(): Promise<void> {
    try {
      const records = await this.loadRecords();
      
      const exportData = {
        format: 'PatientHub_HDS_Secure_Export_v2',
        entity: this.entityName,
        exportedAt: new Date().toISOString(),
        recordCount: records.length,
        data: await encryptJSON({ records }, this.password!),
        instructions: 'Fichier chiffré PatientHub. Import possible uniquement avec le mot de passe correct.'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Export avec File System Access API si disponible
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `${this.entityName}_export_${new Date().toISOString().split('T')[0]}.phds`,
          types: [{
            description: 'Fichiers PatientHub HDS Sécurisés',
            accept: { 'application/json': ['.phds'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        
        console.log(`✅ Export sécurisé ${this.entityName} réussi`);
      } else {
        // Fallback téléchargement classique
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.entityName}_export_${new Date().toISOString().split('T')[0]}.phds`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`❌ Erreur export ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Import sécurisé depuis un fichier .phds
   */
  async importSecure(file: File, password: string, strategy: 'replace' | 'merge' = 'merge'): Promise<{
    imported: number;
    errors: string[];
    warnings: string[];
  }> {
    const result = {
      imported: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    try {
      console.log(`📥 Import sécurisé ${this.entityName} depuis ${file.name}...`);
      
      // Lire et parser le fichier
      const text = await file.text();
      const exportData = JSON.parse(text);
      
      // Vérifier le format
      if (!exportData.format || !exportData.format.includes('PatientHub')) {
        throw new Error('Format de fichier invalide - doit être un fichier PatientHub .phds');
      }
      
      // Vérifier que c'est la bonne entité
      if (exportData.entity && exportData.entity !== this.entityName) {
        result.warnings.push(`Entité du fichier (${exportData.entity}) différente de l'entité cible (${this.entityName})`);
      }
      
      // Déchiffrer les données avec le mot de passe fourni
      const decrypted = await decryptJSON(exportData.data, password);
      const importedRecords = decrypted.records || [];
      
      console.log(`🔓 ${importedRecords.length} enregistrements déchiffrés`);
      
      // Charger les enregistrements existants
      const existingRecords = await this.loadRecords();
      
      let finalRecords: any[];
      
      if (strategy === 'replace') {
        // Remplacer complètement
        finalRecords = importedRecords;
        result.imported = importedRecords.length;
        console.log(`🔄 Remplacement complet: ${finalRecords.length} enregistrements`);
      } else {
        // Fusionner (mise à jour des existants + ajout des nouveaux)
        const existingMap = new Map(existingRecords.map((r: any) => [r.id, r]));
        let updated = 0;
        let added = 0;
        
        for (const record of importedRecords) {
          if (existingMap.has(record.id)) {
            existingMap.set(record.id, { ...record, updatedAt: new Date().toISOString() });
            updated++;
          } else {
            existingMap.set(record.id, { ...record, createdAt: new Date().toISOString() });
            added++;
          }
        }
        
        finalRecords = Array.from(existingMap.values());
        result.imported = importedRecords.length;
        result.warnings.push(`Fusion: ${added} ajoutés, ${updated} mis à jour`);
        console.log(`🔀 Fusion: ${added} ajoutés, ${updated} mis à jour, ${finalRecords.length} total`);
      }
      
      // Sauvegarder les enregistrements fusionnés/remplacés
      const payload = { 
        records: finalRecords,
        metadata: {
          entity: this.entityName,
          count: finalRecords.length,
          lastSaved: new Date().toISOString(),
          importedFrom: file.name,
          importStrategy: strategy
        }
      };
      
      const encrypted = await encryptJSON(payload, this.password!);
      await this._atomicWrite(JSON.stringify(encrypted, null, 2));
      
      console.log(`✅ Import sécurisé ${this.entityName} réussi: ${result.imported} enregistrements`);
      
    } catch (error) {
      console.error(`❌ Erreur import ${this.entityName}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('decrypt')) {
          result.errors.push('Mot de passe incorrect pour déchiffrer le fichier');
        } else if (error.message.includes('JSON')) {
          result.errors.push('Fichier corrompu ou format invalide');
        } else {
          result.errors.push(error.message);
        }
      } else {
        result.errors.push('Erreur inconnue lors de l\'import');
      }
    }

    return result;
  }

  /**
   * Vérifier l'intégrité complète
   */
  async verifyIntegrity(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    metadata: any;
  }> {
    const result = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[],
      metadata: null as any
    };

    try {
      const records = await this.loadRecords();
      
      // Vérifications de base
      if (!Array.isArray(records)) {
        result.errors.push('Les données ne sont pas un tableau valide');
        result.valid = false;
      }

      // Vérifier que chaque enregistrement a un ID
      const recordsWithoutId = records.filter((r: any) => !r.id);
      if (recordsWithoutId.length > 0) {
        result.warnings.push(`${recordsWithoutId.length} enregistrements sans ID`);
      }

      // Vérifier les doublons d'ID
      const ids = records.map((r: any) => r.id).filter(Boolean);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        result.errors.push('IDs dupliqués détectés');
        result.valid = false;
      }

      result.metadata = {
        recordCount: records.length,
        uniqueIds: uniqueIds.size,
        lastCheck: new Date().toISOString()
      };

    } catch (error) {
      result.valid = false;
      result.errors.push(`Erreur vérification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return result;
  }
}