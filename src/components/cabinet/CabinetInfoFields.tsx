
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
import { Building2, MapPin, Phone, Mail } from "lucide-react";

interface CabinetInfoFieldsProps {
  form: UseFormReturn<CabinetFormValues>;
  isSubmitting: boolean;
}

export function CabinetInfoFields({ form, isSubmitting }: CabinetInfoFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Informations du cabinet
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Nom du Cabinet</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nom du cabinet"
                  disabled={isSubmitting}
                  className="h-11"
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
              <FormLabel className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Adresse</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Adresse complète"
                  disabled={isSubmitting}
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Téléphone</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Numéro de téléphone"
                    disabled={isSubmitting}
                    className="h-11"
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
                <FormLabel className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email (facultatif)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email du cabinet"
                    disabled={isSubmitting}
                    className="h-11"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
