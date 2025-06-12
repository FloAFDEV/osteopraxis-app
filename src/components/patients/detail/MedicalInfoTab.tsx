import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { differenceInYears, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Calendar,
	Stethoscope,
	Dumbbell,
	Eye,
	Ear,
	Soup,
	Heart,
	FilePlus2,
	StickyNote,
	Baby,
	Activity,
	Home,
	Plus,
	X,
	Edit,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { MedicalAccordion } from "./MedicalAccordion";
import { AppointmentForm } from "@/components/appointment-form";
import { PatientForm } from "@/components/patient-form";
import { PatientFormValues } from "@/components/patient-form/types";
import { Link } from "react-router-dom";

interface MedicalInfoTabProps {
	patient: Patient;
	pastAppointments: Appointment[];
	onUpdateAppointmentStatus: (
		appointmentId: number,
		status: AppointmentStatus
	) => Promise<void>;
	onNavigateToHistory: () => void;
	onAppointmentCreated?: () => void;
	onPatientUpdated?: (updatedData: PatientFormValues) => void;
	selectedCabinetId?: number | null;
}

export function MedicalInfoTab({
	patient,
	pastAppointments,
	onAppointmentCreated,
	onPatientUpdated,
	selectedCabinetId,
}: MedicalInfoTabProps) {
	const [isChild, setIsChild] = useState<boolean>(false);
	const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
	const [showEditPatientForm, setShowEditPatientForm] = useState(false);

	const lastAppointment =
		pastAppointments && pastAppointments.length > 0
			? pastAppointments[0]
			: null;

	useEffect(() => {
		if (patient.birthDate) {
			const age = differenceInYears(
				new Date(),
				new Date(patient.birthDate)
			);
			setIsChild(age < 17);
		}
	}, [patient.birthDate]);

	// Fonction helper pour fusionner traumatismes et fractures
	const getTraumaAndFractureHistory = () => {
		const trauma = patient.traumaHistory;
		const fractures = patient.fracture_history;

		if (trauma && fractures) {
			return `${trauma} | ${fractures}`;
		}
		return trauma || fractures || null;
	};

	// Fonction helper pour déterminer l'importance médicale
	const isCriticalCondition = (value: string | null | undefined) => {
		if (!value) return false;
		const criticalKeywords = [
			"allergie",
			"urgence",
			"critique",
			"grave",
			"sévère",
			"avp",
			"accident",
			"hospitalisation",
			"AVC",
			"AVP",
		];
		return criticalKeywords.some((keyword) =>
			value.toLowerCase().includes(keyword)
		);
	};

	const isImportantCondition = (value: string | null | undefined) => {
		if (!value) return false;
		const importantKeywords = [
			"traitement",
			"médicament",
			"suivi",
			"chronique",
			"antécédent",
			"antécédents",
		];
		return importantKeywords.some((keyword) =>
			value.toLowerCase().includes(keyword)
		);
	};

	type MedicalSectionCategory =
		| "general"
		| "lifestyle"
		| "sensory"
		| "digestive"
		| "additional"
		| "reproductive"
		| "pediatric";

	const medicalSections: {
		title: string;
		icon: any;
		priority: "high" | "medium" | "low";
		category: MedicalSectionCategory;
		defaultOpen?: boolean;
		sectionId: string;
		items: any[];
	}[] = [
		{
			title: "Informations médicales générales",
			icon: Stethoscope,
			priority: "high" as const,
			category: "general" as const,
			defaultOpen: true,
			sectionId: "informations-medicales-generales",
			items: [
				{
					label: "Médecin généraliste",
					value: patient.generalPractitioner,
					// Retiré isImportant pour le médecin généraliste
				},
				{
					label: "Traitement actuel",
					value: patient.currentTreatment,
					isCritical: isCriticalCondition(patient.currentTreatment),
					isImportant: !!patient.currentTreatment,
				},
				{
					label: "Allergies",
					value:
						patient.allergies && patient.allergies !== "NULL"
							? patient.allergies
							: null,
					isCritical: !!(
						patient.allergies && patient.allergies !== "NULL"
					),
					isImportant: !!(
						patient.allergies && patient.allergies !== "NULL"
					),
				},
				{
					label: "Antécédents médicaux familiaux",
					value: patient.familyStatus,
					isImportant: isImportantCondition(patient.familyStatus),
				},
				{
					label: "Chirurgie",
					value: patient.surgicalHistory,
					isImportant: isImportantCondition(patient.surgicalHistory),
				},
				{
					label: "Traumatismes et fractures",
					value: getTraumaAndFractureHistory(),
					isImportant: !!(
						patient.traumaHistory || patient.fracture_history
					),
				},
				{
					label: "Rhumatologie",
					value: patient.rheumatologicalHistory,
					isImportant: isImportantCondition(
						patient.rheumatologicalHistory
					),
				},
			],
		},
		{
			title: "Activité physique / Sommeil",
			icon: Dumbbell,
			priority: "medium" as const,
			category: "lifestyle" as const,
			sectionId: "activite-physique-sommeil",
			items: [
				{
					label: "Activité physique",
					value: patient.physicalActivity,
				},
				{
					label: "Fréquence sportive",
					value: patient.sport_frequency,
				},
				{
					label: "Qualité du sommeil",
					value: patient.sleep_quality,
					isImportant:
						patient.sleep_quality
							?.toLowerCase()
							.includes("mauvais") ||
						patient.sleep_quality
							?.toLowerCase()
							.includes("trouble"),
				},
			],
		},
		{
			title: "Ophtalmologie / Dentaire",
			icon: Eye,
			priority: "low" as const,
			category: "sensory" as const,
			sectionId: "ophtalmologie-dentaire",
			items: [
				{
					label: "Correction de la vue",
					value: patient.hasVisionCorrection ? "Oui" : "Non",
				},
				{
					label: "Ophtalmologue",
					value: patient.ophtalmologistName,
				},
				{
					label: "Santé dentaire",
					value: patient.dental_health,
					isImportant:
						patient.dental_health
							?.toLowerCase()
							.includes("problème") ||
						patient.dental_health
							?.toLowerCase()
							.includes("douleur"),
				},
			],
		},
		{
			title: "ORL",
			icon: Ear,
			priority: "medium" as const,
			category: "sensory" as const,
			sectionId: "orl",
			items: [
				{
					label: "Problèmes ORL",
					value: patient.entProblems,
					isCritical: isCriticalCondition(patient.entProblems),
					isImportant: !!patient.entProblems,
				},
				{
					label: "Médecin ORL",
					value: patient.entDoctorName,
				},
				{
					label: "Suivi ORL",
					value: patient.ent_followup,
					isImportant: !!patient.ent_followup,
				},
			],
		},
		{
			title: "Digestif",
			icon: Soup,
			priority: "medium" as const,
			category: "digestive" as const,
			sectionId: "digestif",
			items: [
				{
					label: "Problèmes digestifs",
					value: patient.digestiveProblems,
					isCritical: isCriticalCondition(patient.digestiveProblems),
					isImportant: !!patient.digestiveProblems,
				},
				{
					label: "Transit intestinal",
					value: patient.intestinal_transit,
					isImportant:
						patient.intestinal_transit
							?.toLowerCase()
							.includes("problème") ||
						patient.intestinal_transit
							?.toLowerCase()
							.includes("trouble"),
				},
				{
					label: "Médecin digestif",
					value: patient.digestiveDoctorName,
				},
			],
		},
		{
			title: "Anamnèse complémentaire",
			icon: FilePlus2,
			priority: "low" as const,
			category: "additional" as const,
			sectionId: "anamnese-complementaire",
			items: [
				{
					label: "Examens complémentaires",
					value: patient.complementaryExams,
					isImportant: !!patient.complementaryExams,
				},
				{
					label: "Symptômes généraux",
					value: patient.generalSymptoms,
					isImportant: !!patient.generalSymptoms,
				},
			],
		},
	];

	// Sections spécifiques aux adultes
	if (!isChild) {
		medicalSections.push({
			title: "Gynécologique",
			icon: Heart,
			priority: "medium" as const,
			category: "reproductive" as const,
			sectionId: "gynecologique",
			items: [
				{
					label: "Contraception",
					value: patient.contraception
						? String(patient.contraception)
						: null,
				},
				{
					label: "Antécédents gynécologiques",
					value: patient.gynecological_history,
					isImportant: isImportantCondition(
						patient.gynecological_history
					),
				},
			],
		});

		if (patient.other_comments_adult) {
			medicalSections.push({
				title: "Autres commentaires",
				icon: StickyNote,
				priority: "low" as const,
				category: "additional" as const,
				sectionId: "autres-commentaires-adulte",
				items: [
					{
						label: "Notes supplémentaires",
						value: patient.other_comments_adult,
						isImportant: !!patient.other_comments_adult,
					},
				],
			});
		}
	}

	// Sections spécifiques aux enfants
	if (isChild) {
		medicalSections.push(
			{
				title: "Informations pédiatriques générales",
				icon: Baby,
				priority: "high" as const,
				category: "pediatric" as const,
				defaultOpen: true,
				sectionId: "informations-pediatriques-generales",
				items: [
					{
						label: "Grossesse",
						value: patient.pregnancyHistory,
						isImportant: isImportantCondition(
							patient.pregnancyHistory
						),
					},
					{
						label: "Naissance",
						value: patient.birthDetails,
						isImportant: isImportantCondition(patient.birthDetails),
					},
					{
						label: "Score APGAR",
						value: patient.apgar_score,
						isImportant: patient.apgar_score
							? parseFloat(patient.apgar_score) < 7
							: false,
					},
					{
						label: "Poids à la naissance",
						value: patient.weight_at_birth
							? `${patient.weight_at_birth} g`
							: null,
						isImportant: patient.weight_at_birth
							? Number(patient.weight_at_birth) < 2500 ||
							  Number(patient.weight_at_birth) > 4000
							: false,
					},
					{
						label: "Taille à la naissance",
						value: patient.height_at_birth
							? `${patient.height_at_birth} cm`
							: null,
					},
					{
						label: "Périmètre crânien",
						value: patient.head_circumference
							? `${patient.head_circumference} cm`
							: null,
					},
				],
			},
			{
				title: "Développement et suivi",
				icon: Activity,
				priority: "medium" as const,
				category: "pediatric" as const,
				sectionId: "developpement-et-suivi",
				items: [
					{
						label: "Développement moteur",
						value: patient.developmentMilestones,
						isImportant:
							patient.developmentMilestones
								?.toLowerCase()
								.includes("retard") ||
							patient.developmentMilestones
								?.toLowerCase()
								.includes("problème"),
					},
					{
						label: "Motricité fine",
						value: patient.fine_motor_skills,
						isImportant:
							patient.fine_motor_skills
								?.toLowerCase()
								.includes("difficile") ||
							patient.fine_motor_skills
								?.toLowerCase()
								.includes("retard"),
					},
					{
						label: "Motricité globale",
						value: patient.gross_motor_skills,
						isImportant:
							patient.gross_motor_skills
								?.toLowerCase()
								.includes("difficile") ||
							patient.gross_motor_skills
								?.toLowerCase()
								.includes("retard"),
					},
					{
						label: "Sommeil",
						value: patient.sleepingPattern,
						isImportant:
							patient.sleepingPattern
								?.toLowerCase()
								.includes("trouble") ||
							patient.sleepingPattern
								?.toLowerCase()
								.includes("difficile"),
					},
					{
						label: "Alimentation",
						value: patient.feeding,
						isImportant:
							patient.feeding
								?.toLowerCase()
								.includes("problème") ||
							patient.feeding
								?.toLowerCase()
								.includes("difficile"),
					},
					{
						label: "Comportement",
						value: patient.behavior,
						isImportant:
							patient.behavior
								?.toLowerCase()
								.includes("problème") ||
							patient.behavior
								?.toLowerCase()
								.includes("difficile"),
					},
				],
			},
			{
				title: "Environnement et suivi",
				icon: Home,
				priority: "low" as const,
				category: "pediatric" as const,
				sectionId: "environnement-et-suivi",
				items: [
					{
						label: "Mode de garde",
						value: patient.childcare_type,
					},
					{
						label: "Niveau scolaire",
						value: patient.school_grade,
					},
					{
						label: "Pédiatre",
						value: patient.pediatrician_name,
					},
					{
						label: "Suivis paramédicaux",
						value: patient.paramedical_followup,
						isImportant: !!patient.paramedical_followup,
					},
					{
						label: "Contexte de garde",
						value: patient.childCareContext,
					},
				],
			}
		);

		if (patient.other_comments_child) {
			medicalSections.push({
				title: "Autres commentaires",
				icon: StickyNote,
				priority: "low" as const,
				category: "additional" as const,
				sectionId: "autres-commentaires-enfant",
				items: [
					{
						label: "Notes supplémentaires",
						value: patient.other_comments_child,
						isImportant: !!patient.other_comments_child,
					},
				],
			});
		}
	}

	const handleAppointmentSuccess = () => {
		onAppointmentCreated?.();
		setShowNewAppointmentForm(false);
	};

	const handlePatientUpdate = async (updatedData: PatientFormValues) => {
		if (onPatientUpdated) {
			await onPatientUpdated(updatedData);
			setShowEditPatientForm(false);
		}
	};

	return (
		<div className="space-y-6 mt-6 p-6 bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
			{/* Boutons d'action */}
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Dossier médical</h3>
				<div className="flex gap-2">
					<Button 
						onClick={() => setShowEditPatientForm(!showEditPatientForm)}
						variant={showEditPatientForm ? "outline" : "default"}
						className="flex items-center gap-2"
					>
						{showEditPatientForm ? (
							<>
								<X className="h-4 w-4" />
								Annuler
							</>
						) : (
							<>
								<Edit className="h-4 w-4 text-amber-500" />
								Modifier
							</>
						)}
					</Button>
					<Button 
						onClick={() => setShowNewAppointmentForm(!showNewAppointmentForm)}
						variant={showNewAppointmentForm ? "outline" : "default"}
						className="flex items-center gap-2"
					>
						{showNewAppointmentForm ? (
							<>
								<X className="h-4 w-4" />
								Annuler
							</>
						) : (
							<>
								<Plus className="h-4 w-4" />
								Nouvelle séance
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Formulaire de modification du patient */}
			{showEditPatientForm && (
				<Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Edit className="h-5 w-5 text-amber-500" />
							Modifier les informations de {patient.firstName} {patient.lastName}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<PatientForm
							patient={patient}
							onSave={handlePatientUpdate}
							selectedCabinetId={selectedCabinetId}
						/>
					</CardContent>
				</Card>
			)}

			{/* Formulaire de nouvelle séance */}
			{showNewAppointmentForm && (
				<Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Calendar className="h-5 w-5 text-blue-500" />
							Nouvelle séance pour {patient.firstName} {patient.lastName}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<AppointmentForm
							defaultValues={{
								patientId: patient.id,
								date: new Date(),
								time: "09:00",
								status: "SCHEDULED",
								website: "",
							}}
							onSuccess={handleAppointmentSuccess}
						/>
					</CardContent>
				</Card>
			)}

			{/* Dernière séance */}
			{lastAppointment && (
				<Card className="border-blue-100 dark:border-slate-900/50 ">
					<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg">
						<CardTitle className="text-lg flex flex-wrap items-center gap-2">
							<Calendar className="h-5 w-5 text-blue-500" />
							Dernière séance (
							{format(
								new Date(lastAppointment.date),
								"dd MMMM yyyy",
								{
									locale: fr,
								}
							)}
							) :
							<AppointmentStatusBadge
								status={lastAppointment.status}
							/>
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<div>
							<p className="mb-2">
								<span className="font-medium">Motif :</span>{" "}
								{lastAppointment.reason}
							</p>
							<div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 italic text-muted-foreground my-2">
								<span className="font-medium">
									Compte-rendu :
								</span>{" "}
								{lastAppointment.notes
									? lastAppointment.notes
									: "Pas de notes pour cette séance"}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<MedicalAccordion sections={medicalSections} />
		</div>
	);
}
