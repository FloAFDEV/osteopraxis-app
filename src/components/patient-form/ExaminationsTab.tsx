
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "../patient-form";
import { WeightHeightBmiFields } from "./WeightHeightBmiFields";

interface ExaminationsTabProps {
    form: UseFormReturn<PatientFormValues>;
}

export const ExaminationsTab = ({ form }: ExaminationsTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-4 mt-6">
                {/* Add the Weight, Height and BMI fields at the top of the tab */}
                <WeightHeightBmiFields form={form} />
                
                <FormField
                    control={form.control}
                    name="complementaryExams"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Examens complémentaires
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Détails des examens complémentaires (radiographies, échographies...)"
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
                    name="generalSymptoms"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Symptômes généraux
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Description des symptômes généraux"
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
