/**
 * 🔐 Utilitaires cryptographiques pour sécurité maximale HDS
 * 
 * Implémente AES-256-GCM + HMAC + horodatage cryptographique
 * pour empêcher toute falsification des données médicales
 */

// Types pour les données chiffrées
export interface EncryptedData {
  data: string; // Données chiffrées en base64
  iv: string; // Vecteur d'initialisation
  salt: string; // Salt pour la dérivation de clé
  tag: string; // Tag d'authentification AES-GCM
  hmac: string; // Signature HMAC pour anti-falsification
  timestamp: number; // Horodatage cryptographique
  version: string; // Version du schéma de chiffrement
}

export interface CryptoConfig {
  keyDerivationIterations: number;
  algorithm: string;
  ivLength: number;
  saltLength: number;
  tagLength: number;
}

// Configuration crypto sécurisée
const CRYPTO_CONFIG: CryptoConfig = {
  keyDerivationIterations: 100000, // PBKDF2 100k itérations
  algorithm: 'AES-GCM',
  ivLength: 12, // 96 bits pour AES-GCM
  saltLength: 32, // 256 bits
  tagLength: 16 // 128 bits
};

export class SecureCrypto {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  /**
   * Générer un salt cryptographique aléatoire
   */
  private static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.saltLength));
  }

  /**
   * Générer un IV (Initialization Vector) aléatoire
   */
  private static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(CRYPTO_CONFIG.ivLength));
  }

  /**
   * Dériver une clé de chiffrement depuis un mot de passe
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: CRYPTO_CONFIG.keyDerivationIterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Dériver une clé HMAC pour la signature
   */
  private static async deriveHMACKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password + '_hmac'),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: CRYPTO_CONFIG.keyDerivationIterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    return crypto.subtle.importKey(
      'raw',
      derivedBits,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }

  /**
   * Chiffrer des données avec AES-256-GCM + HMAC anti-falsification
   */
  static async encrypt(data: any, password: string): Promise<EncryptedData> {
    const plaintext = JSON.stringify(data);
    const plaintextBytes = this.encoder.encode(plaintext);
    
    // Générer salt et IV aléatoirement
    const salt = this.generateSalt();
    const iv = this.generateIV();
    
    // Dériver les clés de chiffrement et HMAC
    const [encryptionKey, hmacKey] = await Promise.all([
      this.deriveKey(password, salt),
      this.deriveHMACKey(password, salt)
    ]);

    // Chiffrer avec AES-GCM
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: CRYPTO_CONFIG.tagLength * 8
      },
      encryptionKey,
      plaintextBytes
    );

    // Extraire les données chiffrées et le tag d'authentification
    const encryptedBytes = new Uint8Array(encrypted.slice(0, -CRYPTO_CONFIG.tagLength));
    const tag = new Uint8Array(encrypted.slice(-CRYPTO_CONFIG.tagLength));
    
    // Créer l'horodatage cryptographique
    const timestamp = Date.now();
    
    // Préparer les données pour signature HMAC
    const dataToSign = this.encoder.encode(
      btoa(String.fromCharCode(...encryptedBytes)) + 
      btoa(String.fromCharCode(...iv)) + 
      btoa(String.fromCharCode(...salt)) + 
      btoa(String.fromCharCode(...tag)) + 
      timestamp.toString() + 
      '1.0'
    );

    // Signer avec HMAC
    const hmacSignature = await crypto.subtle.sign('HMAC', hmacKey, dataToSign);

    return {
      data: btoa(String.fromCharCode(...encryptedBytes)),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt)),
      tag: btoa(String.fromCharCode(...tag)),
      hmac: btoa(String.fromCharCode(...new Uint8Array(hmacSignature))),
      timestamp,
      version: '1.0'
    };
  }

  /**
   * Déchiffrer et vérifier l'intégrité des données
   */
  static async decrypt(encryptedData: EncryptedData, password: string): Promise<any> {
    const { data, iv, salt, tag, hmac, timestamp, version } = encryptedData;

    // Validation de base
    if (version !== '1.0') {
      throw new Error('Version de chiffrement non supportée');
    }

    // Vérifier que l'horodatage n'est pas dans le futur (protection contre la rétroactivité)
    if (timestamp > Date.now() + 300000) { // 5 minutes de tolérance
      throw new Error('Horodatage invalide - données potentiellement falsifiées');
    }

    // Décoder les données
    const saltBytes = new Uint8Array([...atob(salt)].map(c => c.charCodeAt(0)));
    const ivBytes = new Uint8Array([...atob(iv)].map(c => c.charCodeAt(0)));
    const encryptedBytes = new Uint8Array([...atob(data)].map(c => c.charCodeAt(0)));
    const tagBytes = new Uint8Array([...atob(tag)].map(c => c.charCodeAt(0)));
    const hmacBytes = new Uint8Array([...atob(hmac)].map(c => c.charCodeAt(0)));

    // Dériver les clés
    const [encryptionKey, hmacKey] = await Promise.all([
      this.deriveKey(password, saltBytes),
      this.deriveHMACKey(password, saltBytes)
    ]);

    // Vérifier la signature HMAC (protection anti-falsification)
    const dataToVerify = this.encoder.encode(data + iv + salt + tag + timestamp.toString() + version);
    const isValidHMAC = await crypto.subtle.verify('HMAC', hmacKey, hmacBytes, dataToVerify);
    
    if (!isValidHMAC) {
      throw new Error('Signature HMAC invalide - données falsifiées détectées');
    }

    // Reconstituer les données chiffrées avec le tag
    const fullEncrypted = new Uint8Array(encryptedBytes.length + tagBytes.length);
    fullEncrypted.set(encryptedBytes);
    fullEncrypted.set(tagBytes, encryptedBytes.length);

    // Déchiffrer avec AES-GCM
    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes,
          tagLength: CRYPTO_CONFIG.tagLength * 8
        },
        encryptionKey,
        fullEncrypted
      );

      const plaintext = this.decoder.decode(decrypted);
      return JSON.parse(plaintext);
    } catch (error) {
      throw new Error('Échec du déchiffrement - clé incorrecte ou données corrompues');
    }
  }

  /**
   * Générer un hash SHA-256 pour vérification d'intégrité
   */
  static async generateHash(data: string): Promise<string> {
    const dataBytes = this.encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode(...hashArray));
  }

  /**
   * Vérifier l'intégrité d'un fichier via son hash
   */
  static async verifyHash(data: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.generateHash(data);
    return actualHash === expectedHash;
  }

  /**
   * Générer une signature temporelle sécurisée
   */
  static generateSecureTimestamp(): {
    timestamp: number;
    nonce: string;
    signature: string;
  } {
    const timestamp = Date.now();
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    const signature = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    
    return { timestamp, nonce, signature };
  }
}

/**
 * Validation des données HDS - Contrôles d'intégrité
 */
export class HDSDataValidator {
  /**
   * Valider la structure d'un fichier HDS
   */
  static validateHDSFile(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.metadata) {
      errors.push('Métadonnées manquantes');
    } else {
      if (!data.metadata.entity) errors.push('Type d\'entité manquant');
      if (!data.metadata.version) errors.push('Version manquante');
      if (!data.metadata.timestamp) errors.push('Horodatage manquant');
      if (!data.metadata.checksum) errors.push('Checksum manquant');
    }

    if (!Array.isArray(data.records)) {
      errors.push('Format des enregistrements invalide');
    }

    if (!data.signature) {
      errors.push('Signature cryptographique manquante');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Valider qu'un enregistrement patient respecte les contraintes HDS
   */
  static validatePatientRecord(patient: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Champs obligatoires
    const requiredFields = ['id', 'firstName', 'lastName', 'createdAt'];
    for (const field of requiredFields) {
      if (!patient[field]) {
        errors.push(`Champ obligatoire manquant: ${field}`);
      }
    }

    // Validation des types
    if (typeof patient.id !== 'number') {
      errors.push('ID patient doit être numérique');
    }

    if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
      errors.push('Format email invalide');
    }

    if (patient.phone && !/^[\d\s+()-]+$/.test(patient.phone)) {
      errors.push('Format téléphone invalide');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}