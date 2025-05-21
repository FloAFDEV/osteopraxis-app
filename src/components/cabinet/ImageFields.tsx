
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CabinetFormValues } from "./types";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Image, FileImage } from "lucide-react";

interface ImageFieldsProps {
  form: UseFormReturn<CabinetFormValues>;
  isSubmitting: boolean;
  previewImageUrl: string | null;
  previewLogoUrl: string | null;
  setPreviewImageUrl: (url: string | null) => void;
  setPreviewLogoUrl: (url: string | null) => void;
}

export function ImageFields({
  form,
  isSubmitting,
  previewImageUrl,
  previewLogoUrl,
  setPreviewImageUrl,
  setPreviewLogoUrl,
}: ImageFieldsProps) {
  // Fonction pour vérifier si une URL est valide
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Gestionnaires pour la prévisualisation des images
  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    if (isValidUrl(url)) {
      setPreviewImageUrl(url);
    } else {
      setPreviewImageUrl(null);
    }
  };

  const handleLogoUrlChange = (url: string) => {
    form.setValue("logoUrl", url);
    if (isValidUrl(url)) {
      setPreviewLogoUrl(url);
    } else {
      setPreviewLogoUrl(null);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Images</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de l'image du cabinet</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="url"
                      className="pl-10"
                      placeholder="URL de l'image du cabinet"
                      disabled={isSubmitting}
                      value={field.value || ""}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Insérez l'URL d'une image pour la façade ou l'intérieur de votre cabinet
                </FormDescription>
                <FormMessage />
                
                {previewImageUrl && (
                  <div className="mt-2">
                    <Card>
                      <CardContent className="p-2">
                        <div className="aspect-video w-full relative bg-muted rounded-sm overflow-hidden">
                          <img 
                            src={previewImageUrl} 
                            alt="Aperçu du cabinet" 
                            className="w-full h-full object-cover"
                            onError={() => setPreviewImageUrl(null)}
                          />
                        </div>
                        <p className="text-xs text-center mt-2 text-muted-foreground">Aperçu de l'image du cabinet</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL du logo du cabinet</FormLabel>
                <FormControl>
                  <div className="relative">
                    <FileImage className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="url"
                      className="pl-10"
                      placeholder="URL du logo du cabinet"
                      disabled={isSubmitting}
                      value={field.value || ""}
                      onChange={(e) => handleLogoUrlChange(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Insérez l'URL de votre logo professionnel
                </FormDescription>
                <FormMessage />
                
                {previewLogoUrl && (
                  <div className="mt-2">
                    <Card>
                      <CardContent className="p-2">
                        <div className="h-24 w-full flex items-center justify-center bg-muted/30 rounded-sm">
                          <div className="w-16 h-16 overflow-hidden">
                            <img 
                              src={previewLogoUrl} 
                              alt="Aperçu du logo" 
                              className="w-full h-full object-contain"
                              onError={() => setPreviewLogoUrl(null)}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-center mt-2 text-muted-foreground">Aperçu du logo</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
