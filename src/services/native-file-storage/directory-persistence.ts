/**
 * 🗂️ Gestionnaire de persistance des directoryHandle
 * Utilise IndexedDB pour sauvegarder les handles et vérifier les permissions
 */

interface PersistedDirectoryInfo {
  handle: FileSystemDirectoryHandle;
  grantedAt: string;
  lastVerified: string;
  name: string;
}

const DB_NAME = 'OstéoPraxis_DirectoryHandles';
const DB_VERSION = 1;
const STORE_NAME = 'directories';

/**
 * Ouvrir la base IndexedDB pour les handles
 */
async function openHandleDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Sauvegarder un directoryHandle de façon persistante
 */
export async function persistDirectoryHandle(
  handle: FileSystemDirectoryHandle, 
  name: string = 'default'
): Promise<void> {
  try {
    console.log('💾 Sauvegarde persistante du directoryHandle...');
    
    const db = await openHandleDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const info: PersistedDirectoryInfo = {
      handle,
      grantedAt: new Date().toISOString(),
      lastVerified: new Date().toISOString(),
      name
    };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: name, ...info });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    console.log('✅ DirectoryHandle sauvegardé avec succès');
  } catch (error) {
    console.error('❌ Erreur sauvegarde directoryHandle:', error);
    throw error;
  }
}

/**
 * Récupérer un directoryHandle sauvegardé
 */
export async function getPersistedDirectoryHandle(
  name: string = 'default'
): Promise<FileSystemDirectoryHandle | null> {
  try {
    console.log('🔍 Récupération du directoryHandle persisté...');
    
    const db = await openHandleDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const info = await new Promise<PersistedDirectoryInfo | null>((resolve, reject) => {
      const request = store.get(name);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    
    if (!info) {
      console.log('📁 Aucun directoryHandle persisté trouvé');
      return null;
    }
    
    // Vérifier que le handle est toujours valide
    try {
      // Test simple de validation du handle
      await info.handle.getDirectoryHandle('test-validity', { create: false });
      console.log('✅ DirectoryHandle récupéré et valide');
      
      // Mettre à jour la date de vérification
      await updateLastVerified(name);
      return info.handle;
    } catch (validationError) {
      // Le handle n'est plus valide ou accessible
      console.log('🔐 Tentative de vérification des permissions...');
      
      try {
        // Test d'écriture pour vérifier les permissions
        const testHandle = await info.handle.getFileHandle('permission-test.tmp', { create: true });
        const writable = await testHandle.createWritable();
        await writable.write('test');
        await writable.close();
        
        // Nettoyer le fichier de test
        try {
          await info.handle.removeEntry('permission-test.tmp');
        } catch {}
        
        console.log('✅ Permissions d\'écriture confirmées');
        await updateLastVerified(name);
        return info.handle;
      } catch (permissionError) {
        console.warn('❌ Permissions insuffisantes ou handle invalide:', permissionError);
        // Nettoyer le handle invalide
        await removePersistedDirectoryHandle(name);
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Erreur récupération directoryHandle:', error);
    return null;
  }
}

/**
 * Mettre à jour la date de dernière vérification
 */
async function updateLastVerified(name: string): Promise<void> {
  try {
    const db = await openHandleDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const info = await new Promise<PersistedDirectoryInfo | null>((resolve, reject) => {
      const request = store.get(name);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    
    if (info) {
      info.lastVerified = new Date().toISOString();
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ id: name, ...info });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
    
    db.close();
  } catch (error) {
    console.warn('⚠️ Erreur mise à jour lastVerified:', error);
  }
}

/**
 * Supprimer un directoryHandle persisté
 */
export async function removePersistedDirectoryHandle(name: string = 'default'): Promise<void> {
  try {
    const db = await openHandleDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    console.log('🗑️ DirectoryHandle supprimé de la persistance');
  } catch (error) {
    console.error('❌ Erreur suppression directoryHandle:', error);
  }
}

/**
 * Lister tous les directoryHandles persistés
 */
export async function listPersistedDirectoryHandles(): Promise<{ name: string; grantedAt: string; lastVerified: string }[]> {
  try {
    const db = await openHandleDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const infos = await new Promise<PersistedDirectoryInfo[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    
    return infos.map(info => ({
      name: info.name,
      grantedAt: info.grantedAt,
      lastVerified: info.lastVerified
    }));
  } catch (error) {
    console.error('❌ Erreur liste directoryHandles:', error);
    return [];
  }
}

/**
 * Vérifier si IndexedDB est disponible pour la persistance
 */
export function checkPersistenceSupport(): { supported: boolean; details: string[] } {
  const details: string[] = [];
  let supported = true;
  
  if (!indexedDB) {
    details.push('❌ IndexedDB non disponible');
    supported = false;
  } else {
    details.push('✅ IndexedDB disponible');
  }
  
  // Test de structured clone pour FileSystemDirectoryHandle
  try {
    if (typeof structuredClone === 'function') {
      details.push('✅ Structured clone supporté');
    } else {
      details.push('⚠️ Structured clone natif non disponible');
    }
  } catch {
    details.push('⚠️ Structured clone natif non disponible');
  }
  
  return { supported, details };
}