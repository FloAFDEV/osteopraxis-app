
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CabinetFormValues } from "./types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CabinetInfoFieldsProps {
  form: UseFormReturn<CabinetFormValues>;
  isSubmitting: boolean;
}

export function CabinetInfoFields({ form, isSubmitting }: CabinetInfoFieldsProps) {
  return (
    <div className="border-b pb-4 mb-2">
      <h3 className="text-lg font-medium mb-4">Informations du cabinet</h3>
      
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
    </div>
  );
}
