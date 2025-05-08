
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/types";
import { convertHasChildrenToBoolean } from "@/utils/patient-form-helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

// Schéma de validation pour le formulaire patient
const getPatientSchema = (emailRequired: boolean) => z.object({
	address: z.string().optional(),
	email: emailRequired 
		? z.string().email("Email invalide").min(1, "Email requis")
		: z.string().email("Email invalide").optional().nullable(),
	phone: z.string().optional().nullable(),
	notes: z.string().optional().nullable(),
	birthDate: z.date().optional().nullable(),
	childrenAges: z.array(z.number()).optional().nullable(),
	firstName: z.string().min(1, "Prénom requis"),
	lastName: z.string().min(1, "Nom requis"),
	gender: z.string().optional().nullable(),
	hasChildren: z.boolean().optional().nullable(),
	occupation: z.string().optional().nullable(),
	maritalStatus: z.string().optional().nullable(),
	contraception: z.string().optional().nullable(),
	physicalActivity: z.string().optional().nullable(),
	isSmoker: z.boolean().optional().nullable(),
	isExSmoker: z.boolean().optional().nullable(),
	smokingSince: z.string().optional().nullable(),
	smokingAmount: z.string().optional().nullable(),
	quitSmokingDate: z.string().optional().nullable(),
	generalPractitioner: z.string().optional().nullable(),
	ophtalmologistName: z.string().optional().nullable(),
	hasVisionCorrection: z.boolean().optional().nullable(),
	entDoctorName: z.string().optional().nullable(),
	entProblems: z.string().optional().nullable(),
	digestiveDoctorName: z.string().optional().nullable(),
	digestiveProblems: z.string().optional().nullable(),
	surgicalHistory: z.string().optional().nullable(),
	traumaHistory: z.string().optional().nullable(),
	rheumatologicalHistory: z.string().optional().nullable(),
	currentTreatment: z.string().optional().nullable(),
	handedness: z.string().optional().nullable(),
	familyStatus: z.string().optional().nullable(),
});

// Utiliser le schéma avec emailRequired à false pour type PatientFormValues
export type PatientFormValues = z.infer<ReturnType<typeof getPatientSchema>>;
interface PatientFormProps {
	patient?: Patient;
	onSave: (patient: PatientFormValues) => Promise<void>;
	isLoading?: boolean;
	emailRequired?: boolean; // Ajout de la prop emailRequired comme optionnelle
}
export function PatientForm({
	patient,
	onSave,
	isLoading = false,
	emailRequired = true, // Valeur par défaut à true pour maintenir le comportement existant
}: PatientFormProps) {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("general");
	const [childrenCount, setChildrenCount] = useState<number>(0);
	const [childrenAgesInput, setChildrenAgesInput] = useState<string>("");

	// Initialiser le form avec les valeurs existantes ou valeurs par défaut
	const form = useForm<PatientFormValues>({
		resolver: zodResolver(getPatientSchema(emailRequired)),
		defaultValues: patient
			? {
					...patient,
					// Convertir hasChildren de string à boolean si nécessaire
					hasChildren: convertHasChildrenToBoolean(
						patient.hasChildren
					),
					// Assurer que birthDate est un objet Date s'il existe
					birthDate: patient.birthDate
						? typeof patient.birthDate === "string"
							? new Date(patient.birthDate)
							: patient.birthDate
						: null,
					// S'assurer que les valeurs null sont correctement gérées
					email: patient.email || "",
					phone: patient.phone || "",
					address: patient.address || "",
					occupation: patient.occupation || "",
					physicalActivity: patient.physicalActivity || "",
					generalPractitioner: patient.generalPractitioner || "",
					ophtalmologistName: patient.ophtalmologistName || "",
					entDoctorName: patient.entDoctorName || "",
					entProblems: patient.entProblems || "",
					digestiveDoctorName: patient.digestiveDoctorName || "",
					digestiveProblems: patient.digestiveProblems || "",
					surgicalHistory: patient.surgicalHistory || "",
					traumaHistory: patient.traumaHistory || "",
					rheumatologicalHistory:
						patient.rheumatologicalHistory || "",
					currentTreatment: patient.currentTreatment || "",
					// Nouveaux champs pour le tabagisme
					isExSmoker: false,
					smokingSince: "",
					smokingAmount: "",
					quitSmokingDate: "",
			  }
			: {
					firstName: "",
					lastName: "",
					hasChildren: false,
					isSmoker: false,
					isExSmoker: false,
					hasVisionCorrection: false,
					email: "",
					phone: "",
					smokingSince: "",
					smokingAmount: "",
					quitSmokingDate: "",
			  },
	});

	useEffect(() => {
		// Mettre à jour le nombre d'enfants et les âges lors du chargement du patient
		if (patient && patient.childrenAges) {
			setChildrenCount(patient.childrenAges.length);
			setChildrenAgesInput(patient.childrenAges.join(", "));
		}
	}, [patient]);

	const handleSubmit = async (values: PatientFormValues) => {
		try {
			// Convertir la chaîne d'âges des enfants en tableau de nombres
			let childrenAgesArray: number[] | null = null;
			if (values.hasChildren && childrenAgesInput) {
				childrenAgesArray = childrenAgesInput
					.split(",")
					.map((age) => parseInt(age.trim(), 10))
					.filter((age) => !isNaN(age)); // Filtrer les valeurs non numériques
			} else {
				childrenAgesArray = [];
			}

			// Préparer les données à enregistrer
			const patientData: PatientFormValues = {
				...values,
				childrenAges: childrenAgesArray,
				hasChildren: values.hasChildren,
			};

			// Appeler la fonction de sauvegarde
			await onSave(patientData);

			// Naviguer vers la liste des patients après la sauvegarde réussie
			navigate("/patients");
			toast.success("✅  Patient enregistré avec succès !");
		} catch (error) {
			console.error("⛔ rreur lors de l'enregistrement du patient:", error);
			toast.error(
				"⛔ Erreur lors de l'enregistrement du patient. Veuillez réessayer."
			);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-6"
			>
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full space-y-4"
				>
					<TabsList>
						<TabsTrigger value="general">Général</TabsTrigger>
						<TabsTrigger value="medical">Médical</TabsTrigger>
						<TabsTrigger value="contact">Contact</TabsTrigger>
					</TabsList>
					<TabsContent value="general" className="space-y-4">
						<Card>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="birthDate"
										render={({ field }) => (
											<FormItem className="flex flex-col space-y-1.5">
												<FormLabel>Date de naissance</FormLabel>
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
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Sélectionner un genre" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="Homme">
															Homme
														</SelectItem>
														<SelectItem value="Femme">
															Femme
														</SelectItem>
														<SelectItem value="Autre">
															Autre
														</SelectItem>
													</SelectContent>
												</Select>
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
												<FormLabel>Profession</FormLabel>
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
												<FormLabel>Situation maritale</FormLabel>
												<FormControl>
													<Input
														placeholder="Situation maritale"
														{...field}
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
										name="familyStatus"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Situation familiale
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Situation familiale"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="handedness"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Latéralité (droitier, gaucher...)
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Latéralité"
														{...field}
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
													onCheckedChange={
														field.onChange
													}
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
													setChildrenAgesInput(
														e.target.value
													);
												}}
											/>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="medical" className="space-y-4">
						<Card>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="contraception"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Contraception
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Contraception"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="physicalActivity"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Activité physique
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Activité physique"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								{/* Section Tabagisme */}
								<div className="border p-4 rounded-lg space-y-4">
									<h3 className="font-medium text-lg">Habitudes tabagiques</h3>
									<div className="grid grid-cols-1 gap-4">
										<FormField
											control={form.control}
											name="isSmoker"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">
															Fumeur ?
														</FormLabel>
														<FormDescription>
															Indiquez si le patient
															fume actuellement.
														</FormDescription>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={(checked) => {
																field.onChange(checked);
																if (checked) {
																	form.setValue("isExSmoker", false);
																}
															}}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										{form.watch("isSmoker") && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
												<FormField
													control={form.control}
													name="smokingSince"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Depuis quand ?</FormLabel>
															<FormControl>
																<Input
																	placeholder="Ex: 2010, depuis 5 ans..."
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="smokingAmount"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Quantité</FormLabel>
															<FormControl>
																<Input
																	placeholder="Ex: 10 cigarettes/jour"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										)}

										<FormField
											control={form.control}
											name="isExSmoker"
											render={({ field }) => (
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
													<div className="space-y-0.5">
														<FormLabel className="text-base">
															Ex-fumeur ?
														</FormLabel>
														<FormDescription>
															Indiquez si le patient
															a arrêté de fumer.
														</FormDescription>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={(checked) => {
																field.onChange(checked);
																if (checked) {
																	form.setValue("isSmoker", false);
																}
															}}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										{form.watch("isExSmoker") && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
												<FormField
													control={form.control}
													name="quitSmokingDate"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Arrêt depuis</FormLabel>
															<FormControl>
																<Input
																	placeholder="Ex: 2018, depuis 3 ans..."
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="smokingAmount"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Quantité avant arrêt</FormLabel>
															<FormControl>
																<Input
																	placeholder="Ex: 15 cigarettes/jour"
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="generalPractitioner"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Médecin généraliste
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Médecin généraliste"
														{...field}
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
										name="ophtalmologistName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Ophtalmologue
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Nom de
														l'ophtalmologue"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="hasVisionCorrection"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
												<div className="space-y-0.5">
													<FormLabel className="text-base">
														Correction de la vision
														?
													</FormLabel>
													<FormDescription>
														Indiquez si le patient a
														une correction de la
														vision.
													</FormDescription>
												</div>
												<FormControl>
													<Switch
														checked={field.value}
														onCheckedChange={
															field.onChange
														}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="entDoctorName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Nom du médecin ORL
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Nom du médecin ORL"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="entProblems"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Problèmes ORL
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Problèmes ORL"
														{...field}
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
										name="digestiveDoctorName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Nom du médecin digestif
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Nom du médecin digestif"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="digestiveProblems"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													Problèmes digestifs
												</FormLabel>
												<FormControl>
													<Input
														placeholder="Problèmes digestifs"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="surgicalHistory"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Antécédents chirurgicaux
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Antécédents chirurgicaux"
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
									name="traumaHistory"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Antécédents de traumatismes
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Antécédents de traumatismes"
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
									name="rheumatologicalHistory"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Antécédents rhumatologiques
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Antécédents rhumatologiques"
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
									name="currentTreatment"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Traitement actuel
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Traitement actuel"
													className="resize-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="contact" className="space-y-4">
						<Card>
							<CardContent className="space-y-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Email
												{emailRequired && (
													<span className="text-red-500">
														*
													</span>
												)}
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Email"
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
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Téléphone</FormLabel>
											<FormControl>
												<Input
													placeholder="Téléphone"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Adresse</FormLabel>
											<FormControl>
												<Input
													placeholder="Adresse"
													{...field}
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
													placeholder="Notes"
													className="resize-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<CardFooter className="flex justify-between">
					<Button variant="outline" onClick={() => navigate("/patients")}>
						Annuler
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Enregistrement..." : "Enregistrer"}
					</Button>
				</CardFooter>
			</form>
		</Form>
	);
}
