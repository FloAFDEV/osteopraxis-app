
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";

interface AdditionalFieldsTabProps {
  isChild: boolean;
}

export function AdditionalFieldsTab({ isChild }: AdditionalFieldsTabProps) {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h3 className="font-medium text-lg mb-4">
            Informations médicales complémentaires
          </h3>

          {/* Champs communs généraux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Informations sur le transit intestinal"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="fracture_history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antécédents de fractures</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Détails des fractures passées"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dental_health"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Santé dentaire</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations sur la santé dentaire"
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
                    <Textarea
                      placeholder="Ex: 3 fois par semaine, course à pied et natation"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Champs pour adultes uniquement */}
          {!isChild && (
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="gynecological_history"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antécédents gynécologiques</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détails des antécédents gynécologiques"
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
                name="other_comments_adult"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autres commentaires</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes supplémentaires pour ce patient"
                        className="resize-none h-32"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Champs spécifiques aux enfants */}
      {isChild && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h3 className="font-medium text-lg mb-4">
              Informations médicales pédiatriques
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="weight_at_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poids à la naissance (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 3500"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height_at_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taille à la naissance (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 50"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="head_circumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Périmètre crânien (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 35"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="apgar_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score APGAR</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 9/10"
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
                name="pediatrician_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pédiatre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom du pédiatre"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fine_motor_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motricité fine</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détails sur la motricité fine"
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
                name="gross_motor_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motricité globale</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détails sur la motricité globale"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="childcare_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de garde</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Crèche, assistante maternelle..."
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
                name="school_grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau scolaire</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: CP, 6ème..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paramedical_followup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suivis paramédicaux</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Orthophonie, psychomotricité..."
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
              name="other_comments_child"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autres commentaires</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes supplémentaires pour cet enfant"
                      className="resize-none h-32"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
