import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import getPatientSchema from "@/utils/patient-form-helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UnifiedIdentityTab } from "./patient-form/UnifiedIdentityTab";
import { MedicalProfileTab } from "./patient-form/MedicalProfileTab";
import { MedicalHistoryTab } from "./patient-form/MedicalHistoryTab";
import { ClinicalExaminationTab } from "./patient-form/ClinicalExaminationTab";
import { SpecializedSpheresTab } from "./patient-form/SpecializedSpheresTab";
import { PediatricSpecializedTab } from "./patient-form/PediatricSpecializedTab";
import { SupplementaryTab } from "./patient-form/SupplementaryTab";
import { WeightTrackingTab } from "./patient-form/WeightTrackingTab";
import { PatientRelationshipsTab } from "./patient-form/PatientRelationshipsTab";
import { PatientFormProps, PatientFormValues } from "./patient-form/types";
import { api } from "@/services/api";
import { Patient } from "@/types";
import {
	User,
	Hospital,
	ClipboardList,
	Microscope,
	Stethoscope,
	Baby,
	FileText,
	TrendingUp,
	Users,
} from "lucide-react";
import { appIcons } from "@/components/ui/app-icons";

export function PatientForm({
	patient,
	onSubmit,
	onSave,
	emailRequired = false, // Par défaut, email n'est pas obligatoire
	selectedCabinetId,
	isLoading = false,
}: PatientFormProps) {
	const [activeTab, setActiveTab] = useState("identity");
	const [childrenAgesInput, setChildrenAgesInput] = useState(
		patient?.childrenAges ? patient.childrenAges.join(", ") : "",
	);
	const [currentCabinetId, setCurrentCabinetId] = useState<string | null>(
		selectedCabinetId ? selectedCabinetId.toString() : null,
	);
	const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);

	// Charger la liste des patients pour les relations familiales
	useEffect(() => {
		const loadPatients = async () => {
			try {
				const patients = await api.getPatients();
				setAvailablePatients(patients);
			} catch (error) {
				console.error("Erreur lors du chargement des patients:", error);
			}
		};
		loadPatients();
	}, []);

	// Calcul de l'âge pour déterminer si c'est un enfant
	const calculateAge = (birthDate: string | null) => {
		if (!birthDate) return null;
		const today = new Date();
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birth.getDate())
		) {
			age--;
		}
		return age;
	};

	const isChild = patient
		? calculateAge(patient.birthDate) !== null &&
			calculateAge(patient.birthDate)! < 18
		: false;

	const form = useForm<PatientFormValues>({
		resolver: zodResolver(getPatientSchema(emailRequired)),
		defaultValues: {
			// Informations de base
			firstName: patient?.firstName || "",
			lastName: patient?.lastName || "",
			email: patient?.email || "",
			phone: patient?.phone || "",
			// Convertir la date en string pour le formulaire
			birthDate: patient?.birthDate
				? new Date(patient.birthDate).toISOString().split("T")[0]
				: null,
			address: patient?.address || "",
			city: (patient as any)?.city || "",
			postalCode: (patient as any)?.postalCode || "",
			country: (patient as any)?.country || "",

			// Informations personnelles
			gender: patient?.gender || null,
			height: patient?.height || null,
			weight: patient?.weight || null,
			bmi: patient?.bmi || null,
			cabinetId: patient?.cabinetId || selectedCabinetId || null,
			maritalStatus: patient?.maritalStatus || null,
			occupation: patient?.occupation || null,
			job: patient?.occupation || null, // Mapper occupation vers job pour le formulaire
			hasChildren: patient?.hasChildren || null,
			childrenAges: patient?.childrenAges || null,

			// Médecins et santé
			generalPractitioner: patient?.generalPractitioner || null,
			surgicalHistory: patient?.surgicalHistory || null,
			traumaHistory: patient?.traumaHistory || null,
			rheumatologicalHistory: patient?.rheumatologicalHistory || null,
			currentTreatment: patient?.currentTreatment || null,
			handedness: patient?.handedness || null,
			hasVisionCorrection: patient?.hasVisionCorrection || false,
			ophtalmologistName: patient?.ophtalmologistName || null,
			entProblems: patient?.entProblems || null,
			entDoctorName: patient?.entDoctorName || null,
			digestiveProblems: patient?.digestiveProblems || null,
			digestiveDoctorName: patient?.digestiveDoctorName || null,
			physicalActivity: patient?.physicalActivity || null,

			// Tabagisme - utiliser les bonnes propriétés
			isSmoker: patient?.isSmoker || false,
			isExSmoker: patient?.isExSmoker || false,
			smokingSince: patient?.smokingSince || null,
			smokingAmount: patient?.smokingAmount || null,
			quitSmokingDate: patient?.quitSmokingDate || null,

			// Contraception et statut familial
			contraception: patient?.contraception || null,
			contraception_notes: patient?.contraception_notes || null,
			relationship_type: patient?.relationship_type || null,
			relationship_other: patient?.relationship_other || null,
			familyStatus: patient?.familyStatus || null,

			// Examens et symptômes
			complementaryExams: patient?.complementaryExams || null,
			generalSymptoms: patient?.generalSymptoms || null,
			allergies:
				patient?.allergies && patient.allergies !== "NULL"
					? patient.allergies
					: "",

			// Historique de grossesse et développement (enfants)
			pregnancyHistory: patient?.pregnancyHistory || null,
			birthDetails: patient?.birthDetails || null,
			developmentMilestones: patient?.developmentMilestones || null,
			sleepingPattern: patient?.sleepingPattern || null,
			feeding: patient?.feeding || null,
			behavior: patient?.behavior || null,
			childCareContext: patient?.childCareContext || null,

			// Nouveaux champs généraux
			ent_followup: patient?.ent_followup || null,
			intestinal_transit: patient?.intestinal_transit || null,
			sleep_quality: patient?.sleep_quality || null,
			fracture_history: patient?.fracture_history || null,
			dental_health: patient?.dental_health || null,
			sport_frequency: patient?.sport_frequency || null,
			gynecological_history: patient?.gynecological_history || null,
			other_comments_adult: patient?.other_comments_adult || null,

			// Nouveaux champs spécifiques aux enfants
			fine_motor_skills: patient?.fine_motor_skills || null,
			gross_motor_skills: patient?.gross_motor_skills || null,
			weight_at_birth: patient?.weight_at_birth || null,
			height_at_birth: patient?.height_at_birth || null,
			head_circumference: patient?.head_circumference || null,
			apgar_score: patient?.apgar_score || null,
			childcare_type: patient?.childcare_type || null,
			school_grade: patient?.school_grade || null,
			pediatrician_name: patient?.pediatrician_name || null,
			paramedical_followup: patient?.paramedical_followup || null,
			other_comments_child: patient?.other_comments_child || null,

			// Champs cliniques
			diagnosis: patient?.diagnosis || null,
			medical_examination: patient?.medical_examination || null,
			treatment_plan: patient?.treatment_plan || null,
			consultation_conclusion: patient?.consultation_conclusion || null,
			cardiac_history: patient?.cardiac_history || null,
			pulmonary_history: patient?.pulmonary_history || null,
			pelvic_history: patient?.pelvic_history || null,
			neurological_history: patient?.neurological_history || null,
			neurodevelopmental_history:
				patient?.neurodevelopmental_history || null,
			cranial_nerve_exam: patient?.cranial_nerve_exam || null,
			dental_exam: patient?.dental_exam || null,
			cranial_exam: patient?.cranial_exam || null,
			lmo_tests: patient?.lmo_tests || null,
			cranial_membrane_exam: patient?.cranial_membrane_exam || null,
			musculoskeletal_history: patient?.musculoskeletal_history || null,
			lower_limb_exam: patient?.lower_limb_exam || null,
			upper_limb_exam: patient?.upper_limb_exam || null,
			shoulder_exam: patient?.shoulder_exam || null,
			scoliosis: patient?.scoliosis || null,
			facial_mask_exam: patient?.facial_mask_exam || null,
			fascia_exam: patient?.fascia_exam || null,
			vascular_exam: patient?.vascular_exam || null,
		},
	});

	const handleSubmit = async (data: PatientFormValues) => {
		console.log("🎯 PatientForm handleSubmit appelé", {
			hasOnSubmit: !!onSubmit,
			hasOnSave: !!onSave,
			data: data,
		});
		console.log("📋 Données brutes reçues:", data);
		try {
			// ✅ Données soumises

			// Traiter les âges des enfants depuis l'input
			if (data.hasChildren === "true" && childrenAgesInput.trim()) {
				const ages = childrenAgesInput
					.split(",")
					.map((age) => parseInt(age.trim()))
					.filter((age) => !isNaN(age));
				data.childrenAges = ages.length > 0 ? ages : null;
			} else {
				data.childrenAges = null;
			}

			// CORRECTION: Validation email unique - générer email unique si vide
			if (!data.email || data.email.trim() === "") {
				const timestamp = Date.now();
				const randomId = Math.floor(Math.random() * 1000);
				data.email = `patient-${timestamp}-${randomId}@temp.local`;
			}

			if (onSubmit) {
				console.log("📤 Appel de onSubmit avec données:", data);
				await onSubmit(data);
				console.log("✅ onSubmit terminé avec succès");
			} else if (onSave) {
				console.log("📤 Appel de onSave avec données:", data);
				await onSave(data);
				console.log("✅ onSave terminé avec succès");
			} else {
				console.error("❌ Aucune fonction onSubmit ou onSave fournie");
			}
		} catch (error) {
			console.error("❌ Error submitting form:", error);
			throw error; // Re-throw pour que l'erreur soit visible
		}
	};

	const tabs = [
		{
			id: "identity",
			label: "Identité",
			shortLabel: "Identité",
			icon: appIcons.identity,
		},
		{
			id: "medical-profile",
			label: "Médical",
			shortLabel: "Médical",
			icon: appIcons.medical,
		},
		{
			id: "medical-history",
			label: "Antécédents",
			shortLabel: "Antécédents",
			icon: appIcons.history,
		},
		{
			id: "clinical-examination",
			label: "Examens cliniques",
			shortLabel: "Examens",
			icon: appIcons.examination,
		},
		{
			id: "specialized-spheres",
			label: "Sphères spéc.",
			shortLabel: "Spécialisé",
			icon: appIcons.specialized,
		},
		...(isChild
			? [
					{
						id: "pediatric-specialized",
						label: "Pédiatrie",
						shortLabel: "Pédiatrie",
						icon: appIcons.pediatric,
					},
				]
			: []),
		{
			id: "supplementary",
			label: "Supplémentaire",
			shortLabel: "Notes",
			icon: appIcons.notes,
		},
		{
			id: "weight-tracking",
			label: "Suivi",
			shortLabel: "Suivi",
			icon: appIcons.tracking,
		},
		...(patient?.id
			? [
					{
						id: "relationships",
						label: "Relations familiales",
						shortLabel: "Famille",
						icon: appIcons.family,
					},
				]
			: []),
	];

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{patient ? "Modifier" : "Ajouter"} un patient
					{isChild && (
						<span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
							Enfant
						</span>
					)}
				</CardTitle>
				<CardDescription>
					{patient
						? `Modification des informations de ${patient.firstName} ${patient.lastName}`
						: "Saisissez les informations du nouveau patient"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={(e) => {
							console.log("🎪 Form onSubmit event déclenché");
							console.log("🔍 Event:", e);
							form.handleSubmit(handleSubmit)(e);
						}}
						className="space-y-6"
					>
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b mb-6 transition-all duration-200">
								<TabsList className="w-full h-auto p-2 bg-gradient-to-r from-muted/20 to-muted/30 dark:from-muted/30 dark:to-muted/40 rounded-lg border border-border/50 shadow-sm">
									<div className="hidden lg:flex lg:justify-between lg:items-center w-full gap-2">
										{tabs.map((tab) => (
											<TabsTrigger
												key={tab.id}
												value={tab.id}
												className="group flex flex-col items-center gap-1 px-3 py-2.5 text-sm font-medium h-14 flex-1 max-w-[140px]
													rounded-md transition-colors
													text-muted-foreground dark:text-muted-foreground
													hover:text-foreground hover:bg-background/80
													dark:hover:bg-background/90 dark:hover:text-foreground
													data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20
													dark:data-[state=active]:bg-card dark:data-[state=active]:text-primary dark:data-[state=active]:border-primary/30"
											>
												<tab.icon className="w-4 h-4" />
												<span className="text-center leading-none text-sm">
													{tab.shortLabel}
												</span>
											</TabsTrigger>
										))}
									</div>

									<div className="lg:hidden flex overflow-x-auto gap-1 w-full scrollbar-none">
										{tabs.map((tab) => (
											<TabsTrigger
												key={tab.id}
												value={tab.id}
												className="group flex flex-col items-center gap-1 px-3 py-2 text-sm font-medium min-w-[65px] h-12 whitespace-nowrap
													rounded-md transition-colors
													text-muted-foreground dark:text-muted-foreground
													hover:text-foreground hover:bg-background/80
													dark:hover:bg-background/90 dark:hover:text-foreground
													data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-primary/20
													dark:data-[state=active]:bg-card dark:data-[state=active]:text-primary dark:data-[state=active]:border-primary/30"
											>
												<tab.icon className="w-4 h-4" />
												<span className="text-sm text-center leading-none">
													{tab.shortLabel}
												</span>
											</TabsTrigger>
										))}
									</div>
								</TabsList>
							</div>

							<TabsContent value="identity">
								<UnifiedIdentityTab
									form={form}
									selectedCabinetId={selectedCabinetId}
									childrenAgesInput={childrenAgesInput}
									setChildrenAgesInput={setChildrenAgesInput}
									patient={patient}
								/>
							</TabsContent>

							<TabsContent value="medical-profile">
								<MedicalProfileTab
									form={form}
									isChild={isChild}
								/>
							</TabsContent>

							<TabsContent value="medical-history">
								<MedicalHistoryTab
									form={form}
									isChild={isChild}
								/>
							</TabsContent>

							<TabsContent value="clinical-examination">
								<ClinicalExaminationTab form={form} />
							</TabsContent>

							<TabsContent value="specialized-spheres">
								<SpecializedSpheresTab form={form} />
							</TabsContent>

							{isChild && (
								<TabsContent value="pediatric-specialized">
									<PediatricSpecializedTab form={form} />
								</TabsContent>
							)}

							<TabsContent value="supplementary">
								<SupplementaryTab form={form} />
							</TabsContent>

							<TabsContent value="weight-tracking">
								<WeightTrackingTab form={form} />
							</TabsContent>

							{patient?.id && (
								<TabsContent value="relationships">
									<PatientRelationshipsTab
										form={form}
										patientId={patient.id}
										availablePatients={availablePatients}
									/>
								</TabsContent>
							)}
						</Tabs>

						<div className="flex justify-end gap-2 pt-6 border-t">
							<Button
								type="submit"
								disabled={isLoading}
								className="min-w-[120px]"
								onClick={async (e) => {
									console.log(
										"🖱️ Bouton 'Mettre à jour' cliqué",
									);
									console.log("🔒 isLoading:", isLoading);
									console.log(
										"📋 Form errors:",
										form.formState.errors,
									);
									console.log(
										"✅ Form isValid:",
										form.formState.isValid,
									);
									console.log(
										"📊 Form values:",
										form.getValues(),
									);

									// Forcer la validation
									const isValid = await form.trigger();
									console.log(
										"🔍 Validation forcée - isValid:",
										isValid,
									);
									if (!isValid) {
										console.error(
											"❌ Validation échouée - Erreurs:",
											form.formState.errors,
										);
									}
								}}
							>
								{isLoading
									? "Enregistrement..."
									: patient
										? "Mettre à jour"
										: "Enregistrer"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
