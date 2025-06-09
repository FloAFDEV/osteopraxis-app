
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CabinetFormProps, cabinetFormSchema, CabinetFormValues } from "./types";
import { CabinetInfoFields } from "./CabinetInfoFields";
import { BillingInfoFields } from "./BillingInfoFields";
import { ImageFields } from "./ImageFields";
import { StampManagement } from "./StampManagement";

// Image par défaut pour les cabinets
const DEFAULT_CABINET_IMAGE = "https://img.freepik.com/photos-premium/maison-moderne-exterieur-genere_1116642-246.jpg?ga=GA1.1.290584622.1739450057&semt=ais_hybrid&w=740";

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
  const [currentStampUrl, setCurrentStampUrl] = useState<string | null>(null);

  useEffect(() => {
    // Initialiser les prévisualisations d'image avec les valeurs par défaut
    if (defaultValues?.imageUrl) {
      setPreviewImageUrl(defaultValues.imageUrl);
    } else if (!isEditing) {
      // Si c'est un nouveau cabinet, utiliser l'image par défaut
      setPreviewImageUrl(DEFAULT_CABINET_IMAGE);
    }
    
    if (defaultValues?.logoUrl) {
      setPreviewLogoUrl(defaultValues.logoUrl);
    }

    if (defaultValues?.stampUrl) {
      setCurrentStampUrl(defaultValues.stampUrl);
    }
    
    // Récupérer les données de l'ostéopathe si on est en mode édition
    const fetchOsteopathData = async () => {
      if (isEditing && osteopathId) {
        try {
          const data = await api.getOsteopathById(osteopathId);
          if (data) {
            setOsteopathData(data);
            setCurrentStampUrl(data.stampUrl || null);
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
      imageUrl: defaultValues?.imageUrl || (isEditing ? "" : DEFAULT_CABINET_IMAGE),
      logoUrl: defaultValues?.logoUrl || "",
      osteopathId: defaultValues?.osteopathId || osteopathId,
      siret: defaultValues?.siret || osteopathData?.siret || "",
      rppsNumber: defaultValues?.rppsNumber || osteopathData?.rpps_number || "",
      apeCode: defaultValues?.apeCode || osteopathData?.ape_code || "8690F",
      stampUrl: defaultValues?.stampUrl || osteopathData?.stampUrl || "",
    },
  });

  // Mettre à jour le formulaire quand les données de l'ostéopathe sont chargées
  useEffect(() => {
    if (osteopathData) {
      form.setValue("siret", osteopathData.siret || "");
      form.setValue("rppsNumber", osteopathData.rpps_number || "");
      form.setValue("apeCode", osteopathData.ape_code || "8690F");
      form.setValue("stampUrl", osteopathData.stampUrl || "");
    }
  }, [osteopathData, form]);

  const handleStampUrlChange = (url: string | null) => {
    setCurrentStampUrl(url);
    form.setValue("stampUrl", url || "");
  };

  const onSubmit = async (data: CabinetFormValues) => {
    try {
      setIsSubmitting(true);
      
      console.log('🔍 Données du formulaire avant envoi:', data);
      
      const cabinetData = {
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        imageUrl: data.imageUrl || null,
        logoUrl: data.logoUrl || null,
        osteopathId: data.osteopathId,
      };
      
      console.log('🔍 Données cabinet à envoyer:', cabinetData);
      
      if (isEditing && cabinetId) {
        // Update existing cabinet
        await api.updateCabinet(cabinetId, cabinetData);
        
        // Mettre à jour les informations de l'ostéopathe (y compris stampUrl) VIA LA FONCTION EDGE
        if (osteopathId) {
          const osteopathUpdateData = {
            siret: data.siret || null,
            rpps_number: data.rppsNumber || null,
            ape_code: data.apeCode || "8690F",
            stampUrl: data.stampUrl || null
          };
          
          console.log('🔍 Données ostéopathe à envoyer (incluant stampUrl):', osteopathUpdateData);
          console.log('🎯 StampUrl dans les données:', data.stampUrl);
          
          // Utilisation de la fonction Edge pour éviter les problèmes CORS
          await api.updateOsteopath(osteopathId, osteopathUpdateData);
        }
        
        toast.success("✅ Cabinet mis à jour avec succès");
      } else {
        // Create new cabinet
        const newCabinet = await api.createCabinet(cabinetData as Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>);
        
        // Mise à jour des informations de facturation de l'ostéopathe
        if (newCabinet && newCabinet.osteopathId) {
          const osteopathUpdateData = {
            siret: data.siret || null,
            rpps_number: data.rppsNumber || null,
            ape_code: data.apeCode || "8690F",
            stampUrl: data.stampUrl || null
          };
          
          console.log('🔍 Données ostéopathe à envoyer pour nouveau cabinet (incluant stampUrl):', osteopathUpdateData);
          
          await api.updateOsteopath(newCabinet.osteopathId, osteopathUpdateData);
        }
        
        toast.success("✅ Cabinet créé avec succès");
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
      toast.error("⛔ Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CabinetInfoFields form={form} isSubmitting={isSubmitting} />
        <BillingInfoFields form={form} isSubmitting={isSubmitting} />
        
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium mb-4">Tampon professionnel</h3>
          <StampManagement 
            form={form} 
            isSubmitting={isSubmitting}
            currentStampUrl={currentStampUrl}
            onStampUrlChange={handleStampUrlChange}
          />
        </div>
        
        <ImageFields 
          form={form} 
          isSubmitting={isSubmitting} 
          previewImageUrl={previewImageUrl}
          previewLogoUrl={previewLogoUrl}
          setPreviewImageUrl={setPreviewImageUrl}
          setPreviewLogoUrl={setPreviewLogoUrl}
        />

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
