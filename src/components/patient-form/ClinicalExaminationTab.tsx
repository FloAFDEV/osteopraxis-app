import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface ClinicalExaminationTabProps {
    form: UseFormReturn<PatientFormValues>;
}

export const ClinicalExaminationTab = ({ form }: ClinicalExaminationTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-6 mt-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">Examens de consultation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="complementaryExams"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Examens complémentaires</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Examens complémentaires effectués"
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
                            name="generalSymptoms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Symptômes généraux</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Symptômes généraux observés"
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

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">Évaluation clinique</h3>
                    <FormField
                        control={form.control}
                        name="medical_examination"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Examen médical</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Résultats de l'examen médical"
                                        {...field}
                                        value={field.value || ""}
                                        rows={4}
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
                                        placeholder="Diagnostic établi"
                                        {...field}
                                        value={field.value || ""}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">Plan de traitement</h3>
                    <FormField
                        control={form.control}
                        name="treatment_plan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plan de traitement</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Plan de traitement proposé"
                                        {...field}
                                        value={field.value || ""}
                                        rows={4}
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
                                <FormLabel>Conclusion de consultation</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Conclusion de la consultation"
                                        {...field}
                                        value={field.value || ""}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Notes additionnelles"
                                        {...field}
                                        value={field.value || ""}
                                        rows={3}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
};