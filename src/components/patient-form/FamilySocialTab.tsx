import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";

interface FamilySocialTabProps {
    form: UseFormReturn<PatientFormValues>;
    childrenAgesInput: string;
    setChildrenAgesInput: (value: string) => void;
}

export const FamilySocialTab = ({ form, childrenAgesInput, setChildrenAgesInput }: FamilySocialTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="maritalStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Situation maritale</FormLabel>
                                <FormControl>
                                    <TranslatedSelect
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        enumType="MaritalStatus"
                                        placeholder="Sélectionner une situation maritale"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="familyStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Statut familial</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Précisions sur la situation familiale"
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
                    name="hasChildren"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">A des enfants ?</FormLabel>
                                <FormDescription>
                                    Indiquez si le patient a des enfants.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value === "true"}
                                    onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {form.getValues("hasChildren") === "true" && (
                    <div>
                        <FormLabel>Âges des enfants (séparés par des virgules)</FormLabel>
                        <Input
                            placeholder="Ex: 2, 5, 8"
                            value={childrenAgesInput}
                            onChange={(e) => setChildrenAgesInput(e.target.value)}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profession</FormLabel>
                                <FormControl>
                                    <Input placeholder="Profession" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="job"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Emploi</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Emploi actuel"
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
                        name="relationship_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type de relation</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Type de relation"
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
                        name="relationship_other"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Autres relations</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Autres informations relationnelles"
                                        {...field}
                                        value={field.value || ""}
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