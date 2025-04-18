
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserCog } from "lucide-react";
import { api } from "@/services/api";
import { ProfessionalProfile, ProfessionType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères" }),
  title: z.string().min(2, { message: "Le titre professionnel doit comporter au moins 2 caractères" }),
  adeli_number: z.string().optional(),
  siret: z.string().min(9, { message: "Le numéro SIRET doit comporter au moins 9 caractères" }).optional(),
  ape_code: z.string().min(4, { message: "Le code APE doit comporter au moins 4 caractères" }).optional(),
  profession_type: z.enum(["osteopathe", "chiropracteur", "autre"] as const)
});

type FormValues = z.infer<typeof formSchema>;

interface ProfessionalProfileFormProps {
  defaultValues?: Partial<ProfessionalProfile>;
  profileId?: number;
  isEditing?: boolean;
  onSuccess?: (profile: ProfessionalProfile) => void;
}

export function ProfessionalProfileForm({
  defaultValues = {},
  profileId,
  isEditing = false,
  onSuccess,
}: ProfessionalProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues.name || "",
      title: defaultValues.title || "Ostéopathe D.O.",
      adeli_number: defaultValues.adeli_number || "",
      siret: defaultValues.siret || "",
      ape_code: defaultValues.ape_code || "8690F",
      profession_type: (defaultValues.profession_type as ProfessionType) || "osteopathe"
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true);

      // Vérifier que l'utilisateur est connecté
      if (!user) {
        console.error("Impossible de créer/mettre à jour le profil: utilisateur non connecté");
        return;
      }

      let profileResponse;
      const now = new Date().toISOString();

      if (isEditing && profileId) {
        // Mise à jour d'un profil existant
        profileResponse = await api.updateProfessionalProfile(profileId, {
          name: data.name,
          title: data.title,
          adeli_number: data.adeli_number || null,
          siret: data.siret || null,
          ape_code: data.ape_code || null,
          profession_type: data.profession_type,
          updatedAt: now
        });
    } else {
      // Création d'un nouveau profil
      const newProfileData = {
        name: data.name,
        title: data.title,
        adeli_number: data.adeli_number || null,
        siret: data.siret || null, 
        ape_code: data.ape_code || null,
        profession_type: data.profession_type,
        userId: user.id
      };
      
      profileResponse = await api.createProfessionalProfile(newProfileData);
    }

    // Appeler le callback onSuccess si fourni
    if (onSuccess && profileResponse) {
      onSuccess(profileResponse);
    }

  } catch (error) {
    console.error("Erreur lors de l'enregistrement du profil:", error);
  } finally {
    setIsSubmitting(false);
  }
}

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
                  <FormLabel>Nom complet</FormLabel>
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
                        <SelectValue placeholder="Sélectionnez une profession" />
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

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="adeli_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro ADELI (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} value={field.value || ""} />
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
                  <FormLabel>Numéro SIRET (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678901234" {...field} value={field.value || ""} />
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
                  <FormLabel>Code APE/NAF (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="8690F" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="min-w-[150px]" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent"></span>
                Enregistrement...
              </span>
            ) : (
              <span className="flex items-center">
                <UserCog className="mr-2 h-4 w-4" />
                {isEditing ? "Mettre à jour" : "Créer mon profil"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Pour la compatibilité
export const OsteopathProfileForm = ProfessionalProfileForm;
