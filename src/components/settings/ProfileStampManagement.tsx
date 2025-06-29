import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileImage, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/services/api";
import { useDropzone } from 'react-dropzone';
import { HelpButton } from '../ui/help-button';

interface ProfileStampManagementProps {
  osteopathId: number | undefined;
  isEditing: boolean;
}

function DragDropStampUpload({ onFileSelect, isUploading }: { onFileSelect: (file: File) => void, isUploading: boolean }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-muted-foreground'
        }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-500">Déposez l'image ici...</p>
      ) : (
        <>
          <FileImage className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Cliquez ou glissez-déposez votre tampon ici (PNG, JPG, max 2MB)
          </p>
        </>
      )}
    </div>
  );
}

export function ProfileStampManagement({ osteopathId, isEditing }: ProfileStampManagementProps) {
  const [stampUrl, setStampUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();

  // Load stamp on mount if editing
  useState(() => {
    const loadStamp = async () => {
      if (osteopathId) {
        try {
          const data = await api.getOsteopathById(osteopathId);
          setStampUrl(data?.stampUrl || null);
        } catch (error) {
          console.error("Error fetching stamp:", error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger le tampon."
          });
        }
      }
    };
    loadStamp();
  }, [osteopathId, toast]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUploadStamp = async () => {
    if (!selectedFile || !osteopathId) return;

    setIsUploading(true);
    try {
      const url = await api.uploadStamp(osteopathId, selectedFile);
      setStampUrl(url);
      setShowUpload(false);
      setSelectedFile(null);
      toast({
        title: "Succès",
        description: "Tampon mis à jour avec succès."
      });
    } catch (error) {
      console.error("Error uploading stamp:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le tampon."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteStamp = async () => {
    if (!osteopathId) return;

    setIsDeleting(true);
    try {
      await api.deleteStamp(osteopathId);
      setStampUrl(null);
      toast({
        title: "Succès",
        description: "Tampon supprimé avec succès."
      });
    } catch (error) {
      console.error("Error deleting stamp:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le tampon."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Tampon professionnel
          <HelpButton 
            content="Uploadez votre tampon professionnel pour l'ajouter automatiquement sur vos factures et documents officiels. Format recommandé : PNG avec fond transparent."
          />
        </CardTitle>
        <CardDescription>
          Gérez votre tampon professionnel pour les factures et documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stampUrl ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-green-50">
              <div className="flex-shrink-0">
                <img 
                  src={stampUrl} 
                  alt="Tampon professionnel" 
                  className="h-16 w-16 object-contain border rounded bg-white p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 mb-1">
                  Tampon configuré
                </p>
                <p className="text-xs text-green-600 break-all">
                  {stampUrl.split('/').pop()}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUpload(true)}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Modifier</span>
                  <span className="sm:hidden">Changer</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteStamp}
                  disabled={isDeleting}
                  className="w-full sm:w-auto"
                >
                  {isDeleting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </span>
                  <span className="ml-2 sm:hidden">
                    {isDeleting ? '...' : 'Suppr.'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun tampon configuré
            </p>
            <Button
              variant="outline"
              onClick={() => setShowUpload(true)}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Ajouter un tampon
            </Button>
          </div>
        )}

        {/* Upload Dialog - responsive */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="max-w-md mx-4 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {stampUrl ? 'Modifier le tampon' : 'Ajouter un tampon'}
              </DialogTitle>
              <DialogDescription>
                Uploadez votre tampon professionnel (PNG recommandé, max 2MB)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <DragDropStampUpload
                onFileSelect={handleFileSelect}
                isUploading={isUploading}
              />
              
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowUpload(false)}
                  className="w-full sm:w-auto"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUploadStamp}
                  disabled={!selectedFile || isUploading}
                  className="w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {stampUrl ? 'Modifier' : 'Ajouter'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Format recommandé: PNG avec fond transparent</p>
          <p>• Taille maximale: 2MB</p>
          <p>• Le tampon sera ajouté automatiquement sur vos factures</p>
        </div>
      </CardContent>
    </Card>
  );
}
