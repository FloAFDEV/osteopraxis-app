
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { toast } from "sonner";
import { Image, FileImage } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const cabinetFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  address: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères",
  }),
  phone: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  imageUrl: z.string().url("Format d'URL invalide").optional().or(z.literal("")),
  logoUrl: z.string().url("Format d'URL invalide").optional().or(z.literal("")),
  osteopathId: z.number(),
  siret: z.string().optional().or(z.literal("")),
  adeliNumber: z.string().optional().or(z.literal("")),
  apeCode: z.string().optional().or(z.literal("")),
});

type CabinetFormValues = z.infer<typeof cabinetFormSchema>;

interface CabinetFormProps {
  defaultValues?: Partial<CabinetFormValues>;
  cabinetId?: number;
  isEditing?: boolean;
  osteopathId: number;
  onSuccess?: () => void;
}

export function CabinetForm({
  defaultValues,
  cabinetId,
  isEditing = false,
  osteopathId,
  onSuccess,
}: CabinetFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [osteopathData, setOsteopathData] = useState<any>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Initialiser les prévisualisations d'image avec les valeurs par défaut
    if (defaultValues?.imageUrl) {
      setPreviewImageUrl(defaultValues.imageUrl);
    }
    if (defaultValues?.logoUrl) {
      setPreviewLogoUrl(defaultValues.logoUrl);
    }
    
    // Récupérer les données de l'ostéopathe si on est en mode édition
    const fetchOsteopathData = async () => {
      if (isEditing && osteopathId) {
        try {
          const data = await api.getOsteopathById(osteopathId);
          if (data) {
            setOsteopathData(data);
          }
        } catch (error) {
          console.error("⛔ Erreur lors de la récupération des données de l'ostéopathe:", error);
        }
      }
    };
    
    fetchOsteopathData();
  }, [isEditing, osteopathId, defaultValues]);

  const form = useForm<CabinetFormValues>({
    resolver: zodResolver(cabinetFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      address: defaultValues?.address || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      imageUrl: defaultValues?.imageUrl || "",
      logoUrl: defaultValues?.logoUrl || "",
      osteopathId: defaultValues?.osteopathId || osteopathId,
      siret: defaultValues?.siret || osteopathData?.siret || "",
      adeliNumber: defaultValues?.adeliNumber || osteopathData?.adeli_number || "",
      apeCode: defaultValues?.apeCode || osteopathData?.ape_code || "8690F",
    },
  });

  // Mettre à jour le formulaire quand les données de l'ostéopathe sont chargées
  useEffect(() => {
    if (osteopathData) {
      form.setValue("siret", osteopathData.siret || "");
      form.setValue("adeliNumber", osteopathData.adeli_number || "");
      form.setValue("apeCode", osteopathData.ape_code || "8690F");
    }
  }, [osteopathData, form]);

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

  const onSubmit = async (data: CabinetFormValues) => {
    try {
      setIsSubmitting(true);
      
      const cabinetData = {
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        imageUrl: data.imageUrl || null,
        logoUrl: data.logoUrl || null,
        osteopathId: data.osteopathId,
      };
      
      if (isEditing && cabinetId) {
        // Update existing cabinet
        await api.updateCabinet(cabinetId, cabinetData);
        
        // Mettre à jour les informations de l'ostéopathe
        if (osteopathId) {
          await api.updateOsteopath(osteopathId, {
            siret: data.siret || null,
            adeli_number: data.adeliNumber || null,
            ape_code: data.apeCode || "8690F"
          });
        }
        
        // Afficher le toast une seule fois ici après toutes les opérations réussies
        toast.success("✅ Cabinet mis à jour avec succès");
      } else {
        // Create new cabinet
        const newCabinet = await api.createCabinet(cabinetData as Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>);
        
        // Mise à jour des informations de facturation de l'ostéopathe
        if (newCabinet && newCabinet.osteopathId) {
          await api.updateOsteopath(newCabinet.osteopathId, {
            siret: data.siret || null,
            adeli_number: data.adeliNumber || null,
            ape_code: data.apeCode || "8690F"
          });
        }
        
        toast.success("Cabinet créé avec succès");
      }
      
      // Si un callback de succès est fourni, l'appeler après un court délai
      // pour que le toast ait le temps de s'afficher
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 300);
      } else {
        setTimeout(() => {
          navigate("/cabinets");
        }, 500);
      }
    } catch (error) {
      console.error("Error submitting cabinet form:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border-b pb-4 mb-2">
          <h3 className="text-lg font-medium mb-4">Informations du cabinet</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du Cabinet</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nom du cabinet"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Adresse complète"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Numéro de téléphone"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (facultatif)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email du cabinet"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="border-b pb-4 mb-2">
          <h3 className="text-lg font-medium mb-4">Informations de facturation</h3>
          
          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro SIRET</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Numéro SIRET"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Numéro SIRET nécessaire pour la facturation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="adeliNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro ADELI</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Numéro ADELI"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Numéro ADELI nécessaire pour la facturation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="apeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code APE</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Code APE (par défaut: 8690F)"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value || "8690F"}
                  />
                </FormControl>
                <FormDescription>
                  Code APE/NAF de votre activité (par défaut: 8690F pour les activités de santé humaine)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/cabinets")}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer le cabinet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
