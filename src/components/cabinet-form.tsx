
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/services/api";
import { Cabinet, CabinetFormProps } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du cabinet doit comporter au moins 2 caractères",
  }),
  address: z.string().min(5, {
    message: "L'adresse doit comporter au moins 5 caractères",
  }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Format d'email invalide" }).optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function CabinetForm({ defaultValues, cabinetId, professionalProfileId, isEditing = false, onSuccess }: CabinetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      address: defaultValues?.address || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      logoUrl: defaultValues?.logoUrl || "",
      imageUrl: defaultValues?.imageUrl || ""
    }
  });

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const cabinetData = {
        professionalProfileId,
        osteopathId: 1, // Par défaut, utilisons l'ID 1 pour la compatibilité
        name: data.name,
        address: data.address,
        phone: data.phone || "",
        email: data.email || "",
        logoUrl: data.logoUrl || "",
        imageUrl: data.imageUrl || ""
      };
      
      let result;
      
      if (isEditing && cabinetId) {
        result = await api.updateCabinet(cabinetId, cabinetData);
        toast.success("Cabinet mis à jour avec succès!");
      } else {
        result = await api.createCabinet(cabinetData);
        toast.success("Cabinet créé avec succès!");
      }
      
      if (onSuccess && result) {
        onSuccess(result);
      }
      
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... reste du composant inchangé
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 rue des Lilas, 75001 Paris"
                  className="resize-none"
                  {...field}
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
              <FormLabel>Email (optionnel)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@cabinet.fr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  URL d'une image pour le logo du cabinet
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
                <FormLabel>URL de l'image (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  URL d'une image représentant le cabinet
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent"></span>
                {isEditing ? "Mise à jour..." : "Création..."}
              </span>
            ) : (
              <span className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                {isEditing ? "Mettre à jour" : "Créer le cabinet"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
