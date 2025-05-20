
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TranslatedSelect } from "@/components/ui/translated-select";
import { Patient } from "@/types";
import { convertHasChildrenToBoolean } from "@/utils/patient-form-helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { AdditionalFieldsTab } from "./patient-form/AdditionalFieldsTab";
import { WeightHeightBmiFields } from "./patient-form/WeightHeightBmiFields";
import { GeneralTab } from "./patient-form/GeneralTab";
import { ContactTab } from "./patient-form/ContactTab";
import { MedicalTab } from "./patient-form/MedicalTab";
import { ExaminationsTab } from "./patient-form/ExaminationsTab";
import { PediatricTab } from "./patient-form/PediatricTab";

// Schéma de validation pour le formulaire patient
const getPatientSchema = (emailRequired: boolean) =>
	z.object({
		address: z.string().optional().nullable(),
		email: emailRequired
			? z.string().email("Email invalide").min(1, "Email requis")
			: z.string().email("Email invalide").optional().nullable(),
		phone: z.string().optional().nullable(),
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
		cabinetId: z.number().optional(), // Ajout du champ cabinetId
		// Nouveaux champs pour tous les patients
		complementaryExams: z.string().optional().nullable(),
		generalSymptoms: z.string().optional().nullable(),
		// Nouveaux champs pour les enfants
		pregnancyHistory: z.string().optional().nullable(),
		birthDetails: z.string().optional().nullable(),
		developmentMilestones: z.string().optional().nullable(),
		sleepingPattern: z.string().optional().nullable(),
		feeding: z.string().optional().nullable(),
		behavior: z.string().optional().nullable(),
		childCareContext: z.string().optional().nullable(),

		// Nouveaux champs généraux
		ent_followup: z.string().optional().nullable(),
		intestinal_transit: z.string().optional().nullable(),
		sleep_quality: z.string().optional().nullable(),
		fracture_history: z.string().optional().nullable(),
		dental_health: z.string().optional().nullable(),
		sport_frequency: z.string().optional().nullable(),
		gynecological_history: z.string().optional().nullable(),
		other_comments_adult: z.string().optional().nullable(),

		// Nouveaux champs spécifiques aux enfants
		fine_motor_skills: z.string().optional().nullable(),
		gross_motor_skills: z.string().optional().nullable(),
		weight_at_birth: z.number().optional().nullable(),
		height_at_birth: z.number().optional().nullable(),
		head_circumference: z.number().optional().nullable(),
		apgar_score: z.string().optional().nullable(),
		childcare_type: z.string().optional().nullable(),
		school_grade: z.string().optional().nullable(),
		pediatrician_name: z.string().optional().nullable(),
		paramedical_followup: z.string().optional().nullable(),
		other_comments_child: z.string().optional().nullable(),
        
        // Ajout de height, weight et bmi
        height: z.number().optional().nullable(),
        weight: z.number().optional().nullable(),
        bmi: z.number().optional().nullable(),
	});

// Utiliser le schéma avec emailRequired à false pour type PatientFormValues
export type PatientFormValues = z.infer<ReturnType<typeof getPatientSchema>>;
interface PatientFormProps {
	patient?: Patient;
	onSave: (patient: PatientFormValues) => Promise<void>;
	isLoading?: boolean;
	emailRequired?: boolean; // Ajout de la prop emailRequired comme optionnelle
	selectedCabinetId?: number | null; // Ajout du cabinetId sélectionné
}

export function PatientForm({
	patient,
	onSave,
	isLoading = false,
	emailRequired = true, // Valeur par défaut à true pour maintenir le comportement existant
	selectedCabinetId = null,
}: PatientFormProps) {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("general");
	const [childrenCount, setChildrenCount] = useState<number>(0);
	const [childrenAgesInput, setChildrenAgesInput] = useState<string>("");
	const [isChild, setIsChild] = useState<boolean>(false);
	const [currentCabinetId, setCurrentCabinetId] = useState<string | null>(
		patient?.cabinetId
			? String(patient.cabinetId)
			: selectedCabinetId
			? String(selectedCabinetId)
			: null
	);

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
					// Nouveaux champs pour tous les patients
					complementaryExams: patient.complementaryExams || "",
					generalSymptoms: patient.generalSymptoms || "",
					// Nouveaux champs pour les enfants
					pregnancyHistory: patient.pregnancyHistory || "",
					birthDetails: patient.birthDetails || "",
					developmentMilestones: patient.developmentMilestones || "",
					sleepingPattern: patient.sleepingPattern || "",
					feeding: patient.feeding || "",
					behavior: patient.behavior || "",
					childCareContext: patient.childCareContext || "",
					// Autres champs liés au tabagisme
					isExSmoker: patient.isExSmoker || false,
					smokingSince: patient.smokingSince || "",
					smokingAmount: patient.smokingAmount || "",
					quitSmokingDate: patient.quitSmokingDate || "",

					// Nouveaux champs généraux
					ent_followup: patient.ent_followup || null,
					intestinal_transit: patient.intestinal_transit || null,
					sleep_quality: patient.sleep_quality || null,
					fracture_history: patient.fracture_history || null,
					dental_health: patient.dental_health || null,
					sport_frequency: patient.sport_frequency || null,
					gynecological_history:
						patient.gynecological_history || null,
					other_comments_adult: patient.other_comments_adult || null,

					// Nouveaux champs spécifiques aux enfants
					fine_motor_skills: patient.fine_motor_skills || null,
					gross_motor_skills: patient.gross_motor_skills || null,
					weight_at_birth: patient.weight_at_birth || null,
					height_at_birth: patient.height_at_birth || null,
					head_circumference: patient.head_circumference || null,
					apgar_score: patient.apgar_score || null,
					childcare_type: patient.childcare_type || null,
					school_grade: patient.school_grade || null,
					pediatrician_name: patient.pediatrician_name || null,
					paramedical_followup: patient.paramedical_followup || null,
					other_comments_child: patient.other_comments_child || null,
                    
                    // Ajout des champs height, weight et bmi
                    height: patient.height || null,
                    weight: patient.weight || null,
                    bmi: patient.bmi || null,
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
					complementaryExams: "",
					generalSymptoms: "",
					pregnancyHistory: "",
					birthDetails: "",
					developmentMilestones: "",
					sleepingPattern: "",
					feeding: "",
					behavior: "",
					childCareContext: "",
					ent_followup: null,
					intestinal_transit: null,
					sleep_quality: null,
					fracture_history: null,
					dental_health: null,
					sport_frequency: null,
					gynecological_history: null,
					other_comments_adult: null,
					fine_motor_skills: null,
					gross_motor_skills: null,
					weight_at_birth: null,
					height_at_birth: null,
					head_circumference: null,
					apgar_score: null,
					childcare_type: null,
					school_grade: null,
					pediatrician_name: null,
					paramedical_followup: null,
					other_comments_child: null,
                    height: null,
                    weight: null,
                    bmi: null,
			  },
	});

	// Vérifier si le patient est un enfant (moins de 17 ans)
	useEffect(() => {
		const birthDate = form.watch("birthDate");
		if (birthDate) {
			const age =
				new Date().getFullYear() - new Date(birthDate).getFullYear();
			setIsChild(age < 12);
		} else {
			setIsChild(false);
		}
	}, [form.watch("birthDate")]);

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

			// Préparer les données à enregistrer avec le cabinetId
			const patientData: PatientFormValues = {
				...values,
				childrenAges: childrenAgesArray,
				hasChildren: values.hasChildren,
				cabinetId: currentCabinetId
					? parseInt(currentCabinetId)
					: undefined,
			};

			// Appeler la fonction de sauvegarde
			await onSave(patientData);

			// Naviguer vers la liste des patients après la sauvegarde réussie
			navigate("/patients");
			toast.success("✅  Patient enregistré avec succès !");
		} catch (error) {
			console.error(
				"⛔ Erreur lors de l'enregistrement du patient:",
				error
			);
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
					<TabsList className="grid grid-cols-6 sm:grid-cols-6">
						<TabsTrigger value="general">Général</TabsTrigger>
						<TabsTrigger value="contact">Contact</TabsTrigger>
						<TabsTrigger value="medical">Médical</TabsTrigger>
						<TabsTrigger value="anamnese">Examens</TabsTrigger>
						<TabsTrigger value="additional">
							Santé/Habitudes
						</TabsTrigger>
						{isChild && (
							<TabsTrigger value="pediatric">
								Pédiatrie
							</TabsTrigger>
						)}
					</TabsList>

					<TabsContent value="general" className="space-y-4">
						<GeneralTab 
							form={form} 
							childrenAgesInput={childrenAgesInput}
							setChildrenAgesInput={setChildrenAgesInput}
							currentCabinetId={currentCabinetId}
							setCurrentCabinetId={setCurrentCabinetId}
						/>
					</TabsContent>

					<TabsContent value="contact" className="space-y-4">
						<ContactTab form={form} emailRequired={emailRequired} />
					</TabsContent>

					<TabsContent value="medical" className="space-y-4">
						<MedicalTab form={form} isChild={isChild} />
					</TabsContent>

					<TabsContent value="anamnese" className="space-y-4">
						<ExaminationsTab form={form} />
					</TabsContent>

					<TabsContent value="additional" className="space-y-4">
						<Card>
							<CardContent className="space-y-4 mt-6">
								<AdditionalFieldsTab
									form={form}
									isChild={isChild}
								/>
							</CardContent>
						</Card>
					</TabsContent>

					{isChild && (
						<TabsContent value="pediatric" className="space-y-4">
							<PediatricTab form={form} />
						</TabsContent>
					)}
				</Tabs>

				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate(-1)}
						disabled={isLoading}
					>
						Annuler
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Enregistrement..." : "Enregistrer"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
