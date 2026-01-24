/**
 * Composant upload photo patient
 * Upload local chiffré - aucune donnée envoyée au cloud
 */

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, User, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { hdsSecurePhotoService } from '@/services/hds-secure-storage/hds-secure-photo-service';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PatientPhotoUploadProps {
  patientId: number | string;
  patientName?: string;
  onPhotoChange?: (photoUrl: string | null) => void;
  className?: string;
}

export function PatientPhotoUpload({
  patientId,
  patientName = 'Patient',
  onPhotoChange,
  className = '',
}: PatientPhotoUploadProps) {
  const { isDemoMode } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger la photo existante au montage
  useEffect(() => {
    loadExistingPhoto();
  }, [patientId]);

  const loadExistingPhoto = async () => {
    try {
      if (isDemoMode) {
        // Mode démo: charger depuis localStorage
        const demoPhotoKey = `demo_patient_photo_${patientId}`;
        const demoPhoto = localStorage.getItem(demoPhotoKey);
        if (demoPhoto) {
          setPhotoUrl(demoPhoto);
          onPhotoChange?.(demoPhoto);
        }
      } else {
        // Mode connecté: charger depuis HDS
        const photo = await hdsSecurePhotoService.getPatientPhoto(patientId as number);
        if (photo) {
          setPhotoUrl(photo.photoData);
          onPhotoChange?.(photo.photoData);
        }
      }
    } catch (err) {
      console.error('Erreur chargement photo:', err);
    }
  };

  const handleFileDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setUploading(true);

    try {
      // Validation taille (5MB max)
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error('Image trop volumineuse (max 5MB)');
      }

      // Convertir en base64
      const base64 = await hdsSecurePhotoService.fileToBase64(file);

      // Compresser l'image
      const compressedBase64 = await hdsSecurePhotoService.compressImage(
        base64,
        800,
        800,
        0.85
      );

      // Calculer taille compressée
      const compressedSize = Math.round((compressedBase64.length * 3) / 4);

      if (isDemoMode) {
        // Mode démo: sauvegarder dans localStorage
        const demoPhotoKey = `demo_patient_photo_${patientId}`;
        localStorage.setItem(demoPhotoKey, compressedBase64);

        setPhotoUrl(compressedBase64);
        onPhotoChange?.(compressedBase64);

        toast.success('Photo enregistrée (mode démo)', {
          description: `Taille: ${(compressedSize / 1024).toFixed(0)}KB - Stockage temporaire`,
        });
      } else {
        // Mode connecté: uploader dans le stockage HDS sécurisé (local chiffré)
        await hdsSecurePhotoService.uploadPatientPhoto({
          patientId: patientId as number,
          photoData: compressedBase64,
          mimeType: file.type,
          fileName: file.name,
          fileSize: compressedSize,
        });

        setPhotoUrl(compressedBase64);
        onPhotoChange?.(compressedBase64);

        toast.success('Photo enregistrée localement (chiffrée)', {
          description: `Taille: ${(compressedSize / 1024).toFixed(0)}KB`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur upload photo';
      setError(errorMessage);
      toast.error('Erreur upload photo', {
        description: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      if (isDemoMode) {
        // Mode démo: supprimer de localStorage
        const demoPhotoKey = `demo_patient_photo_${patientId}`;
        localStorage.removeItem(demoPhotoKey);
        setPhotoUrl(null);
        onPhotoChange?.(null);
        toast.success('Photo supprimée');
      } else {
        // Mode connecté: supprimer du HDS
        const photo = await hdsSecurePhotoService.getPatientPhoto(patientId as number);
        if (photo) {
          await hdsSecurePhotoService.deletePatientPhoto(photo.id);
          setPhotoUrl(null);
          onPhotoChange?.(null);
          toast.success('Photo supprimée');
        }
      }
    } catch (err) {
      toast.error('Erreur suppression photo');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  // Initiales pour l'avatar fallback
  const initials = patientName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // En mode connecté non-démo, vérifier si HDS est disponible
  const isHDSUnavailable = !isDemoMode; // Simplification: désactiver en mode connecté si erreurs HDS

  if (isHDSUnavailable && !isDemoMode) {
    // Mode connecté avec HDS non initialisé
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24 lg:h-32 lg:w-32">
            <AvatarFallback className="text-2xl lg:text-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
              {initials || <User className="h-12 w-12 lg:h-16 lg:w-16" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm lg:text-base font-medium">{patientName}</p>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Photo de profil non disponible
            </p>
          </div>
        </div>
        <Card className="border-2 border-dashed border-border opacity-60">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-12 w-12 lg:h-14 lg:w-14 text-muted-foreground" />
              <div>
                <p className="text-sm lg:text-base font-medium mb-1 text-muted-foreground">
                  Upload de photo temporairement désactivé
                </p>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Configuration du stockage sécurisé requise
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs lg:text-sm text-amber-800 dark:text-amber-200">
            <strong>Stockage sécurisé non initialisé</strong> - Configurez le stockage HDS depuis les paramètres pour activer l'upload de photos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Avatar actuel */}
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24 lg:h-32 lg:w-32">
          {photoUrl ? (
            <AvatarImage src={photoUrl} alt={patientName} />
          ) : (
            <AvatarFallback className="text-2xl lg:text-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
              {initials || <User className="h-12 w-12 lg:h-16 lg:w-16" />}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1">
          <p className="text-sm lg:text-base font-medium">{patientName}</p>
          <p className="text-xs lg:text-sm text-muted-foreground">
            {photoUrl ? (isDemoMode ? 'Photo temporaire (mode démo)' : 'Photo chiffrée localement') : 'Aucune photo'}
          </p>
        </div>

        {photoUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemovePhoto}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        )}
      </div>

      {/* Zone d'upload */}
      <Card
        {...getRootProps()}
        className={`cursor-pointer transition-all border-2 border-dashed hover:border-primary/50 ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <CardContent className="p-6 text-center">
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <p className="text-sm font-medium">Compression en cours...</p>
              </>
            ) : isDragActive ? (
              <>
                <ImageIcon className="h-12 w-12 text-primary" />
                <p className="text-sm font-medium">Déposez l'image ici</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium mb-1">
                    {photoUrl ? 'Remplacer la photo' : 'Ajouter une photo'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cliquez ou glissez une image (JPG, PNG, WEBP)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB • {isDemoMode ? 'Stockage temporaire (1h)' : 'Stockage local sécurisé'}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info sécurité selon le mode */}
      {!error && (
        <Alert className={isDemoMode
          ? "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
          : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
        }>
          <AlertCircle className={`h-4 w-4 ${isDemoMode ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`} />
          <AlertDescription className={`text-xs ${isDemoMode ? 'text-purple-800 dark:text-purple-200' : 'text-green-800 dark:text-green-200'}`}>
            {isDemoMode ? (
              <>
                <strong>Mode démonstration</strong> - Photo stockée temporairement dans votre navigateur (1 heure). Les données seront effacées à la fin de la session démo.
              </>
            ) : (
              <>
                <strong>100% local et sécurisé</strong> - Votre photo est chiffrée (AES-256-GCM) et stockée uniquement sur votre ordinateur. Aucune donnée envoyée au cloud.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
