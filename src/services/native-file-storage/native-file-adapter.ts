/**
 * Adaptateur de stockage natif utilisant File System Access API
 * Stockage HDS : fichiers locaux exportables sur l'ordinateur du praticien
 */

interface FileHandle {
  handle: FileSystemFileHandle;
  writable?: FileSystemWritableFileStream;
}

interface StorageMetadata {
  version: string;
  lastModified: string;
  checksum?: string;
}

export class NativeFileAdapter {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private encryptionKey: string | null = null;
  private initialized = false;

  constructor(private entityName: string) {}

  // Générer un ID compatible avec PostgreSQL (max 2^31-1 = 2147483647)
  private generateSafeId(): number {
    return Math.floor(Math.random() * 2000000000) + 1;
  }

  /**
   * Initialiser le stockage natif
   */
  async initialize(directoryHandle: FileSystemDirectoryHandle, encryptionKey?: string): Promise<void> {
    this.directoryHandle = directoryHandle;
    this.encryptionKey = encryptionKey || null;
    
    // Créer le dossier pour cette entité s'il n'existe pas
    try {
      await this.directoryHandle.getDirectoryHandle(this.entityName, { create: true });
      this.initialized = true;
      console.log(`✅ Stockage natif initialisé pour ${this.entityName}`);
    } catch (error) {
      console.error(`❌ Erreur initialisation stockage natif ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Vérifier si l'adaptateur est initialisé
   */
  isInitialized(): boolean {
    return this.initialized && this.directoryHandle !== null;
  }

  /**
   * Obtenir le handle du dossier de l'entité
   */
  private async getEntityDirectory(): Promise<FileSystemDirectoryHandle> {
    if (!this.directoryHandle) {
      throw new Error('Stockage natif non initialisé');
    }
    return await this.directoryHandle.getDirectoryHandle(this.entityName, { create: true });
  }

  /**
   * Crypter les données si nécessaire
   */
  private async encryptData(data: any): Promise<string> {
    const jsonData = JSON.stringify(data, null, 2);
    
    if (!this.encryptionKey) {
      return jsonData;
    }
    
    // Simple chiffrement XOR pour la démo (à remplacer par un vrai chiffrement)
    const key = this.encryptionKey;
    let encrypted = '';
    for (let i = 0; i < jsonData.length; i++) {
      encrypted += String.fromCharCode(jsonData.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  }

  /**
   * Décrypter les données si nécessaire
   */
  private async decryptData(encryptedData: string): Promise<any> {
    if (!this.encryptionKey) {
      return JSON.parse(encryptedData);
    }
    
    // Simple déchiffrement XOR pour la démo
    const key = this.encryptionKey;
    const encrypted = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return JSON.parse(decrypted);
  }

  /**
   * Créer un enregistrement
   */
  async create(data: any): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('Adaptateur non initialisé');
    }

    const id = data.id || this.generateSafeId();
    const record = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    
    try {
      const entityDir = await this.getEntityDirectory();
      const fileHandle = await entityDir.getFileHandle(`${id}.json`, { create: true });
      const writable = await fileHandle.createWritable();
      
      const encryptedData = await this.encryptData(record);
      await writable.write(encryptedData);
      await writable.close();
      
      console.log(`✅ Enregistrement créé ${this.entityName}/${id}`);
      return record;
    } catch (error) {
      console.error(`❌ Erreur création ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Lire un enregistrement par ID
   */
  async getById(id: string): Promise<any | null> {
    if (!this.isInitialized()) {
      throw new Error('Adaptateur non initialisé');
    }

    try {
      const entityDir = await this.getEntityDirectory();
      const fileHandle = await entityDir.getFileHandle(`${id}.json`);
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      return await this.decryptData(content);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        return null;
      }
      console.error(`❌ Erreur lecture ${this.entityName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Lire tous les enregistrements
   */
  async getAll(): Promise<any[]> {
    if (!this.isInitialized()) {
      throw new Error('Adaptateur non initialisé');
    }

    try {
      const entityDir = await this.getEntityDirectory();
      const records: any[] = [];
      
      for await (const [name, handle] of (entityDir as any).entries()) {
        if (handle.kind === 'file' && name.endsWith('.json')) {
          try {
            const file = await handle.getFile();
            const content = await file.text();
            const record = await this.decryptData(content);
            records.push(record);
          } catch (error) {
            console.warn(`⚠️ Erreur lecture fichier ${name}:`, error);
          }
        }
      }
      
      return records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      console.error(`❌ Erreur lecture tous ${this.entityName}:`, error);
      throw error;
    }
  }

  /**
   * Mettre à jour un enregistrement
   */
  async update(id: string, updates: Partial<any>): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('Adaptateur non initialisé');
    }

    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new Error(`Enregistrement ${id} non trouvé`);
      }
      
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      
      const entityDir = await this.getEntityDirectory();
      const fileHandle = await entityDir.getFileHandle(`${id}.json`, { create: true });
      const writable = await fileHandle.createWritable();
      
      const encryptedData = await this.encryptData(updated);
      await writable.write(encryptedData);
      await writable.close();
      
      console.log(`✅ Enregistrement mis à jour ${this.entityName}/${id}`);
      return updated;
    } catch (error) {
      console.error(`❌ Erreur mise à jour ${this.entityName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer un enregistrement
   */
  async delete(id: string): Promise<boolean> {
    if (!this.isInitialized()) {
      throw new Error('Adaptateur non initialisé');
    }

    try {
      const entityDir = await this.getEntityDirectory();
      await entityDir.removeEntry(`${id}.json`);
      
      console.log(`✅ Enregistrement supprimé ${this.entityName}/${id}`);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        return false;
      }
      console.error(`❌ Erreur suppression ${this.entityName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Exporter toutes les données dans un fichier
   */
  async exportData(): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('Adaptateur non initialisé');
    }

    try {
      const data = await this.getAll();
      const exportData = {
        entity: this.entityName,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        records: data
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Utiliser File System Access API pour sauvegarder
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `${this.entityName}-export-${new Date().toISOString().split('T')[0]}.json`,
          types: [{
            description: 'Fichiers JSON',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        
        console.log(`✅ Export réussi ${this.entityName}`);
      } else {
        // Fallback pour les navigateurs qui ne supportent pas File System Access API
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.entityName}-export-${new Date().toISOString().split('T')[0]}.json`;
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
   * Obtenir les statistiques de stockage
   */
  async getStorageStats(): Promise<{ count: number; size: number }> {
    if (!this.isInitialized()) {
      return { count: 0, size: 0 };
    }

    try {
      const entityDir = await this.getEntityDirectory();
      let count = 0;
      let size = 0;
      
      for await (const [name, handle] of (entityDir as any).entries()) {
        if (handle.kind === 'file' && name.endsWith('.json')) {
          count++;
          try {
            const file = await handle.getFile();
            size += file.size;
          } catch (error) {
            console.warn(`⚠️ Erreur calcul taille ${name}:`, error);
          }
        }
      }
      
      return { count, size };
    } catch (error) {
      console.error(`❌ Erreur stats ${this.entityName}:`, error);
      return { count: 0, size: 0 };
    }
  }

  /**
   * Chiffrement XOR renforcé avec hash de la clé
   */
  private encrypt(data: string, key: string): string {
    // Créer un hash de la clé pour plus de sécurité
    const keyHash = this.hashKey(key);
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ keyHash.charCodeAt(i % keyHash.length));
    }
    // Ajouter un timestamp chiffré pour éviter la duplication
    const timestamp = Date.now().toString();
    const encryptedTimestamp = btoa(timestamp);
    return btoa(result) + '.' + encryptedTimestamp;
  }

  /**
   * Déchiffrement XOR renforcé
   */
  private decrypt(encryptedData: string, key: string): string {
    try {
      // Séparer les données du timestamp
      const [dataB64, timestampB64] = encryptedData.split('.');
      if (!dataB64 || !timestampB64) {
        throw new Error('Format de données chiffrées invalide');
      }

      const keyHash = this.hashKey(key);
      const data = atob(dataB64);
      let result = '';
      for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ keyHash.charCodeAt(i % keyHash.length));
      }
      return result;
    } catch (error) {
      throw new Error('Erreur de déchiffrement - clé invalide ou données corrompues');
    }
  }

  /**
   * Hash simple de la clé pour renforcer la sécurité
   */
  private hashKey(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4);
  }
}

/**
 * Vérifier le support de File System Access API
 */
export function checkNativeStorageSupport(): { supported: boolean; details: string[] } {
  const details: string[] = [];
  let supported = true;

  if (!('showDirectoryPicker' in window)) {
    details.push('❌ File System Access API non supportée');
    supported = false;
  } else {
    details.push('✅ File System Access API supportée');
  }

  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    details.push('⚠️ File System Access API nécessite HTTPS ou localhost');
    supported = false;
  } else {
    details.push('✅ Contexte sécurisé (HTTPS/localhost)');
  }

  return { supported, details };
}

/**
 * Demander l'accès au dossier de stockage
 */
export async function requestStorageDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('File System Access API non supportée');
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });
    
    console.log('✅ Accès au dossier de stockage accordé');
    return dirHandle;
  } catch (error) {
    console.error('❌ Erreur accès dossier:', error);
    throw error;
  }
}