/**
 * Service HDS pour les Photos Patients
 * Stockage 100% LOCAL et CHIFFRÉ (AES-256-GCM)
 * AUCUNE photo ne transite vers le cloud
 */

import { EnhancedSecureStorage } from '../security/enhanced-secure-storage';

export interface PatientPhoto {
  id: number;
  patientId: number;
  photoData: string; // Base64 encoded image (chiffré)
  mimeType: string; // image/jpeg, image/png, etc.
  fileName: string;
  fileSize: number; // bytes
  uploadedAt: string;
  updatedAt: string;
}

export interface CreatePatientPhotoPayload {
  patientId: number;
  photoData: string; // Base64 encoded image
  mimeType: string;
  fileName: string;
  fileSize: number;
}

class HDSSecurePhotoService {
  private storage: EnhancedSecureStorage<PatientPhoto>;
  private readonly MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB max

  constructor() {
    this.storage = new EnhancedSecureStorage<PatientPhoto>('patient_photos');
  }

  // ===========================================================================
  // CRUD Photos - 100% LOCAL
  // ===========================================================================

  /**
   * Créer/Uploader une photo patient (LOCAL uniquement)
   */
  async uploadPatientPhoto(
    photoData: CreatePatientPhotoPayload
  ): Promise<PatientPhoto> {
    try {
      console.log('🔐 Upload photo patient dans le stockage HDS sécurisé (LOCAL UNIQUEMENT)...');

      // Validation taille
      if (photoData.fileSize > this.MAX_PHOTO_SIZE) {
        throw new Error(`Photo trop volumineuse (max ${this.MAX_PHOTO_SIZE / 1024 / 1024}MB)`);
      }

      // Validation mime type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(photoData.mimeType)) {
        throw new Error('Format d\'image non supporté (JPG, PNG, WEBP uniquement)');
      }

      // Supprimer l'ancienne photo si elle existe
      const existingPhoto = await this.getPatientPhoto(photoData.patientId);
      if (existingPhoto) {
        await this.deletePatientPhoto(existingPhoto.id);
      }

      const newPhoto: PatientPhoto = {
        id: Date.now(), // ID temporaire basé sur timestamp
        ...photoData,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const savedPhoto = await this.storage.save(newPhoto);
      console.log('✅ Photo patient uploadée et chiffrée localement:', savedPhoto.id);

      return savedPhoto;
    } catch (error) {
      console.error('❌ Erreur upload photo patient HDS:', error);
      throw error;
    }
  }

  /**
   * Récupérer la photo d'un patient (LOCAL)
   */
  async getPatientPhoto(patientId: number): Promise<PatientPhoto | null> {
    try {
      const allPhotos = await this.storage.getAll();
      const photo = allPhotos.find(p => p.patientId === patientId);

      if (photo) {
        console.log(`📸 Photo patient ${patientId} récupérée depuis le stockage local sécurisé`);
      }

      return photo || null;
    } catch (error) {
      console.error('❌ Erreur récupération photo patient HDS:', error);
      return null;
    }
  }

  /**
   * Récupérer une photo par ID (LOCAL)
   */
  async getPhotoById(id: number): Promise<PatientPhoto | null> {
    try {
      const photo = await this.storage.getById(id);
      return photo || null;
    } catch (error) {
      console.error('❌ Erreur récupération photo HDS:', error);
      return null;
    }
  }

  /**
   * Supprimer une photo patient (LOCAL)
   */
  async deletePatientPhoto(photoId: number): Promise<boolean> {
    try {
      console.log(`🗑️ Suppression photo patient ${photoId} du stockage HDS sécurisé...`);
      await this.storage.delete(photoId);
      console.log('✅ Photo supprimée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression photo patient HDS:', error);
      return false;
    }
  }

  /**
   * Mettre à jour une photo patient (LOCAL)
   */
  async updatePatientPhoto(
    photoId: number,
    updates: Partial<CreatePatientPhotoPayload>
  ): Promise<PatientPhoto | null> {
    try {
      console.log(`🔄 Mise à jour photo patient ${photoId}...`);

      const existingPhoto = await this.getPhotoById(photoId);
      if (!existingPhoto) {
        throw new Error(`Photo ${photoId} introuvable`);
      }

      const updatedPhoto: PatientPhoto = {
        ...existingPhoto,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const saved = await this.storage.update(photoId, updatedPhoto);
      console.log('✅ Photo mise à jour avec succès');
      return saved;
    } catch (error) {
      console.error('❌ Erreur mise à jour photo patient HDS:', error);
      return null;
    }
  }

  /**
   * Compresser une image en base64 (avant upload)
   * Utilise Canvas pour réduire la taille
   */
  async compressImage(
    base64Image: string,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.85
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Canvas context non disponible'));
            return;
          }

          // Calcul dimensions avec ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir en base64 avec compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          console.log(`📊 Image compressée: ${img.width}x${img.height} → ${width}x${height}`);
          resolve(compressedBase64);
        };

        img.onerror = () => {
          reject(new Error('Erreur chargement image'));
        };

        img.src = base64Image;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convertir File en base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erreur conversion base64'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erreur lecture fichier'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Statistiques photos (pour debug/monitoring)
   */
  async getPhotoStats(): Promise<{
    totalPhotos: number;
    totalSize: number;
    averageSize: number;
  }> {
    try {
      const allPhotos = await this.storage.getAll();
      const totalSize = allPhotos.reduce((sum, photo) => sum + photo.fileSize, 0);

      return {
        totalPhotos: allPhotos.length,
        totalSize,
        averageSize: allPhotos.length > 0 ? totalSize / allPhotos.length : 0,
      };
    } catch (error) {
      console.error('❌ Erreur stats photos HDS:', error);
      return { totalPhotos: 0, totalSize: 0, averageSize: 0 };
    }
  }
}

// Export singleton
export const hdsSecurePhotoService = new HDSSecurePhotoService();
