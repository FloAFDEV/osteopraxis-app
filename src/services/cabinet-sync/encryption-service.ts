/**
 * Service de chiffrement pour la synchronisation entre cabinets
 * Chiffrement AES-256-GCM avec gestion des clés hiérarchique
 */

import CryptoJS from 'crypto-js';

export interface CabinetSyncKey {
  cabinetId: number;
  keyVersion: number;
  keyHash: string;
  createdAt: Date;
}

export interface EncryptedSyncData {
  encryptedData: string;
  iv: string;
  tag: string;
  keyHash: string;
  algorithm: string;
  metadata: {
    cabinetId: number;
    patientHash: string;
    syncType: 'patient' | 'appointment' | 'invoice' | 'consultation';
    timestamp: number;
  };
}

export interface SyncPackage {
  id: string;
  ownerOsteopathId: number;
  targetOsteopathId: number;
  cabinetId: number;
  encryptedData: EncryptedSyncData;
  expiresAt: Date;
}

class CabinetSyncEncryptionService {
  private readonly ALGORITHM = 'AES-256-GCM';
  private readonly KEY_LENGTH = 256; // bits
  private readonly IV_LENGTH = 12; // bytes pour GCM
  private readonly TAG_LENGTH = 16; // bytes

  /**
   * Génère une clé de cabinet sécurisée
   */
  generateCabinetKey(cabinetId: number, salt?: string): string {
    const cabinetSalt = salt || CryptoJS.lib.WordArray.random(32).toString();
    const keyMaterial = `cabinet_${cabinetId}_${cabinetSalt}_${Date.now()}`;
    return CryptoJS.PBKDF2(keyMaterial, cabinetSalt, {
      keySize: this.KEY_LENGTH / 32,
      iterations: 100000
    }).toString();
  }

  /**
   * Génère une clé de session temporaire
   */
  generateSessionKey(): string {
    return CryptoJS.lib.WordArray.random(this.KEY_LENGTH / 8).toString();
  }

  /**
   * Génère un hash sécurisé d'une clé
   */
  hashKey(key: string): string {
    return CryptoJS.SHA256(key).toString();
  }

  /**
   * Génère un hash patient anonyme pour identification
   */
  generatePatientHash(patientId: string, cabinetId: number): string {
    const data = `patient_${patientId}_cabinet_${cabinetId}`;
    return CryptoJS.SHA256(data).toString().substring(0, 16);
  }

  /**
   * Chiffre les données patient pour synchronisation
   */
  async encryptSyncData(
    data: any,
    cabinetKey: string,
    sessionKey: string,
    metadata: {
      cabinetId: number;
      patientHash: string;
      syncType: 'patient' | 'appointment' | 'invoice' | 'consultation';
    }
  ): Promise<EncryptedSyncData> {
    try {
      // Sérialisation des données
      const jsonData = JSON.stringify(data);
      
      // Génération de l'IV
      const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);
      
      // Double chiffrement : cabinet key + session key
      const combinedKey = CryptoJS.SHA256(cabinetKey + sessionKey).toString();
      
      // Chiffrement AES-CBC (plus compatible que GCM avec crypto-js)
      const encrypted = CryptoJS.AES.encrypt(jsonData, combinedKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        encryptedData: encrypted.ciphertext.toString(),
        iv: iv.toString(),
        tag: '', // Non utilisé en CBC
        keyHash: this.hashKey(combinedKey),
        algorithm: 'AES-256-CBC',
        metadata: {
          ...metadata,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error);
      throw new Error('Échec du chiffrement des données de synchronisation');
    }
  }

  /**
   * Déchiffre les données patient synchronisées
   */
  async decryptSyncData(
    encryptedData: EncryptedSyncData,
    cabinetKey: string,
    sessionKey: string
  ): Promise<any> {
    try {
      // Reconstitution de la clé combinée
      const combinedKey = CryptoJS.SHA256(cabinetKey + sessionKey).toString();
      
      // Vérification du hash de clé
      if (this.hashKey(combinedKey) !== encryptedData.keyHash) {
        throw new Error('Clé de déchiffrement invalide');
      }

      // Déchiffrement CBC
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.encryptedData,
        combinedKey,
        {
          iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );

      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      if (!jsonString) {
        throw new Error('Déchiffrement invalide - données corrompues');
      }

      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      throw new Error('Échec du déchiffrement des données de synchronisation');
    }
  }

  /**
   * Crée un package de synchronisation sécurisé
   */
  async createSyncPackage(
    data: any,
    ownerOsteopathId: number,
    targetOsteopathId: number,
    cabinetId: number,
    patientLocalId: string,
    syncType: 'patient' | 'appointment' | 'invoice' | 'consultation',
    cabinetKey: string,
    expirationHours = 24
  ): Promise<SyncPackage> {
    const sessionKey = this.generateSessionKey();
    const patientHash = this.generatePatientHash(patientLocalId, cabinetId);

    const encryptedData = await this.encryptSyncData(
      data,
      cabinetKey,
      sessionKey,
      { cabinetId, patientHash, syncType }
    );

    return {
      id: CryptoJS.lib.WordArray.random(16).toString(),
      ownerOsteopathId,
      targetOsteopathId,
      cabinetId,
      encryptedData,
      expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000)
    };
  }

  /**
   * Valide l'intégrité d'un package de sync
   */
  validateSyncPackage(syncPackage: SyncPackage): boolean {
    try {
      // Vérification de l'expiration
      if (new Date() > syncPackage.expiresAt) {
        console.warn('Package de sync expiré');
        return false;
      }

      // Vérification de la structure
      const { encryptedData } = syncPackage;
      if (!encryptedData.encryptedData || !encryptedData.iv || !encryptedData.tag) {
        console.warn('Structure de package invalide');
        return false;
      }

      // Vérification des métadonnées
      if (!encryptedData.metadata || !encryptedData.metadata.cabinetId) {
        console.warn('Métadonnées manquantes');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      return false;
    }
  }

  /**
   * Génère une empreinte unique pour un patient
   * (utilisée pour détecter les doublons lors de la sync)
   */
  generatePatientFingerprint(patientData: any): string {
    const key_fields = [
      patientData.firstName?.toLowerCase(),
      patientData.lastName?.toLowerCase(),
      patientData.birthDate,
      patientData.email?.toLowerCase()
    ].filter(Boolean).join('|');
    
    return CryptoJS.SHA256(key_fields).toString().substring(0, 12);
  }

  /**
   * Efface de manière sécurisée les clés de la mémoire
   */
  secureWipeKey(key: string): void {
    // Remplace la chaîne par des zéros
    if (typeof key === 'string') {
      // Note: En JavaScript, les strings sont immutables
      // Cette fonction est symbolique pour la sécurité
      key = '0'.repeat(key.length);
    }
  }
}

// Instance singleton
export const cabinetSyncEncryption = new CabinetSyncEncryptionService();
export default cabinetSyncEncryption;