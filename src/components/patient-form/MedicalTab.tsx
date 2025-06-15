import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface MedicalTabProps {
    form: UseFormReturn<PatientFormValues>;
    isChild: boolean;
}

export const MedicalTab = ({ form, isChild }: MedicalTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-4 pt-6">
                {/* Section: Informations Médicales Générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="familyStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Antécédents médicaux
                                    familiaux
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Maladies héréditaires"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="handedness"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Latéralité
                                </FormLabel>
                                <FormControl>
                                    <TranslatedSelect
                                        value={field.value}
                                        onValueChange={
                                            field.onChange
                                        }
                                        enumType="Handedness"
                                        placeholder="Sélectionner une latéralité"
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
                        name="physicalActivity" // Placé avant contraception pour un flux peut-être plus général
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Activité physique
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Activité physique"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contraception"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Contraception
                                </FormLabel>
                                <FormControl>
                                    <TranslatedSelect
                                        value={field.value}
                                        onValueChange={
                                            field.onChange
                                        }
                                        enumType="Contraception"
                                        placeholder="Sélectionner un type de contraception"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* Section: Médecins et Suivis Spécifiques */}
                {/* Médecin généraliste en pleine largeur */}
                <FormField
                    control={form.control}
                    name="generalPractitioner"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Médecin généraliste
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Médecin généraliste"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="ophtalmologistName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Ophtalmologue
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nom de l'ophtalmologue"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hasVisionCorrection"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:mt-[28px]">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Correction de la vision
                                        ?
                                    </FormLabel>
                                    <FormDescription>
                                        Indiquez si le patient a
                                        une correction de la
                                        vision.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={
                                            field.onChange
                                        }
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="entDoctorName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nom du médecin ORL
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nom du médecin ORL"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="entProblems"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Problèmes ORL
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Problèmes ORL"
                                        {...field}
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
                        name="digestiveDoctorName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nom du médecin digestif
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nom du médecin digestif"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="digestiveProblems"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Problèmes digestifs
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Problèmes digestifs"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* Section: Antécédents Médicaux Détaillés (TextAreas en pleine largeur) */}
                <FormField
                    control={form.control}
                    name="surgicalHistory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Antécédents chirurgicaux
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Antécédents chirurgicaux"
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
                    name="traumaHistory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Antécédents de traumatismes
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Antécédents de traumatismes"
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
                    name="rheumatologicalHistory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Antécédents rhumatologiques
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Antécédents rhumatologiques"
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
                    name="fracture_history"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Historique des fractures
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Historique détaillé des fractures"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {!isChild && (
                    <FormField
                        control={form.control}
                        name="gynecological_history"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Antécédents gynéco-urinaires
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Antécédents gynécologiques ou urinaires"
                                        className="resize-none"
                                        {...field}
                                        value={
                                            field.value || ""
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="currentTreatment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Traitement actuel
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Traitement actuel"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
				{/* Nouvelle section : Informations cliniques */}
                <div className="border-t border-gray-200 pt-6 mt-4">
                  <div className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-200">
                    <span role="img" aria-label="medical exam">📝</span>
                    Informations cliniques (consultation)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="medical_examination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Examen médical</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Examen médical/Observations"
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
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnostic</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Diagnostic"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="treatment_plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan de traitement</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Plan de traitement proposé"
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
                      name="consultation_conclusion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conclusion de la consultation</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Synthèse finale"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
            </CardContent>
        </Card>
    );
};
