
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { toast } from "sonner";
import { UserCog } from "lucide-react";
import { ProfessionalProfile, ProfessionType } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères" }),
  title: z.string().min(2, { message: "Le titre professionnel doit comporter au moins 2 caractères" }),
  adeli_number: z.string().optional(),
  siret: z.string().optional(),
  ape_code: z.string().optional(),
  profession_type: z.enum(["osteopathe", "chiropracteur", "autre"])
});

interface ProfessionalProfileFormProps {
  defaultValues?: Partial<ProfessionalProfile>;
  professionalProfileId?: number;
  isEditing?: boolean;
  onSuccess?: (data: ProfessionalProfile) => void;
}

export function ProfessionalProfileForm({
  defaultValues,
  professionalProfileId,
  isEditing = false,
  onSuccess
}: ProfessionalProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      title: defaultValues?.title || "Ostéopathe D.O.",
      adeli_number: defaultValues?.adeli_number || "",
      siret: defaultValues?.siret || "",
      ape_code: defaultValues?.ape_code || "8690F",
      profession_type: (defaultValues?.profession_type as ProfessionType) || "osteopathe"
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const profileData = {
        name: values.name,
        title: values.title,
        adeli_number: values.adeli_number,
        siret: values.siret,
        ape_code: values.ape_code,
        profession_type: values.profession_type,
      };

      let result;

      if (isEditing && professionalProfileId) {
        // Update existing osteopath
        result = await api.updateProfessionalProfile(professionalProfileId, profileData);
        toast.success("Profil mis à jour avec succès!");
      } else {
        // Create new osteopath
        result = await api.createProfessionalProfile(profileData);
        toast.success("Profil créé avec succès!");
        form.reset();
      }

      if (onSuccess && result) {
        onSuccess(result);
      }

    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire de profil:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom / Raison sociale</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre professionnel</FormLabel>
                  <FormControl>
                    <Input placeholder="Ostéopathe D.O." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adeli_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro ADELI (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789" {...field} />
                  </FormControl>
                  <FormDescription>
                    Numéro d'enregistrement au répertoire ADELI
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="siret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIRET (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678901234" {...field} />
                  </FormControl>
                  <FormDescription>
                    Numéro SIRET de votre activité
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ape_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code APE (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="8690F" {...field} />
                  </FormControl>
                  <FormDescription>
                    Code APE de votre activité (ex: 8690F)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profession_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de profession</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="osteopathe">Ostéopathe</SelectItem>
                      <SelectItem value="chiropracteur">Chiropracteur</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent"></span>
                Enregistrement...
              </span>
            ) : (
              <span className="flex items-center">
                <UserCog className="mr-2 h-4 w-4" />
                {isEditing ? "Mettre à jour" : "Créer"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
