/**
 * 🔐 Utilitaires cryptographiques robustes - Web Crypto API
 * Compatible navigateur avec fallbacks et validation
 */

// Helpers de conversion
const toUint8 = (s: string) => new TextEncoder().encode(s);
const fromUint8 = (b: Uint8Array) => new TextDecoder().decode(b);
const bufToBase64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const base64ToBuf = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;

export interface EncryptedPayload {
  version: number;
  timestamp: string;
  salt: string;
  iv: string;
  ciphertext: string;
  tagLength: number;
}

/**
 * Dériver une clé sécurisée depuis un mot de passe
 */
export async function deriveKey(password: string, saltBase64: string, iterations = 150000): Promise<CryptoKey> {
  try {
    const salt = base64ToBuf(saltBase64);
    const baseKey = await crypto.subtle.importKey(
      'raw', 
      toUint8(password), 
      { name: 'PBKDF2' }, 
      false, 
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      { 
        name: 'PBKDF2', 
        salt, 
        iterations, 
        hash: 'SHA-256' 
      },
      baseKey,
      { 
        name: 'AES-GCM', 
        length: 256 
      },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('❌ Erreur dérivation de clé:', error);
    throw new Error(`Impossible de dériver la clé de chiffrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Chiffrer un objet JSON avec AES-256-GCM
 */
export async function encryptJSON(plaintextObj: any, password: string): Promise<EncryptedPayload> {
  try {
    console.log('🔐 Chiffrement AES-256-GCM en cours...');
    
    const plaintext = toUint8(JSON.stringify(plaintextObj));
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 128 bits
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits recommandé pour GCM
    
    const saltB64 = bufToBase64(salt.buffer);
    const ivB64 = bufToBase64(iv.buffer);

    const key = await deriveKey(password, saltB64);
    const encrypted = await crypto.subtle.encrypt(
      { 
        name: 'AES-GCM', 
        iv, 
        tagLength: 128 // 128 bits auth tag
      }, 
      key, 
      plaintext
    );

    const result: EncryptedPayload = {
      version: 1,
      timestamp: new Date().toISOString(),
      salt: saltB64,
      iv: ivB64,
      ciphertext: bufToBase64(encrypted),
      tagLength: 128
    };
    
    console.log('✅ Chiffrement réussi');
    return result;
  } catch (error) {
    console.error('❌ Erreur chiffrement:', error);
    throw new Error(`Échec du chiffrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Déchiffrer un payload JSON avec AES-256-GCM
 */
export async function decryptJSON(stored: EncryptedPayload, password: string): Promise<any> {
  try {
    console.log('🔓 Déchiffrement AES-256-GCM en cours...');
    
    // Validation du format
    if (!stored.salt || !stored.iv || !stored.ciphertext) {
      throw new Error('Format de payload chiffré invalide');
    }
    
    const key = await deriveKey(password, stored.salt);
    const iv = base64ToBuf(stored.iv);
    const cipherBuf = base64ToBuf(stored.ciphertext);
    
    const decrypted = await crypto.subtle.decrypt(
      { 
        name: 'AES-GCM', 
        iv: new Uint8Array(iv) 
      }, 
      key, 
      cipherBuf
    );
    
    const result = JSON.parse(fromUint8(new Uint8Array(decrypted)));
    console.log('✅ Déchiffrement réussi');
    return result;
  } catch (error) {
    console.error('❌ Erreur déchiffrement:', error);
    
    if (error instanceof Error && error.message.includes('decrypt')) {
      throw new Error('Mot de passe incorrect ou données corrompues');
    }
    
    throw new Error(`Échec du déchiffrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Test de chiffrement/déchiffrement isolé
 */
export async function testCrypto(password: string): Promise<boolean> {
  try {
    console.log('🧪 Test crypto isolé...');
    
    const testData = { 
      test: true, 
      timestamp: Date.now(), 
      message: 'Test de chiffrement PatientHub HDS' 
    };
    
    const encrypted = await encryptJSON(testData, password);
    const decrypted = await decryptJSON(encrypted, password);
    
    const success = JSON.stringify(testData) === JSON.stringify(decrypted);
    
    if (success) {
      console.log('✅ Test crypto réussi');
    } else {
      console.error('❌ Test crypto échoué - données différentes');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Test crypto échoué:', error);
    return false;
  }
}

/**
 * Vérifier le support Web Crypto API
 */
export function checkCryptoSupport(): { supported: boolean; details: string[] } {
  const details: string[] = [];
  let supported = true;
  
  if (!crypto || !crypto.subtle) {
    details.push('❌ Web Crypto API non disponible');
    supported = false;
  } else {
    details.push('✅ Web Crypto API disponible');
  }
  
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    details.push('⚠️ Web Crypto API nécessite HTTPS ou localhost');
    supported = false;
  } else {
    details.push('✅ Contexte sécurisé pour Web Crypto API');
  }
  
  return { supported, details };
}

/**
 * Générer un hash SHA-256 d'une chaîne
 */
export async function generateSHA256(data: string): Promise<string> {
  try {
    const encoded = toUint8(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return bufToBase64(hashBuffer);
  } catch (error) {
    console.error('❌ Erreur génération hash:', error);
    throw new Error(`Impossible de générer le hash: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}