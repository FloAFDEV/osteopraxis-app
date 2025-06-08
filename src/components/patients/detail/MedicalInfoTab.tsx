
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { MedicalAccordion } from "./MedicalAccordion";

interface MedicalInfoTabProps {
	patient: Patient;
	pastAppointments: Appointment[];
	onUpdateAppointmentStatus: (
		appointmentId: number,
		status: AppointmentStatus
	) => Promise<void>;
	onNavigateToHistory: () => void;
}

export function MedicalInfoTab({
	patient,
	pastAppointments,
}: MedicalInfoTabProps) {
	const [isChild, setIsChild] = useState<boolean>(false);

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

	const medicalSections = [
		{
			title: "Informations médicales générales",
			icon: Stethoscope,
			priority: "high" as const,
			defaultOpen: true,
			items: [
				{
					label: "Médecin généraliste",
					value: patient.generalPractitioner,
					isImportant: !!patient.generalPractitioner
				},
				{
					label: "Traitement actuel",
					value: patient.currentTreatment,
					isImportant: !!patient.currentTreatment
				},
				{
					label: "Allergies",
					value: patient.allergies && patient.allergies !== "NULL" ? patient.allergies : null,
					isImportant: !!(patient.allergies && patient.allergies !== "NULL")
				},
				{
					label: "Antécédents médicaux familiaux",
					value: patient.familyStatus
				},
				{
					label: "Chirurgie",
					value: patient.surgicalHistory
				},
				{
					label: "Fractures",
					value: patient.fracture_history
				},
				{
					label: "Traumatismes",
					value: patient.traumaHistory
				},
				{
					label: "Rhumatologie",
					value: patient.rheumatologicalHistory
				},
			]
		},
		{
			title: "Activité physique / Sommeil",
			icon: Dumbbell,
			priority: "medium" as const,
			items: [
				{
					label: "Activité physique",
					value: patient.physicalActivity
				},
				{
					label: "Fréquence sportive",
					value: patient.sport_frequency
				},
				{
					label: "Qualité du sommeil",
					value: patient.sleep_quality
				},
			]
		},
		{
			title: "Ophtalmologie / Dentaire",
			icon: Eye,
			priority: "low" as const,
			items: [
				{
					label: "Correction de la vue",
					value: patient.hasVisionCorrection ? "Oui" : "Non"
				},
				{
					label: "Ophtalmologue",
					value: patient.ophtalmologistName
				},
				{
					label: "Santé dentaire",
					value: patient.dental_health
				},
			]
		},
		{
			title: "ORL",
			icon: Ear,
			priority: "medium" as const,
			items: [
				{
					label: "Problèmes ORL",
					value: patient.entProblems,
					isImportant: !!patient.entProblems
				},
				{
					label: "Médecin ORL",
					value: patient.entDoctorName
				},
				{
					label: "Suivi ORL",
					value: patient.ent_followup
				},
			]
		},
		{
			title: "Digestif",
			icon: Soup,
			priority: "medium" as const,
			items: [
				{
					label: "Problèmes digestifs",
					value: patient.digestiveProblems,
					isImportant: !!patient.digestiveProblems
				},
				{
					label: "Transit intestinal",
					value: patient.intestinal_transit
				},
				{
					label: "Médecin digestif",
					value: patient.digestiveDoctorName
				},
			]
		},
		{
			title: "Anamnèse complémentaire",
			icon: FilePlus2,
			priority: "low" as const,
			items: [
				{
					label: "Examens complémentaires",
					value: patient.complementaryExams
				},
				{
					label: "Symptômes généraux",
					value: patient.generalSymptoms
				},
			]
		}
	];

	// Sections spécifiques aux adultes
	if (!isChild) {
		medicalSections.push({
			title: "Gynécologique",
			icon: Heart,
			priority: "medium" as const,
			items: [
				{
					label: "Contraception",
					value: patient.contraception ? String(patient.contraception) : null
				},
				{
					label: "Antécédents gynécologiques",
					value: patient.gynecological_history
				},
			]
		});

		if (patient.other_comments_adult) {
			medicalSections.push({
				title: "Autres commentaires",
				icon: StickyNote,
				priority: "low" as const,
				items: [
					{
						label: "Notes supplémentaires",
						value: patient.other_comments_adult
					},
				]
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
				defaultOpen: true,
				items: [
					{
						label: "Grossesse",
						value: patient.pregnancyHistory
					},
					{
						label: "Naissance",
						value: patient.birthDetails
					},
					{
						label: "Score APGAR",
						value: patient.apgar_score
					},
					{
						label: "Poids à la naissance",
						value: patient.weight_at_birth ? `${patient.weight_at_birth} g` : null
					},
					{
						label: "Taille à la naissance",
						value: patient.height_at_birth ? `${patient.height_at_birth} cm` : null
					},
					{
						label: "Périmètre crânien",
						value: patient.head_circumference ? `${patient.head_circumference} cm` : null
					},
				]
			},
			{
				title: "Développement et suivi",
				icon: Activity,
				priority: "medium" as const,
				items: [
					{
						label: "Développement moteur",
						value: patient.developmentMilestones
					},
					{
						label: "Motricité fine",
						value: patient.fine_motor_skills
					},
					{
						label: "Motricité globale",
						value: patient.gross_motor_skills
					},
					{
						label: "Sommeil",
						value: patient.sleepingPattern
					},
					{
						label: "Alimentation",
						value: patient.feeding
					},
					{
						label: "Comportement",
						value: patient.behavior
					},
				]
			},
			{
				title: "Environnement et suivi",
				icon: Home,
				priority: "low" as const,
				items: [
					{
						label: "Mode de garde",
						value: patient.childcare_type
					},
					{
						label: "Niveau scolaire",
						value: patient.school_grade
					},
					{
						label: "Pédiatre",
						value: patient.pediatrician_name
					},
					{
						label: "Suivis paramédicaux",
						value: patient.paramedical_followup
					},
					{
						label: "Contexte de garde",
						value: patient.childCareContext
					},
				]
			}
		);

		if (patient.other_comments_child) {
			medicalSections.push({
				title: "Autres commentaires",
				icon: StickyNote,
				priority: "low" as const,
				items: [
					{
						label: "Notes supplémentaires",
						value: patient.other_comments_child
					},
				]
			});
		}
	}

	return (
		<div className="space-y-6 mt-6">
			{lastAppointment && (
				<Card className="border-blue-100 dark:border-slate-900/50">
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
