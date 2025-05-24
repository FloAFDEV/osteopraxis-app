import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface PediatricTabProps {
    form: UseFormReturn<PatientFormValues>;
}

export const PediatricTab = ({ form }: PediatricTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="pediatrician_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Pédiatre
                                </FormLabel>
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

                    <FormField
                        control={form.control}
                        name="school_grade"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Niveau scolaire
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Classe actuelle"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="weight_at_birth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Poids à la naissance (g)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Ex: 3500"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value)
                                            )
                                        }
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
                                <FormLabel>
                                    Taille à la naissance (cm)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Ex: 50"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value)
                                            )
                                        }
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
                                <FormLabel>
                                    Périmètre crânien (cm)
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Ex: 35"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ""
                                                    ? null
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="apgar_score"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Score APGAR
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: 9/10 à 1 min, 10/10 à 5 min"
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
                    name="pregnancyHistory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Histoire de la grossesse
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Déroulement de la grossesse"
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
                    name="birthDetails"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Détails de la naissance
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Mode d'accouchement, durée, complications..."
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
                    name="developmentMilestones"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Étapes de développement
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Âge pour s'asseoir, marcher, parler..."
                                    className="resize-none"
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
                        name="fine_motor_skills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Motricité fine
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Capacités de motricité fine"
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
                                <FormLabel>
                                    Motricité globale
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Capacités de motricité globale"
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

                <FormField
                    control={form.control}
                    name="sleepingPattern"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Habitudes de sommeil
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Qualité du sommeil, réveils nocturnes..."
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
                    name="feeding"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Alimentation
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Habitudes alimentaires, allergies..."
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
                    name="behavior"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Comportement
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Description du comportement en général"
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
                    name="childcare_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Type de garde
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: crèche, nounou, grands-parents..."
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
                    name="paramedical_followup"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Suivi paramédical
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Orthophonie, psychomotricité, ergothérapie..."
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
                            <FormLabel>
                                Autres remarques (enfant)
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Autres informations importantes pour cet enfant"
                                    className="resize-none"
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
    );
};
