import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CabinetFormValues } from "./types";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
interface BillingInfoFieldsProps {
  form: UseFormReturn<CabinetFormValues>;
  isSubmitting: boolean;
}
export function BillingInfoFields({
  form,
  isSubmitting
}: BillingInfoFieldsProps) {
  return <div className="border-b pb-4 mb-2">
      <h3 className="text-lg font-medium mb-4">Informations de facturation</h3>
      
      <FormField control={form.control} name="siret" render={({
      field
    }) => <FormItem>
            <FormLabel>Numéro SIRET</FormLabel>
            <FormControl>
              <Input placeholder="Numéro SIRET" disabled={isSubmitting} {...field} value={field.value || ""} />
            </FormControl>
            <FormDescription className="">
              Numéro SIRET nécessaire pour la facturation
            </FormDescription>
            <FormMessage />
          </FormItem>} />
      
      <FormField control={form.control} name="rppsNumber" render={({
      field
    }) => <FormItem className="pt-4">
            <FormLabel>Numéro RPPS</FormLabel>
            <FormControl>
              <Input placeholder="Numéro RPPS" disabled={isSubmitting} {...field} value={field.value || ""} />
            </FormControl>
            <FormDescription>
              Numéro RPPS (Répertoire Partagé des Professionnels de Santé) nécessaire pour la facturation
            </FormDescription>
            <FormMessage />
          </FormItem>} />
      
      <FormField control={form.control} name="apeCode" render={({
      field
    }) => <FormItem className="pt-4">
            <FormLabel>Code APE</FormLabel>
            <FormControl>
              <Input placeholder="Code APE (par défaut: 8690F)" disabled={isSubmitting} {...field} value={field.value || "8690F"} />
            </FormControl>
            <FormDescription>
              Code APE/NAF de votre activité (par défaut: 8690F pour les activités de santé humaine)
            </FormDescription>
            <FormMessage />
          </FormItem>} />
    </div>;
}