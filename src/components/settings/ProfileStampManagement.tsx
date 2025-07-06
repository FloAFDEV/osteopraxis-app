
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileStampManagementProps {
  currentStampUrl?: string | null;
  onStampUrlChange: (url: string | null) => void;
  isSubmitting?: boolean;
}

export function ProfileStampManagement({
  currentStampUrl,
  onStampUrlChange,
  isSubmitting = false,
}: ProfileStampManagementProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [bucketExists, setBucketExists] = useState(false);

  // Vérifier et créer le bucket si nécessaire
  useEffect(() => {
    const ensureBucketExists = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const stampsBucket = buckets?.find(bucket => bucket.name === 'stamps');
        
        if (!stampsBucket) {
          const { error } = await supabase.storage.createBucket('stamps', { public: true });
          if (error) {
            console.error('Erreur création bucket:', error);
          } else {
            // ✅ Bucket stamps créé
          }
        }
        setBucketExists(true);
      } catch (error) {
        console.error('Erreur vérification bucket:', error);
        setBucketExists(true);
      }
    };

    ensureBucketExists();
  }, []);

  const uploadStamp = async (file: File) => {
    if (!bucketExists) {
      toast.error("Le système de stockage n'est pas encore prêt. Veuillez réessayer.");
      return;
    }

    try {
      setUploading(true);

      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        toast.error("Format non supporté. Utilisez PNG ou JPG uniquement.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 5MB).");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour uploader un fichier.");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/stamp-${Date.now()}.${fileExt}`;

      if (currentStampUrl) {
        const oldFileName = currentStampUrl.split('/').pop();
        if (oldFileName && oldFileName.includes('stamp-')) {
          await supabase.storage
            .from('stamps')
            .remove([`${user.id}/${oldFileName}`]);
        }
      }

      const { data, error } = await supabase.storage
        .from('stamps')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('stamps')
        .getPublicUrl(fileName);

      onStampUrlChange(publicUrl);
      toast.success("Tampon/signature uploadé avec succès !");
      setShowReplaceDialog(false);

    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error("Erreur lors de l'upload du fichier.");
    } finally {
      setUploading(false);
    }
  };

  const deleteStamp = async () => {
    try {
      if (currentStampUrl) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fileName = currentStampUrl.split('/').pop();
          if (fileName && fileName.includes('stamp-')) {
            await supabase.storage
              .from('stamps')
              .remove([`${user.id}/${fileName}`]);
          }
        }
      }
      
      onStampUrlChange(null);
      toast.success("Tampon/signature supprimé avec succès.");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="space-y-4">
      {currentStampUrl ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Tampon/Signature actuel
              </div>
              <div className="flex gap-2">
                <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting || uploading}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remplacer le tampon/signature</DialogTitle>
                      <DialogDescription>
                        Sélectionnez un nouveau fichier pour remplacer votre tampon/signature actuel.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
                        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                      )}
                      onClick={() => document.getElementById('stamp-file-input')?.click()}
                    >
                      <div className="flex flex-col items-center justify-center text-center space-y-3">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {uploading ? "Upload en cours..." : "Glissez votre nouvelle image ici"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ou cliquez pour sélectionner un fichier (PNG, JPG max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    <input
                      id="stamp-file-input"
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadStamp(file);
                      }}
                      disabled={uploading}
                      className="hidden"
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReplaceDialog(false)}
                        disabled={uploading}
                      >
                        Annuler
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting || uploading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Supprimer le tampon/signature</DialogTitle>
                      <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer définitivement votre tampon/signature ?
                        Cette action ne peut pas être annulée.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={deleteStamp}
                      >
                        Supprimer définitivement
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center bg-muted/30 rounded-sm p-4">
              <div className="max-h-[150px] max-w-[300px] overflow-hidden">
                <img 
                  src={currentStampUrl} 
                  alt="Tampon/signature professionnel" 
                  className="max-h-[150px] w-auto object-contain"
                  onError={() => {
                    onStampUrlChange(null);
                    toast.error("Impossible de charger l'image du tampon/signature.");
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Cette image sera affichée sur vos notes d'honoraires et devis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            isSubmitting || uploading ? "opacity-50 cursor-not-allowed" : ""
          )}
          onClick={() => !isSubmitting && !uploading && document.getElementById('initial-stamp-input')?.click()}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {uploading ? "Upload en cours..." : "Ajoutez votre tampon/signature"}
              </p>
              <p className="text-xs text-muted-foreground">
                Glissez votre image ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG jusqu'à 5MB • Hauteur recommandée: 150px
              </p>
            </div>
          </div>

          <input
            id="initial-stamp-input"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadStamp(file);
            }}
            disabled={isSubmitting || uploading}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
