
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Cabinet } from "@/types";

// Define the schema for cabinet form
const cabinetSchema = z.object({
  name: z.string().min(1, "Le nom du cabinet est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, "La ville est requise"),
  province: z.string().optional(),
  postalCode: z.string().min(1, "Le code postal est requis"),
  country: z.string().min(1, "Le pays est requis"),
  phone: z.string().optional(),
  email: z.string().email("Adresse email invalide").optional().or(z.literal('')),
});

type CabinetFormValues = z.infer<typeof cabinetSchema>;

interface CabinetFormProps {
  osteopathId: number;
  onSave: (cabinet: Cabinet) => Promise<void>;
  cabinet?: Cabinet;
}

export function CabinetForm({ osteopathId, onSave, cabinet }: CabinetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CabinetFormValues>({
    resolver: zodResolver(cabinetSchema),
    defaultValues: {
      name: cabinet?.name || "",
      address: cabinet?.address || "",
      city: cabinet?.city || "",
      province: cabinet?.province || "",
      postalCode: cabinet?.postalCode || "",
      country: cabinet?.country || "France",
      phone: cabinet?.phone || "",
      email: cabinet?.email || "",
    },
  });

  const handleSubmit = async (values: CabinetFormValues) => {
    try {
      setIsSubmitting(true);
      const cabinetData: Cabinet = {
        id: cabinet?.id ?? 0,
        name: values.name,
        address: values.address,
        city: values.city,
        province: values.province,
        postalCode: values.postalCode,
        country: values.country,
        phone: values.phone,
        email: values.email,
        osteopathId,
        // Ces champs seront remplis par le backend ou sont optionnels
        imageUrl: cabinet?.imageUrl || null,
        logoUrl: cabinet?.logoUrl || null,
        createdAt: cabinet?.createdAt || new Date().toISOString(),
        updatedAt: cabinet?.updatedAt || new Date().toISOString(),
      };

      await onSave(cabinetData);
    } catch (error) {
      console.error("Error saving cabinet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du cabinet *</FormLabel>
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
                <FormLabel>Téléphone</FormLabel>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="contact@cabinet.com" {...field} />
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
              <FormLabel>Adresse *</FormLabel>
              <FormControl>
                <Textarea placeholder="123 rue de Paris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal *</FormLabel>
                <FormControl>
                  <Input placeholder="75001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville *</FormLabel>
                <FormControl>
                  <Input placeholder="Paris" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Région</FormLabel>
                <FormControl>
                  <Input placeholder="Île-de-France" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pays *</FormLabel>
                <FormControl>
                  <Input placeholder="France" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Enregistrement..."
              : cabinet
              ? "Mettre à jour"
              : "Créer le cabinet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
