import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { Separator } from "@/components/ui/separator";

interface UnifiedIdentityTabProps {
    form: UseFormReturn<PatientFormValues>;
    selectedCabinetId?: number | null;
    childrenAgesInput: string;
    setChildrenAgesInput: (value: string) => void;
}

export const UnifiedIdentityTab = ({ 
    form, 
    selectedCabinetId, 
    childrenAgesInput, 
    setChildrenAgesInput 
}: UnifiedIdentityTabProps) => {
    const [availableCabinets, setAvailableCabinets] = useState<Cabinet[]>([]);

    useEffect(() => {
        const loadCabinets = async () => {
            try {
                const cabinets = await api.getCabinets();
                setAvailableCabinets(cabinets || []);
                
                // UX intelligente pour cabinet unique
                if (cabinets && cabinets.length === 1) {
                    // Cabinet unique : sélection automatique
                    form.setValue("cabinetId", cabinets[0].id);
                } else if (selectedCabinetId && !form.getValues("cabinetId")) {
                    // Cabinet présélectionné
                    form.setValue("cabinetId", selectedCabinetId);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des cabinets:", error);
            }
        };
        loadCabinets();
    }, [selectedCabinetId, form]);

    return (
        <Card>
            <CardContent className="space-y-6 mt-6">
                {/* Section 1: Informations personnelles */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">👤 Informations personnelles</CardTitle>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Prénom
                                        <span className="text-red-500 ml-1">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Prénom du patient" {...field} />
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
                                        Nom de famille
                                        <span className="text-red-500 ml-1">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom de famille" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Genre</FormLabel>
                                    <FormControl>
                                        <TranslatedSelect
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            enumType="Gender"
                                            placeholder="Sélectionner le genre"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date de naissance</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            value={field.value || ""}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                            placeholder="JJ/MM/AAAA"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Separator />

                {/* Section 2: Adresse et contact */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">📍 Adresse et contact</CardTitle>
                    </div>

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adresse personnelle</FormLabel>
                                <FormControl>
                                    <Input placeholder="Numéro, rue, complément d'adresse" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ville</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ville de résidence" {...field} value={field.value || ""} />
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
                                        <Input placeholder="75001" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pays</FormLabel>
                                    <FormControl>
                                        <Input placeholder="France" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Téléphone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="06 12 34 56 78"
                                            {...field}
                                            value={field.value || ""}
                                            pattern="^[0-9+\s\-\(\)]*$"
                                            title="Entrez un numéro de téléphone valide"
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
                                            placeholder="patient@exemple.com"
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

                <Separator />

                {/* Section 3: Cabinet */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">🏥 Cabinet médical</CardTitle>
                    </div>

                    {availableCabinets.length > 1 ? (
                        <FormField
                            control={form.control}
                            name="cabinetId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom du cabinet</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value?.toString() || ""}
                                            onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un cabinet" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableCabinets.map((cabinet) => (
                                                    <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                                                        {cabinet.name}
                                                        {cabinet.address && (
                                                            <span className="text-sm text-muted-foreground ml-2">
                                                                - {cabinet.address}
                                                            </span>
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : availableCabinets.length === 1 ? (
                        <div className="space-y-2">
                            <FormLabel>Cabinet</FormLabel>
                            <div className="flex items-center p-3 border border-input bg-accent/20 rounded-md">
                                <div className="flex-1">
                                    <p className="font-medium">{availableCabinets[0].name}</p>
                                    {availableCabinets[0].address && (
                                        <p className="text-sm text-muted-foreground">
                                            {availableCabinets[0].address}
                                        </p>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                                    Cabinet unique
                                </div>
                            </div>
                            {/* Hidden field pour la valeur */}
                            <FormField
                                control={form.control}
                                name="cabinetId"
                                render={({ field }) => (
                                    <input 
                                        type="hidden" 
                                        {...field} 
                                        value={availableCabinets[0].id} 
                                    />
                                )}
                            />
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md">
                            Aucun cabinet disponible
                        </div>
                    )}
                </div>

                <Separator />

                {/* Section 4: Situation familiale */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">👨‍👩‍👧‍👦 Situation familiale</CardTitle>
                    </div>

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
                                            placeholder="Célibataire, marié(e), etc."
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
                                            rows={2}
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
                        <FormItem>
                            <FormLabel>Âges des enfants</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: 2, 5, 8 (séparés par des virgules)"
                                    value={childrenAgesInput}
                                    onChange={(e) => setChildrenAgesInput(e.target.value)}
                                />
                            </FormControl>
                            <FormDescription>
                                Séparez les âges par des virgules
                            </FormDescription>
                        </FormItem>
                    )}
                </div>

                <Separator />

                {/* Section 5: Profession et emploi */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">💼 Profession et emploi</CardTitle>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="occupation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profession</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Médecin, ingénieur, étudiant..." {...field} />
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
                                    <FormLabel>Emploi actuel</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nom de l'entreprise ou poste spécifique"
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