import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { SmokingHabitsSection } from "./SmokingHabitsSection";

interface MedicalProfileTabProps {
    form: UseFormReturn<PatientFormValues>;
    isChild: boolean;
}

export const MedicalProfileTab = ({ form, isChild }: MedicalProfileTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="generalPractitioner"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Médecin traitant</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nom du médecin traitant" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Allergies</FormLabel>
                                <FormControl>
                                    <Input placeholder="Allergies connues" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="currentTreatment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Traitement en cours</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Traitements médicaux en cours"
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
                        name="currentMedication"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Médicaments actuels</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Médicaments pris actuellement"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {!isChild && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Contraception</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contraception"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraception</FormLabel>
                                        <FormControl>
                                            <TranslatedSelect
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                enumType="Contraception"
                                                placeholder="Type de contraception"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="otherContraception"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Autre contraception</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Autre méthode contraceptive"
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
                            name="contraception_notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes contraception</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Précisions, effets secondaires, etc."
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

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Habitudes de vie</h3>
                    <SmokingHabitsSection form={form} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="alcoholConsumption"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Consommation d'alcool</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Consommation d'alcool"
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
                        name="sportActivity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Activité sportive</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Type d'activité sportive"
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
                        name="physicalActivity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Activité physique</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Type d'activité physique"
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
                                        placeholder="Fréquence de pratique sportive"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Suivi spécialisé</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="ent_followup"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Suivi ORL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Type de suivi ORL"
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
                                        <Input
                                            placeholder="Ex : normal, problème, trouble..."
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
                                        <Input
                                            placeholder="Ex : bonne, mauvaise, trouble..."
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
                                        <Input
                                            placeholder="Ex : problème, douleur, suivi..."
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

                {!isChild && (
                    <FormField
                        control={form.control}
                        name="other_comments_adult"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Autres commentaires</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Autres commentaires médicaux"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </CardContent>
        </Card>
    );
};