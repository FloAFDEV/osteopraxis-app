/**
 * 🗂️ Stockage sécurisé de fichiers avec chiffrement AES-256-GCM
 * 
 * Remplace IndexedDB par des fichiers physiques chiffrés
 * Implémente la sécurité maximale pour les données HDS
 */

import { SecureCrypto, EncryptedData, HDSDataValidator } from './crypto-utils';

export interface SecureFileMetadata {
  entity: string;
  version: string;
  timestamp: number;
  checksum: string;
  recordCount: number;
  fileSize: number;
  lastModified: string;
}

export interface SecureHDSFile<T = any> {
  metadata: SecureFileMetadata;
  records: T[];
  signature: {
    hmac: string;
    nonce: string;
    timestamp: number;
  };
}

export interface FileStorageStats {
  count: number;
  size: number;
  lastModified: string;
  integrity: boolean;
}

export class SecureFileStorage {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private encryptionPassword: string | null = null;
  private initialized = false;

  constructor(private entityName: string) {}

  /**
   * Initialiser le stockage sécurisé
   */
  async initialize(directoryHandle: FileSystemDirectoryHandle, password: string): Promise<void> {
    this.directoryHandle = directoryHandle;
    this.encryptionPassword = password;
    
    // Créer le dossier sécurisé pour cette entité
    try {
      await this.directoryHandle.getDirectoryHandle(`${this.entityName}_secure`, { create: true });
      this.initialized = true;
      console.log(`✅ Stockage sécurisé initialisé pour ${this.entityName}`);
    } catch (error) {
      console.error(`❌ Erreur initialisation stockage sécurisé ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier si le stockage est initialisé
   */
  isInitialized(): boolean {
    return this.initialized && this.directoryHandle !== null && this.encryptionPassword !== null;
  }

  /**
   * Obtenir le dossier sécurisé de l'entité
   */
  private async getSecureDirectory(): Promise<FileSystemDirectoryHandle> {
    if (!this.directoryHandle) {
      throw new Error('Stockage sécurisé non initialisé');
    }
    return await this.directoryHandle.getDirectoryHandle(`${this.entityName}_secure`, { create: true });
  }

  /**
   * Créer un fichier sécurisé avec signature anti-falsification
   */
  private async createSecureFile<T>(records: T[]): Promise<SecureHDSFile<T>> {
    const timestamp = Date.now();
    const recordCount = records.length;
    const serializedRecords = JSON.stringify(records, null, 2);
    const checksum = await SecureCrypto.generateHash(serializedRecords);
    
    const metadata: SecureFileMetadata = {
      entity: this.entityName,
      version: '2.0',
      timestamp,
      checksum,
      recordCount,
      fileSize: serializedRecords.length,
      lastModified: new Date().toISOString()
    };

    // Générer une signature cryptographique  
    const signatureData = SecureCrypto.generateSecureTimestamp();
    
    const secureFile: SecureHDSFile<T> = {
      metadata,
      records,
      signature: {
        hmac: signatureData.signature,
        nonce: signatureData.nonce,
        timestamp: signatureData.timestamp
      }
    };

    // Valider le fichier HDS
    const validation = HDSDataValidator.validateHDSFile(secureFile);
    if (!validation.valid) {
      throw new Error(`Fichier HDS invalide: ${validation.errors.join(', ')}`);
    }

    return secureFile;
  }

  /**
   * Sauvegarder des enregistrements de façon sécurisée
   */
  async saveRecords<T>(records: T[]): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Stockage sécurisé non initialisé');
    }

    try {
      // Créer le fichier sécurisé
      const secureFile = await this.createSecureFile(records);
      
      // Chiffrer le fichier complet
      const encryptedData = await SecureCrypto.encrypt(secureFile, this.encryptionPassword!);
      
      // Sauvegarder le fichier chiffré
      const secureDir = await this.getSecureDirectory();
      const fileName = `${this.entityName}_data.hds`;
      const fileHandle = await secureDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      await writable.write(JSON.stringify(encryptedData, null, 2));
      await writable.close();
      
      console.log(`✅ ${records.length} enregistrements ${this.entityName} sauvegardés de façon sécurisée`);
    } catch (error) {
      console.error(`❌ Erreur sauvegarde sécurisée ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Charger et vérifier les enregistrements
   */
  async loadRecords<T>(): Promise<T[]> {
    if (!this.isInitialized()) {
      throw new Error('Stockage sécurisé non initialisé');
    }

    try {
      const secureDir = await this.getSecureDirectory();
      const fileName = `${this.entityName}_data.hds`;
      
      try {
        const fileHandle = await secureDir.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const encryptedContent = await file.text();
        
        // Déchiffrer et vérifier l'intégrité
        const encryptedData: EncryptedData = JSON.parse(encryptedContent);
        const secureFile: SecureHDSFile<T> = await SecureCrypto.decrypt(encryptedData, this.encryptionPassword!);
        
        // Validation de sécurité HDS
        const validation = HDSDataValidator.validateHDSFile(secureFile);
        if (!validation.valid) {
          throw new Error(`Fichier HDS corrompu: ${validation.errors.join(', ')}`);
        }

        // Vérifier l'intégrité des données
        const serializedRecords = JSON.stringify(secureFile.records, null, 2);
        const isIntegrityValid = await SecureCrypto.verifyHash(serializedRecords, secureFile.metadata.checksum);
        
        if (!isIntegrityValid) {
          throw new Error('Intégrité des données compromise - fichier potentiellement falsifié');
        }

        console.log(`✅ ${secureFile.records.length} enregistrements ${this.entityName} chargés et vérifiés`);
        return secureFile.records;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotFoundError') {
          console.log(`📁 Aucun fichier sécurisé existant pour ${this.entityName}`);
          return [];
        }
        throw error;
      }
    } catch (error) {
      console.error(`❌ Erreur chargement sécurisé ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Sauvegarder un enregistrement individuel
   */
  async saveRecord<T>(record: T): Promise<T> {
    // Charger les enregistrements existants
    const existingRecords = await this.loadRecords<T>();
    
    // Ajouter ou mettre à jour l'enregistrement
    const recordWithMeta = {
      ...record,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = existingRecords.findIndex((r: any) => r.id === (record as any).id);
    if (existingIndex >= 0) {
      existingRecords[existingIndex] = recordWithMeta;
    } else {
      existingRecords.push(recordWithMeta);
    }

    // Sauvegarder tous les enregistrements
    await this.saveRecords(existingRecords);
    
    return recordWithMeta;
  }

  /**
   * Récupérer un enregistrement par ID
   */
  async getRecordById<T>(id: string | number): Promise<T | null> {
    const records = await this.loadRecords<T>();
    return records.find((r: any) => r.id === id) || null;
  }

  /**
   * Supprimer un enregistrement
   */
  async deleteRecord(id: string | number): Promise<boolean> {
    try {
      const records = await this.loadRecords();
      const filteredRecords = records.filter((r: any) => r.id !== id);
      
      if (filteredRecords.length < records.length) {
        await this.saveRecords(filteredRecords);
        console.log(`✅ Enregistrement ${id} supprimé de ${this.entityName}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Erreur suppression ${this.entityName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques du fichier sécurisé
   */
  async getStats(): Promise<FileStorageStats> {
    if (!this.isInitialized()) {
      return { count: 0, size: 0, lastModified: '', integrity: false };
    }

    try {
      const secureDir = await this.getSecureDirectory();
      const fileName = `${this.entityName}_data.hds`;
      
      const fileHandle = await secureDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      
      // Charger et vérifier l'intégrité
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
      
      console.error(`❌ Erreur stats ${this.entityName}:`, error);
      return { count: 0, size: 0, lastModified: '', integrity: false };
    }
  }

  /**
   * Exporter les données de façon sécurisée
   */
  async exportSecure(): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Stockage sécurisé non initialisé');
    }

    try {
      const records = await this.loadRecords();
      const secureFile = await this.createSecureFile(records);
      
      // Chiffrer pour l'export
      const encryptedData = await SecureCrypto.encrypt(secureFile, this.encryptionPassword!);
      
      const exportData = {
        format: 'PatientHub_HDS_Secure_Export',
        version: '2.0',
        entity: this.entityName,
        exportedAt: new Date().toISOString(),
        encrypted: encryptedData,
        instructions: 'Ce fichier contient des données médicales chiffrées. Import possible uniquement avec le mot de passe correct.'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Export sécurisé
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `${this.entityName}_secure_export_${new Date().toISOString().split('T')[0]}.phds`,
          types: [{
            description: 'Fichiers PatientHub HDS Sécurisés',
            accept: { 'application/json': ['.phds'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        
        console.log(`✅ Export sécurisé réussi ${this.entityName}`);
      } else {
        // Fallback
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.entityName}_secure_export_${new Date().toISOString().split('T')[0]}.phds`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`❌ Erreur export sécurisé ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier l'intégrité complète du stockage
   */
  async verifyIntegrity(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    metadata: SecureFileMetadata | null;
  }> {
    const result = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[],
      metadata: null as SecureFileMetadata | null
    };

    try {
      const records = await this.loadRecords();
      const secureDir = await this.getSecureDirectory();
      const fileName = `${this.entityName}_data.hds`;
      
      const fileHandle = await secureDir.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const encryptedContent = await file.text();
      
      const encryptedData: EncryptedData = JSON.parse(encryptedContent);
      const secureFile: SecureHDSFile = await SecureCrypto.decrypt(encryptedData, this.encryptionPassword!);
      
      result.metadata = secureFile.metadata;
      
      // Vérifications d'intégrité
      if (secureFile.metadata.recordCount !== records.length) {
        result.errors.push(`Nombre d'enregistrements incohérent: attendu ${secureFile.metadata.recordCount}, trouvé ${records.length}`);
      }

      // Vérifier chaque enregistrement selon le type
      for (const record of records) {
        if (this.entityName === 'patients') {
          const validation = HDSDataValidator.validatePatientRecord(record);
          if (!validation.valid) {
            result.warnings.push(`Patient ${(record as any).id}: ${validation.errors.join(', ')}`);
          }
        }
      }

      if (result.errors.length > 0) {
        result.valid = false;
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Erreur vérification intégrité: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return result;
  }
}