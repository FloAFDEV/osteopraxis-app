import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface MedicalHistoryTabProps {
    form: UseFormReturn<PatientFormValues>;
    isChild: boolean;
}

export const MedicalHistoryTab = ({ form, isChild }: MedicalHistoryTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="medicalHistory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Antécédents médicaux</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Antécédents médicaux généraux"
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
                        name="surgicalHistory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Antécédents chirurgicaux</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Historique des chirurgies"
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
                        name="traumaHistory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Antécédents traumatiques</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Traumatismes subis"
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
                        name="rheumatologicalHistory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Antécédents rhumatologiques</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Antécédents rhumatologiques"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="gynecological_history"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Antécédents gynécologiques</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Antécédents gynécologiques"
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
                                    <FormLabel>Historique de grossesse</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Description grossesse / complications"
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

                {isChild && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Antécédents pédiatriques</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pregnancyHistory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Histoire de la grossesse</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Déroulement de la grossesse"
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
                                name="birthDetails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Détails de la naissance</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Mode d'accouchement, durée, complications..."
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
                            name="developmentMilestones"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Étapes de développement</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Âge pour s'asseoir, marcher, parler..."
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
                    <h3 className="text-lg font-medium">Antécédents spécialisés</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="neurodevelopmental_history"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Antécédents neurodéveloppementaux</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Antécédents neurodéveloppementaux"
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
                            name="cardiac_history"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Antécédents cardiaques</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Antécédents cardiaques"
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
                            name="pulmonary_history"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Antécédents pulmonaires</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Antécédents pulmonaires"
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
                            name="pelvic_history"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Antécédents pelviens</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Antécédents pelviens"
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
                            name="musculoskeletal_history"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Antécédents musculo-squelettiques</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Antécédents musculo-squelettiques"
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
                                    <FormLabel>Historique des fractures</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Historique des fractures"
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
            </CardContent>
        </Card>
    );
};