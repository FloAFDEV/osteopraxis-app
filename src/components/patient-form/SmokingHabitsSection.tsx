
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface SmokingHabitsSectionProps {
  form: UseFormReturn<PatientFormValues>;
}

export const SmokingHabitsSection = ({ form }: SmokingHabitsSectionProps) => {
  const isSmoker = form.watch("isSmoker");
  const isExSmoker = form.watch("isExSmoker");

  return (
    <section>
      <h3 className="font-medium text-lg mb-2">Habitudes tabagiques</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="isSmoker"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Fumeur ?
                </FormLabel>
                <FormDescription>
                  Indiquez si le patient fume actuellement.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={checked => {
                    field.onChange(checked);
                    if (checked) form.setValue("isExSmoker", false);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {isSmoker && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
            <FormField
              control={form.control}
              name="smokingSince"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depuis quand ?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 2010, depuis 5 ans..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smokingAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 10 cigarettes/jour"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <FormField
          control={form.control}
          name="isExSmoker"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Ex-fumeur ?
                </FormLabel>
                <FormDescription>
                  Indiquez si le patient a arrêté de fumer.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={checked => {
                    field.onChange(checked);
                    if (checked) form.setValue("isSmoker", false);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {isExSmoker && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
            <FormField
              control={form.control}
              name="quitSmokingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrêt depuis</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 2018, depuis 3 ans..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smokingAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité avant arrêt</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 15 cigarettes/jour"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </section>
  );
};
