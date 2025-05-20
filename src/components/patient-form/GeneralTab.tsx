
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { DateInput } from "@/components/ui/date-input";
import { WeightHeightBmiFields } from "./WeightHeightBmiFields";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "../patient-form";

interface GeneralTabProps {
    form: UseFormReturn<PatientFormValues>;
    childrenAgesInput: string;
    setChildrenAgesInput: (value: string) => void;
    currentCabinetId: string | null;
    setCurrentCabinetId: (value: string) => void;
}

export const GeneralTab = ({ 
    form, 
    childrenAgesInput, 
    setChildrenAgesInput,
    currentCabinetId,
    setCurrentCabinetId 
}: GeneralTabProps) => {
    return (
        <Card>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Prénom
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Prénom"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Nom
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Nom"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Ajout des champs taille, poids et IMC */}
                <WeightHeightBmiFields form={form} />

                {/* Nouveau champ pour le cabinet */}
                <FormField
                    control={form.control}
                    name="cabinetId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cabinet</FormLabel>
                            <FormDescription>
                                Sélectionnez le cabinet auquel
                                ce patient est rattaché
                            </FormDescription>
                            <FormControl>
                                <TranslatedSelect
                                    value={currentCabinetId}
                                    onValueChange={(value) => {
                                        setCurrentCabinetId(value);
                                        field.onChange(parseInt(value));
                                    }}
                                    enumType="Cabinet"
                                    placeholder="Sélectionner un cabinet"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col space-y-1.5">
                                <FormLabel>
                                    Date de naissance
                                </FormLabel>
                                <FormControl>
                                    <DateInput
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem className="flex flex-col space-y-1.5">
                                <FormLabel>Genre</FormLabel>
                                <FormControl>
                                    <TranslatedSelect
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        enumType="Gender"
                                        placeholder="Sélectionner un genre"
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
                        name="occupation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Profession
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Profession"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="maritalStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Situation maritale
                                </FormLabel>
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
                </div>

                <FormField
                    control={form.control}
                    name="hasChildren"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    A des enfants ?
                                </FormLabel>
                                <FormDescription>
                                    Indiquez si le patient a des
                                    enfants.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {form.getValues("hasChildren") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FormLabel>
                                Âges des enfants (séparés par
                                des virgules)
                            </FormLabel>
                            <Input
                                placeholder="Ex: 2, 5, 8"
                                value={childrenAgesInput}
                                onChange={(e) => {
                                    setChildrenAgesInput(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
