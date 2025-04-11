
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Osteopath } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const osteopathProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  professional_title: z.string().optional(),
  adeli_number: z.string().min(9, {
    message: "Le numéro ADELI doit contenir au moins 9 caractères",
  }),
  siret: z.string().optional(),
  ape_code: z.string().optional(),
});

type OsteopathProfileFormValues = z.infer<typeof osteopathProfileSchema>;

interface OsteopathProfileFormProps {
  defaultValues?: Partial<OsteopathProfileFormValues>;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export function OsteopathProfileForm({
  defaultValues,
  osteopathId,
  isEditing = false,
  onSuccess
}: OsteopathProfileFormProps) {
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OsteopathProfileFormValues>({
    resolver: zodResolver(osteopathProfileSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      professional_title: defaultValues?.professional_title || "Ostéopathe D.O.",
      adeli_number: defaultValues?.adeli_number || "",
      siret: defaultValues?.siret || "",
      ape_code: defaultValues?.ape_code || "8690F",
    },
  });

  const onSubmit = async (data: OsteopathProfileFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && osteopathId) {
        // Update existing osteopath
        await api.updateOsteopath(osteopathId, data);
        toast.success("Profil mis à jour avec succès");
      } else if (user) {
        // Create new osteopath
        const newOsteopath = await api.createOsteopath({
          name: data.name,
          professional_title: data.professional_title || "Ostéopathe D.O.",
          adeli_number: data.adeli_number,
          siret: data.siret || null,
          ape_code: data.ape_code || "8690F",
          userId: user.id
        });

        // Update user with new osteopathId
        if (updateUser && newOsteopath) {
          await updateUser({
            ...user,
            osteopathId: newOsteopath.id
          });
        }
        
        toast.success("Profil créé avec succès");
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting osteopath form:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom et prénom</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nom et prénom complet"
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
          name="professional_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre professionnel</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || "Ostéopathe D.O."}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre titre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ostéopathe D.O.">Ostéopathe D.O.</SelectItem>
                  <SelectItem value="Ostéopathe">Ostéopathe</SelectItem>
                  <SelectItem value="Ostéopathe MROF">Ostéopathe MROF</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adeli_number"
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
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ape_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code APE / NAF</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Code APE / NAF"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value || "8690F"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting 
            ? "Enregistrement..." 
            : isEditing 
              ? "Mettre à jour le profil" 
              : "Créer mon profil"
          }
        </Button>
      </form>
    </Form>
  );
}
