
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface ProfileStampManagementProps {
  stampUrl?: string;
  onStampUrlChange?: (url: string) => void;
  isSubmitting?: boolean;
}

export function ProfileStampManagement({ 
  stampUrl, 
  onStampUrlChange, 
  isSubmitting 
}: ProfileStampManagementProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(stampUrl || null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);

      try {
        // Créer un aperçu local
        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);

        // Pour l'instant, on simule l'upload
        // Plus tard, cela sera remplacé par un vrai service d'upload
        const uploadedUrl = localPreview;
        
        if (onStampUrlChange) {
          onStampUrlChange(uploadedUrl);
        }

        toast.success("Tampon téléchargé avec succès");
      } catch (error) {
        console.error("Erreur upload tampon:", error);
        toast.error("Erreur lors du téléchargement du tampon");
        setPreviewUrl(stampUrl || null);
      } finally {
        setIsUploading(false);
      }
    }
  });

  const handleDeleteStamp = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce tampon ?")) return;

    try {
      setPreviewUrl(null);
      if (onStampUrlChange) {
        onStampUrlChange("");
      }
      toast.success("Tampon supprimé avec succès");
    } catch (error) {
      console.error("Erreur suppression tampon:", error);
      toast.error("Erreur lors de la suppression du tampon");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tampon numérique</CardTitle>
        <CardDescription>
          Téléchargez votre tampon pour l'ajouter automatiquement à vos factures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone de drag & drop */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Glissez-déposez votre tampon ici, ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, JPEG, GIF ou WEBP - Max 5MB
          </p>
        </div>

        {/* Aperçu du tampon */}
        {previewUrl && (
          <div className="space-y-3">
            <Label>Aperçu du tampon</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <img 
                src={previewUrl} 
                alt="Aperçu du tampon" 
                className="max-w-full max-h-32 mx-auto object-contain"
              />
            </div>
            
            {/* Actions sur le tampon */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(previewUrl, '_blank')}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Voir en grand</span>
                <span className="sm:hidden">Voir</span>
              </Button>
              
              <Button
                type="button"
                variant="destructive" 
                size="sm"
                onClick={handleDeleteStamp}
                disabled={isUploading || isSubmitting}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Supprimer le tampon</span>
                <span className="sm:hidden">Supprimer</span>
              </Button>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="text-center text-sm text-gray-600">
            Téléchargement en cours...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
