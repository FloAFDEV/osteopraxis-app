import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UseFormReturn } from "react-hook-form";
import { PatientFormValues } from "./types";
import { useState, useEffect } from "react";
import { Cabinet, Patient } from "@/types";
import { useCabinets } from "@/hooks/useCabinets";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, Hospital, Users, Briefcase, ChevronDown, CheckCircle2 } from "lucide-react";
import { PatientPhotoUpload } from "@/components/patients/PatientPhotoUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface UnifiedIdentityTabProps {
	form: UseFormReturn<PatientFormValues>;
	selectedCabinetId?: number | null;
	childrenAgesInput: string;
	setChildrenAgesInput: (value: string) => void;
	patient?: Patient | null;
}

export const UnifiedIdentityTab = ({
	form,
	selectedCabinetId,
	childrenAgesInput,
	setChildrenAgesInput,
	patient,
}: UnifiedIdentityTabProps) => {
	const { data: availableCabinets = [], isLoading: cabinetsLoading } =
		useCabinets();
	const [showOptionalFields, setShowOptionalFields] = useState(!!patient);

	useEffect(() => {
		// UX intelligente pour cabinet unique
		if (availableCabinets && availableCabinets.length === 1) {
			// Cabinet unique : sélection automatique
			form.setValue("cabinetId", availableCabinets[0].id);
		} else if (selectedCabinetId && !form.getValues("cabinetId")) {
			// Cabinet présélectionné
			form.setValue("cabinetId", selectedCabinetId);
		}
	}, [availableCabinets, selectedCabinetId, form]);

	return (
		<Card>
			<CardContent className="space-y-6 mt-6">
				{/* Message de rassurance - Création rapide */}
				{!patient && (
					<Alert className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
						<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
						<AlertDescription className="text-sm text-emerald-800 dark:text-emerald-200">
							<strong>Création rapide</strong> — Seuls le nom et le prénom sont requis.
							Vous pourrez compléter la fiche plus tard.
						</AlertDescription>
					</Alert>
				)}

				{/* Section 1: Champs obligatoires (Nom + Prénom) */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">
							Informations essentielles
						</CardTitle>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Prénom
										<span className="text-red-500 ml-1">
											*
										</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Prénom du patient"
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
										Nom de famille
										<span className="text-red-500 ml-1">
											*
										</span>
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Nom de famille"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				{/* Section optionnelle - Collapsible */}
				<Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
					<CollapsibleTrigger asChild>
						<button
							type="button"
							className="flex items-center justify-between w-full p-4 rounded-lg border border-dashed hover:border-primary/50 hover:bg-muted/30 transition-colors"
						>
							<span className="text-sm font-medium text-muted-foreground">
								{showOptionalFields ? "Masquer les informations complémentaires" : "Ajouter des informations complémentaires (optionnel)"}
							</span>
							<ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showOptionalFields ? "rotate-180" : ""}`} />
						</button>
					</CollapsibleTrigger>

					<CollapsibleContent className="space-y-6 mt-4">
						{/* Photo patient */}
						{patient && patient.id ? (
							<PatientPhotoUpload
								patientId={patient.id}
								patientName={`${patient.firstName} ${patient.lastName}`}
							/>
						) : (
							<Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
								<Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								<AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
									<strong>Photo de profil</strong> — Vous pourrez
									ajouter une photo après la création du patient.
								</AlertDescription>
							</Alert>
						)}

						{/* Genre et date de naissance */}
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
												onChange={(e) =>
													field.onChange(
														e.target.value || null,
													)
												}
												placeholder="JJ/MM/AAAA"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

				{/* Section 2: Adresse et contact */}
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<MapPin className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">
							Adresse et contact
						</CardTitle>
					</div>

					<FormField
						control={form.control}
						name="address"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Adresse personnelle</FormLabel>
								<FormControl>
									<Input
										placeholder="Numéro, rue, complément d'adresse"
										{...field}
									/>
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
											placeholder="75001"
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
							name="country"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Pays</FormLabel>
									<FormControl>
										<Input
											placeholder="France"
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
						<Hospital className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">
							Cabinet médical
						</CardTitle>
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
											value={
												field.value?.toString() || ""
											}
											onValueChange={(value) =>
												field.onChange(
													value
														? parseInt(value)
														: null,
												)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionner un cabinet" />
											</SelectTrigger>
											<SelectContent>
												{availableCabinets.map(
													(cabinet) => (
														<SelectItem
															key={cabinet.id}
															value={cabinet.id.toString()}
														>
															{cabinet.name}
															{cabinet.address && (
																<span className="text-sm text-muted-foreground ml-2">
																	-{" "}
																	{
																		cabinet.address
																	}
																</span>
															)}
														</SelectItem>
													),
												)}
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
									<p className="font-medium">
										{availableCabinets[0].name}
									</p>
									{availableCabinets[0].address && (
										<p className="text-sm text-muted-foreground">
											{availableCabinets[0].address}
										</p>
									)}
								</div>
								<div className="text-sm text-muted-foreground bg-primary/10 px-2 py-1 rounded">
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
						<Users className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">
							Situation familiale
						</CardTitle>
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
									<FormLabel className="text-base">
										A des enfants ?
									</FormLabel>
									<FormDescription>
										Indiquez si le patient a des enfants.
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value === "true"}
										onCheckedChange={(checked) =>
											field.onChange(
												checked ? "true" : "false",
											)
										}
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
									onChange={(e) =>
										setChildrenAgesInput(e.target.value)
									}
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
						<Briefcase className="h-5 w-5 text-primary" />
						<CardTitle className="text-lg">
							Profession et emploi
						</CardTitle>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="occupation"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Profession</FormLabel>
									<FormControl>
										<Input
											placeholder="Médecin, ingénieur, étudiant..."
											{...field}
										/>
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
					</CollapsibleContent>
				</Collapsible>
			</CardContent>
		</Card>
	);
};
