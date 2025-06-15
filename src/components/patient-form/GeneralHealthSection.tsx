
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface GeneralHealthSectionProps {
  form: UseFormReturn<PatientFormValues>;
  isChild: boolean;
}

export const GeneralHealthSection = ({
  form,
  isChild,
}: GeneralHealthSectionProps) => (
  <section className="space-y-4 mt-6">
    <FormField
      control={form.control}
      name="ent_followup"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Suivi ORL</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Détails du suivi ORL"
              className="resize-none"
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
      name="intestinal_transit"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Transit intestinal</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Détails sur le transit intestinal"
              className="resize-none"
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
      name="sleep_quality"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Qualité du sommeil</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Détails sur la qualité du sommeil"
              className="resize-none"
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
      name="dental_health"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Santé dentaire</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Détails sur la santé dentaire"
              className="resize-none"
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
      name="sport_frequency"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fréquence sportive</FormLabel>
          <FormControl>
            <Input
              placeholder="Ex: 3 fois par semaine - course, natation"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    {!isChild && (
      <FormField
        control={form.control}
        name="other_comments_adult"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Autres commentaires (adulte)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Autres informations importantes"
                className="resize-none"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )}
  </section>
);
