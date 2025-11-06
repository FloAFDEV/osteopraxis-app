
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useEffect } from "react";

const osteopathSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  professional_title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères.",
  }),
  adeli_number: z.string().min(2, {
    message: "Le numéro Adeli doit contenir au moins 2 caractères.",
  }),
  siret: z.string().min(14, {
    message: "Le numéro SIRET doit contenir 14 caractères.",
  }),
  ape_code: z.string().min(5, {
    message: "Le code APE doit contenir 5 caractères.",
  }),
});

interface OsteopathProfileFormProps {
  onProfileCreated?: (osteopath: any) => void;
  currentOsteopath?: any;
  setCurrentOsteopath?: any;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: (updatedOsteopath: any) => Promise<void>;
  selectedPlan?: 'light' | 'full' | 'pro'; // Plan sélectionné par l'utilisateur
}

export function OsteopathProfileForm({ 
  onProfileCreated, 
  currentOsteopath, 
  setCurrentOsteopath,
  osteopathId,
  isEditing = false,
  onSuccess,
  selectedPlan = 'light' // Par défaut, le plan Light
}: OsteopathProfileFormProps) {
  const { user } = useAuth();

  const form = useForm<z.infer<typeof osteopathSchema>>({
    resolver: zodResolver(osteopathSchema),
    defaultValues: {
      name: currentOsteopath?.name || "",
      professional_title: currentOsteopath?.professional_title || "Ostéopathe D.O.",
      adeli_number: currentOsteopath?.rpps_number || "",
      siret: currentOsteopath?.siret || "",
      ape_code: currentOsteopath?.ape_code || "8690F",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (currentOsteopath) {
      form.reset({
        name: currentOsteopath.name || "",
        professional_title: currentOsteopath.professional_title || "Ostéopathe D.O.",
        adeli_number: currentOsteopath.rpps_number || "",
        siret: currentOsteopath.siret || "",
        ape_code: currentOsteopath.ape_code || "8690F",
      });
    }
  }, [currentOsteopath, form]);

  const onSubmit = async (data: z.infer<typeof osteopathSchema>) => {
    if (currentOsteopath || isEditing) {
      await updateOsteopathProfile(data);
    } else {
      await createOsteopathProfile(data);
    }
  };

  const updateOsteopathProfile = async (data: z.infer<typeof osteopathSchema>) => {
    try {
      // ✅ Mise à jour profil sécurisée

      const osteopathData = {
        name: data.name,
        professional_title: data.professional_title,
        rpps_number: data.adeli_number, // Map adeli_number to rpps_number
        siret: data.siret,
        ape_code: data.ape_code,
        userId: user?.id || "",
        authId: user?.id || "",
        plan: 'full' as const,
      };

      const updatedOsteopath = await api.updateOsteopath(osteopathId || currentOsteopath?.id, osteopathData);

      if (setCurrentOsteopath) {
        setCurrentOsteopath(updatedOsteopath);
      }

      if (onSuccess) {
        await onSuccess(updatedOsteopath);
      }

      toast.success("Profil ostéopathe mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil ostéopathe");
    }
  };

  const createOsteopathProfile = async (data: z.infer<typeof osteopathSchema>) => {
    try {
      // ✅ Création profil sécurisée
      
      const osteopathData = {
        name: data.name,
        professional_title: data.professional_title,
        rpps_number: data.adeli_number, // Map adeli_number to rpps_number
        siret: data.siret,
        ape_code: data.ape_code,
        userId: user?.id || "",
        authId: user?.id || "",
        plan: selectedPlan as 'light' | 'full' | 'pro', // Utiliser le plan sélectionné
      };

      const newOsteopath = await api.createOsteopath(osteopathData);
      
      if (setCurrentOsteopath) {
        setCurrentOsteopath(newOsteopath);
      }
      
      toast.success("Profil ostéopathe créé avec succès !");
      
      if (onProfileCreated) {
        onProfileCreated(newOsteopath);
      }
      
    } catch (error) {
      console.error("Erreur lors de la création du profil:", error);
      toast.error("Erreur lors de la création du profil ostéopathe");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom" {...field} />
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
              <FormControl>
                <Input placeholder="Votre titre" {...field} />
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
              <FormLabel>Numéro RPPS</FormLabel>
              <FormControl>
                <Input placeholder="Votre numéro RPPS" {...field} />
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
                <Input placeholder="Votre numéro SIRET" {...field} />
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
              <FormLabel>Code APE</FormLabel>
              <FormControl>
                <Input placeholder="Votre code APE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {currentOsteopath || isEditing ? "Mettre à jour" : "Créer"}
        </Button>
      </form>
    </Form>
  );
}
