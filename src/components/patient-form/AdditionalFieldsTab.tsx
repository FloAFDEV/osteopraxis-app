
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "../patient-form";
import { Input } from "@/components/ui/input";

interface AdditionalFieldsTabProps {
  form: UseFormReturn<PatientFormValues>;
  isChild: boolean;
}

export const AdditionalFieldsTab = ({ form, isChild }: AdditionalFieldsTabProps) => {
  return (
    <>
      {/* Champs communs pour tous les patients */}
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
                value={field.value || ''}
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
                value={field.value || ''}
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
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fracture_history"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Historique des fractures</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Historique détaillé des fractures"
                className="resize-none"
                {...field}
                value={field.value || ''}
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
                value={field.value || ''}
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
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Champ gynécologique uniquement pour les adultes */}
      {!isChild && (
        <FormField
          control={form.control}
          name="gynecological_history"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antécédents gynéco-urinaires</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Antécédents gynécologiques ou urinaires"
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Champ "autres commentaires" selon si c'est un adulte ou un enfant */}
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
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
