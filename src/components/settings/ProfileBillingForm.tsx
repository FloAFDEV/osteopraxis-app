
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
import { ProfileStampManagement } from "./ProfileStampManagement";

const profileSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  professional_title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères.",
  }),
  rpps_number: z.string().min(2, {
    message: "Le numéro RPPS doit contenir au moins 2 caractères.",
  }),
  siret: z.string().min(14, {
    message: "Le numéro SIRET doit contenir 14 caractères.",
  }),
  ape_code: z.string().min(5, {
    message: "Le code APE doit contenir 5 caractères.",
  }),
});

interface ProfileBillingFormProps {
  currentOsteopath?: any;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: (updatedOsteopath: any) => Promise<void> | void;
}

export function ProfileBillingForm({ 
  currentOsteopath,
  osteopathId,
  isEditing = false,
  onSuccess 
}: ProfileBillingFormProps) {
  const { user } = useAuth();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentOsteopath?.name || "",
      professional_title: currentOsteopath?.professional_title || "Ostéopathe D.O.",
      rpps_number: currentOsteopath?.rpps_number || "",
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
        rpps_number: currentOsteopath.rpps_number || "",
        siret: currentOsteopath.siret || "",
        ape_code: currentOsteopath.ape_code || "8690F",
      });
    }
  }, [currentOsteopath, form]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      console.log("Mise à jour du profil ostéopathe avec les données:", data);

      const osteopathData = {
        name: data.name,
        professional_title: data.professional_title,
        rpps_number: data.rpps_number,
        siret: data.siret,
        ape_code: data.ape_code,
        userId: user?.id || "",
        authId: user?.id || "",
      };

      const updatedOsteopath = await api.updateOsteopath(osteopathId || currentOsteopath?.id, osteopathData);

      if (onSuccess) {
        await onSuccess(updatedOsteopath);
      }

      toast.success("Profil ostéopathe mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil ostéopathe");
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            name="rpps_number"
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
            {isEditing ? "Mettre à jour" : "Créer"}
          </Button>
        </form>
      </Form>

      {/* Gestion du tampon professionnel */}
      {osteopathId && (
        <ProfileStampManagement osteopathId={osteopathId} />
      )}
    </div>
  );
}
