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
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ville</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ville de résidence"
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
                        name="postalCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code postal</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Code postal"
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
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pays</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Pays de résidence"
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
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email personnel</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="email@exemple.com"
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
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Numéro de téléphone"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                        Relations familiales
                    </h3>
                    <div className="text-sm text-muted-foreground mb-4">
                        Les relations familiales sont gérées dans un onglet dédié une fois le patient créé.
                        Vous pourrez alors lier ce patient à d'autres membres de sa famille.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};