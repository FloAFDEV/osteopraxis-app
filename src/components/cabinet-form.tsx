import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Building } from "lucide-react";
import { Cabinet } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères" }),
  address: z.string().min(5, { message: "L'adresse doit comporter au moins 5 caractères" }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Adresse email invalide" }).optional().or(z.literal("")),
  logoUrl: z.string().url({ message: "URL invalide" }).optional().or(z.literal("")),
  imageUrl: z.string().url({ message: "URL invalide" }).optional().or(z.literal("")),
});

interface CabinetFormProps {
  cabinet?: Cabinet;
  onSuccess?: (data: Cabinet) => void;
  onCancel?: () => void;
  professionalProfileId: number;
}

export function CabinetForm({
  cabinet,
  onSuccess,
  onCancel,
  professionalProfileId
}: CabinetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(cabinet?.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: cabinet?.name || "",
      address: cabinet?.address || "",
      phone: cabinet?.phone || "",
      email: cabinet?.email || "",
      logoUrl: cabinet?.logoUrl || "",
      imageUrl: cabinet?.imageUrl || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
    
      if (!professionalProfileId) {
        toast.error("Vous devez avoir un profil professionnel pour créer un cabinet.");
        return;
      }

      const cabinetData = {
        name: values.name,
        address: values.address || "", 
        phone: values.phone,
        email: values.email,
        logoUrl: values.logoUrl,
        imageUrl: values.imageUrl,
        professionalProfileId,
      };

      let result;
    
      if (isEditing && cabinet) {
        result = await api.updateCabinet(cabinet.id, cabinetData);
        toast.success("Cabinet mis à jour avec succès!");
      } else {
        result = await api.createCabinet(cabinetData);
        toast.success("Cabinet créé avec succès!");
        form.reset();
      }
    
      if (onSuccess && result) {
        onSuccess(result);
      }
    
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire de cabinet:", error);
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
                  <FormLabel>Nom du cabinet</FormLabel>
                  <FormControl>
                    <Input placeholder="Cabinet d'Ostéopathie" {...field} />
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
                    <Input placeholder="123 Rue de Paris, 75001 Paris" {...field} />
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
                  <FormLabel>Téléphone (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="01 23 45 67 89" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@cabinet.fr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL du logo (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL vers l'image de votre logo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'image du cabinet (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL vers une photo de votre cabinet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent"></span>
                Enregistrement...
              </span>
            ) : (
              <span className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                {isEditing ? "Mettre à jour" : "Créer"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
