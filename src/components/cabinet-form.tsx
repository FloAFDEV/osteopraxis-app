
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { toast } from "sonner";

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

const cabinetFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  address: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères",
  }),
  phone: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  osteopathId: z.number(),
});

type CabinetFormValues = z.infer<typeof cabinetFormSchema>;

interface CabinetFormProps {
  defaultValues?: Partial<CabinetFormValues>;
  cabinetId?: number;
  isEditing?: boolean;
  osteopathId: number;
}

export function CabinetForm({
  defaultValues,
  cabinetId,
  isEditing = false,
  osteopathId,
}: CabinetFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CabinetFormValues>({
    resolver: zodResolver(cabinetFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      address: defaultValues?.address || "",
      phone: defaultValues?.phone || "",
      email: defaultValues?.email || "",
      osteopathId: defaultValues?.osteopathId || osteopathId,
    },
  });

  const onSubmit = async (data: CabinetFormValues) => {
    try {
      setIsSubmitting(true);
      
      const cabinetData = {
        name: data.name,
        address: data.address,
        phone: data.phone || null,
        email: data.email || null,
        osteopathId: data.osteopathId,
      };
      
      if (isEditing && cabinetId) {
        // Update existing cabinet
        await api.updateCabinet(cabinetId, cabinetData);
        toast.success("Cabinet mis à jour avec succès");
      } else {
        // Create new cabinet
        await api.createCabinet(cabinetData as Omit<Cabinet, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success("Cabinet créé avec succès");
      }
      
      navigate("/settings");
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

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
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
