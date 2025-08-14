import { AppointmentForm } from "@/components/AppointmentForm";
import { PatientForm } from "@/components/PatientForm";
import { PatientFormValues } from "@/components/patient-form/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { differenceInYears, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Activity,
	Baby,
	Calendar,
	CheckCircle2,
	ClipboardList,
	Dumbbell,
	Edit,
	Eye,
	Plus,
	Soup,
	Stethoscope,
	Syringe,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { getMedicalBadge, isCardiac } from "./medical-badge-utils";
import { MedicalAccordion } from "./MedicalAccordion";

interface MedicalInfoTabProps {
	patient: Patient;
	pastAppointments: Appointment[];
	onUpdateAppointmentStatus: (
		appointmentId: number,
		status: AppointmentStatus
	) => Promise<void>;
	onNavigateToHistory: () => void;
	onAppointmentCreated?: () => void;
	onPatientUpdated?: (updatedData: PatientFormValues) => Promise<void>;
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
	const [isUpdating, setIsUpdating] = useState(false);

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

	const formatValue = (value: any) =>
		value || value === 0 ? String(value) : "Non renseigné";

	// Sphère ORL + ophtalmo + dentaire (fusionnée)
	const orlOphDentalItems = [
		{
			label: "Correction de la vue",
			value: patient.hasVisionCorrection ? "Oui" : "Non",
			badge: getMedicalBadge(
				"Correction de la vue",
				patient.hasVisionCorrection ? "Oui" : "Non"
			),
			isCardiac: isCardiac(
				"Correction de la vue",
				patient.hasVisionCorrection ? "Oui" : "Non"
			),
		},
		{
			label: "Ophtalmologue",
			value: formatValue(patient.ophtalmologistName),
			badge: getMedicalBadge(
				"Ophtalmologue",
				formatValue(patient.ophtalmologistName)
			),
			isCardiac: isCardiac(
				"Ophtalmologue",
				formatValue(patient.ophtalmologistName)
			),
		},
		{
			label: "Santé dentaire",
			value: formatValue(patient.dental_health),
			badge: getMedicalBadge(
				"Santé dentaire",
				formatValue(patient.dental_health)
			),
			isCardiac: isCardiac(
				"Santé dentaire",
				formatValue(patient.dental_health)
			),
		},
		{
			label: "Examen dentaire",
			value: formatValue(patient.dental_exam),
			badge: getMedicalBadge(
				"Examen dentaire",
				formatValue(patient.dental_exam)
			),
			isCardiac: isCardiac(
				"Examen dentaire",
				formatValue(patient.dental_exam)
			),
		},
		{
			label: "Médecin ORL",
			value: formatValue(patient.entDoctorName),
			badge: getMedicalBadge(
				"Médecin ORL",
				formatValue(patient.entDoctorName)
			),
			isCardiac: isCardiac(
				"Médecin ORL",
				formatValue(patient.entDoctorName)
			),
		},
		{
			label: "Problèmes ORL",
			value: formatValue(patient.entProblems),
			badge: getMedicalBadge(
				"Problèmes ORL",
				formatValue(patient.entProblems)
			),
			isCardiac: isCardiac(
				"Problèmes ORL",
				formatValue(patient.entProblems)
			),
		},
		{
			label: "Suivi ORL",
			value: formatValue(patient.ent_followup),
			badge: getMedicalBadge(
				"Suivi ORL",
				formatValue(patient.ent_followup)
			),
			isCardiac: isCardiac(
				"Suivi ORL",
				formatValue(patient.ent_followup)
			),
		},
	];

	// Section sphère périphériques avec sous-sections
	const periphericSection = [
		{
			title: "Membres supérieurs",
			items: [
				{
					label: "Examen membre supérieur",
					value: formatValue(patient.upper_limb_exam),
					badge: getMedicalBadge(
						"Examen membre supérieur",
						formatValue(patient.upper_limb_exam)
					),
					isCardiac: isCardiac(
						"Examen membre supérieur",
						formatValue(patient.upper_limb_exam)
					),
				},
				{
					label: "Examen épaule",
					value: formatValue(patient.shoulder_exam),
					badge: getMedicalBadge(
						"Examen épaule",
						formatValue(patient.shoulder_exam)
					),
					isCardiac: isCardiac(
						"Examen épaule",
						formatValue(patient.shoulder_exam)
					),
				},
				{
					label: "Motricité fine",
					value: formatValue(patient.fine_motor_skills),
					badge: getMedicalBadge(
						"Motricité fine",
						formatValue(patient.fine_motor_skills)
					),
					isCardiac: isCardiac(
						"Motricité fine",
						formatValue(patient.fine_motor_skills)
					),
				},
			],
		},
		{
			title: "Membres inférieurs",
			items: [
				{
					label: "Examen membre inférieur",
					value: formatValue(patient.lower_limb_exam),
					badge: getMedicalBadge(
						"Examen membre inférieur",
						formatValue(patient.lower_limb_exam)
					),
					isCardiac: isCardiac(
						"Examen membre inférieur",
						formatValue(patient.lower_limb_exam)
					),
				},
				{
					label: "Motricité globale",
					value: formatValue(patient.gross_motor_skills),
					badge: getMedicalBadge(
						"Motricité globale",
						formatValue(patient.gross_motor_skills)
					),
					isCardiac: isCardiac(
						"Motricité globale",
						formatValue(patient.gross_motor_skills)
					),
				},
				{
					label: "Tests LMO",
					value: formatValue(patient.lmo_tests),
					badge: getMedicalBadge(
						"Tests LMO",
						formatValue(patient.lmo_tests)
					),
					isCardiac: isCardiac(
						"Tests LMO",
						formatValue(patient.lmo_tests)
					),
				},
			],
		},
	];

	// Tableau des sphères à afficher
	const spheres = [
		{
			title: "Générale",
			icon: Stethoscope,
			category: "general" as const,
			defaultOpen: true,
			items: [
				{
					label: "Antécédents médicaux familiaux",
					value: formatValue(patient.familyStatus),
					badge: getMedicalBadge(
						"Antécédents médicaux familiaux",
						formatValue(patient.familyStatus)
					),
					isCardiac: isCardiac(
						"Antécédents médicaux familiaux",
						formatValue(patient.familyStatus)
					),
				},
				{
					label: "Antécédents cardiaques",
					value: formatValue(patient.cardiac_history),
					badge: getMedicalBadge(
						"Antécédents cardiaques",
						formatValue(patient.cardiac_history)
					),
					isCardiac: isCardiac(
						"Antécédents cardiaques",
						formatValue(patient.cardiac_history)
					),
				},
				{
					label: "Antécédents pulmonaires",
					value: formatValue(patient.pulmonary_history),
					badge: getMedicalBadge(
						"Antécédents pulmonaires",
						formatValue(patient.pulmonary_history)
					),
					isCardiac: isCardiac(
						"Antécédents pulmonaires",
						formatValue(patient.pulmonary_history)
					),
				},
				{
					label: "Rhumatologie",
					value: formatValue(patient.rheumatologicalHistory),
					badge: getMedicalBadge(
						"Rhumatologie",
						formatValue(patient.rheumatologicalHistory)
					),
					isCardiac: isCardiac(
						"Rhumatologie",
						formatValue(patient.rheumatologicalHistory)
					),
				},
				{
					label: "Scoliose",
					value: formatValue(patient.scoliosis),
					badge: getMedicalBadge(
						"Scoliose",
						formatValue(patient.scoliosis)
					),
					isCardiac: isCardiac(
						"Scoliose",
						formatValue(patient.scoliosis)
					),
				},
				{
					label: "Traumatismes",
					value: formatValue(patient.traumaHistory),
					badge: getMedicalBadge(
						"Traumatismes",
						formatValue(patient.traumaHistory)
					),
					isCardiac: isCardiac(
						"Traumatismes",
						formatValue(patient.traumaHistory)
					),
				},
				{
					label: "Fractures",
					value: formatValue(patient.fracture_history),
					badge: getMedicalBadge(
						"Fractures",
						formatValue(patient.fracture_history)
					),
					isCardiac: isCardiac(
						"Fractures",
						formatValue(patient.fracture_history)
					),
				},
				{
					label: "Chirurgies",
					value: formatValue(patient.surgicalHistory),
					badge: getMedicalBadge(
						"Chirurgies",
						formatValue(patient.surgicalHistory)
					),
					isCardiac: isCardiac(
						"Chirurgies",
						formatValue(patient.surgicalHistory)
					),
				},
				{
					label: "Médecin généraliste",
					value: formatValue(patient.generalPractitioner),
					badge: getMedicalBadge(
						"Médecin généraliste",
						formatValue(patient.generalPractitioner)
					),
					isCardiac: isCardiac(
						"Médecin généraliste",
						formatValue(patient.generalPractitioner)
					),
				},
				{
					label: "Traitement actuel",
					value: formatValue(patient.currentTreatment),
					badge: getMedicalBadge(
						"Traitement actuel",
						formatValue(patient.currentTreatment)
					),
					isCardiac: isCardiac(
						"Traitement actuel",
						formatValue(patient.currentTreatment)
					),
				},
				{
					label: "Allergies",
					value: formatValue(
						patient.allergies && patient.allergies !== "NULL"
							? patient.allergies
							: "Pas d'allergie(s) connue(s)"
					),
					badge: getMedicalBadge(
						"Allergies",
						formatValue(
							patient.allergies && patient.allergies !== "NULL"
								? patient.allergies
								: "Pas d'allergie(s) connue(s)"
						)
					),
					isCardiac: isCardiac(
						"Allergies",
						formatValue(
							patient.allergies && patient.allergies !== "NULL"
								? patient.allergies
								: "Pas d'allergie(s) connue(s)"
						)
					),
				},
				{
					label: "Examens complémentaires",
					value: formatValue(patient.complementaryExams),
					badge: getMedicalBadge(
						"Examens complémentaires",
						formatValue(patient.complementaryExams)
					),
					isCardiac: isCardiac(
						"Examens complémentaires",
						formatValue(patient.complementaryExams)
					),
				},
				{
					label: "Résumé / Conclusion consultation",
					value: formatValue(patient.consultation_conclusion),
					badge: getMedicalBadge(
						"Résumé / Conclusion consultation",
						formatValue(patient.consultation_conclusion)
					),
					isCardiac: isCardiac(
						"Résumé / Conclusion consultation",
						formatValue(patient.consultation_conclusion)
					),
				},
				{
					label: "Diagnostic",
					value: formatValue(patient.diagnosis),
					badge: getMedicalBadge(
						"Diagnostic",
						formatValue(patient.diagnosis)
					),
					isCardiac: isCardiac(
						"Diagnostic",
						formatValue(patient.diagnosis)
					),
				},
				{
					label: "Plan de traitement",
					value: formatValue(patient.treatment_plan),
					badge: getMedicalBadge(
						"Plan de traitement",
						formatValue(patient.treatment_plan)
					),
					isCardiac: isCardiac(
						"Plan de traitement",
						formatValue(patient.treatment_plan)
					),
				},
				{
					label: "Examen médical",
					value: formatValue(patient.medical_examination),
					badge: getMedicalBadge(
						"Examen médical",
						formatValue(patient.medical_examination)
					),
					isCardiac: isCardiac(
						"Examen médical",
						formatValue(patient.medical_examination)
					),
				},
				{
					label: "Autres commentaires (adulte)",
					value: formatValue(patient.other_comments_adult),
					badge: getMedicalBadge(
						"Autres commentaires (adulte)",
						formatValue(patient.other_comments_adult)
					),
					isCardiac: isCardiac(
						"Autres commentaires (adulte)",
						formatValue(patient.other_comments_adult)
					),
				},
			],
		},
		{
			title: "Activité & Hygiène de vie",
			icon: Dumbbell,
			category: "lifestyle" as const,
			items: [
				{
					label: "Activité physique",
					value: formatValue(patient.physicalActivity),
					badge: getMedicalBadge(
						"Activité physique",
						formatValue(patient.physicalActivity)
					),
					isCardiac: isCardiac(
						"Activité physique",
						formatValue(patient.physicalActivity)
					),
				},
				{
					label: "Fréquence sportive",
					value: formatValue(patient.sport_frequency),
					badge: getMedicalBadge(
						"Fréquence sportive",
						formatValue(patient.sport_frequency)
					),
					isCardiac: isCardiac(
						"Fréquence sportive",
						formatValue(patient.sport_frequency)
					),
				},
				{
					label: "Qualité du sommeil",
					value: formatValue(patient.sleep_quality),
					badge: getMedicalBadge(
						"Qualité du sommeil",
						formatValue(patient.sleep_quality)
					),
					isCardiac: isCardiac(
						"Qualité du sommeil",
						formatValue(patient.sleep_quality)
					),
				},
				{
					label: "Alimentation",
					value: formatValue(patient.feeding),
					badge: getMedicalBadge(
						"Alimentation",
						formatValue(patient.feeding)
					),
					isCardiac: isCardiac(
						"Alimentation",
						formatValue(patient.feeding)
					),
				},
				{
					label: "Poids",
					value: formatValue(patient.weight),
					badge: getMedicalBadge(
						"Poids",
						formatValue(patient.weight)
					),
					isCardiac: isCardiac("Poids", formatValue(patient.weight)),
				},
				{
					label: "Taille",
					value: formatValue(patient.height),
					badge: getMedicalBadge(
						"Taille",
						formatValue(patient.height)
					),
					isCardiac: isCardiac("Taille", formatValue(patient.height)),
				},
			],
		},
		{
			title: "Sphère ORL / Ophtalmo / Dentaire",
			icon: Eye,
			category: "sensory" as const,
			items: orlOphDentalItems,
		},
		{
			title: "Sphère viscérale / digestive",
			icon: Soup,
			category: "digestive" as const,
			items: [
				{
					label: "Médecin digestif",
					value: formatValue(patient.digestiveDoctorName),
					badge: getMedicalBadge(
						"Médecin digestif",
						formatValue(patient.digestiveDoctorName)
					),
					isCardiac: isCardiac(
						"Médecin digestif",
						formatValue(patient.digestiveDoctorName)
					),
				},
				{
					label: "Problèmes digestifs",
					value: formatValue(patient.digestiveProblems),
					badge: getMedicalBadge(
						"Problèmes digestifs",
						formatValue(patient.digestiveProblems)
					),
					isCardiac: isCardiac(
						"Problèmes digestifs",
						formatValue(patient.digestiveProblems)
					),
				},
				{
					label: "Transit intestinal",
					value: formatValue(patient.intestinal_transit),
					badge: getMedicalBadge(
						"Transit intestinal",
						formatValue(patient.intestinal_transit)
					),
					isCardiac: isCardiac(
						"Transit intestinal",
						formatValue(patient.intestinal_transit)
					),
				},
			],
		},
		{
			title: "Sphère neuro",
			icon: User,
			category: "general" as const,
			items: [
				{
					label: "Antécédents neurologiques",
					value: formatValue(patient.neurological_history),
					badge: getMedicalBadge(
						"Antécédents neurologiques",
						formatValue(patient.neurological_history)
					),
					isCardiac: isCardiac(
						"Antécédents neurologiques",
						formatValue(patient.neurological_history)
					),
				},
				{
					label: "Historique neurodéveloppemental",
					value: formatValue(patient.neurodevelopmental_history),
					badge: getMedicalBadge(
						"Historique neurodéveloppemental",
						formatValue(patient.neurodevelopmental_history)
					),
					isCardiac: isCardiac(
						"Historique neurodéveloppemental",
						formatValue(patient.neurodevelopmental_history)
					),
				},
				{
					label: "Examen des nerfs crâniens",
					value: formatValue(patient.cranial_nerve_exam),
					badge: getMedicalBadge(
						"Examen des nerfs crâniens",
						formatValue(patient.cranial_nerve_exam)
					),
					isCardiac: isCardiac(
						"Examen des nerfs crâniens",
						formatValue(patient.cranial_nerve_exam)
					),
				},
				{
					label: "Examen crânien",
					value: formatValue(patient.cranial_exam),
					badge: getMedicalBadge(
						"Examen crânien",
						formatValue(patient.cranial_exam)
					),
					isCardiac: isCardiac(
						"Examen crânien",
						formatValue(patient.cranial_exam)
					),
				},
				{
					label: "Examen membranes crâniennes",
					value: formatValue(patient.cranial_membrane_exam),
					badge: getMedicalBadge(
						"Examen membranes crâniennes",
						formatValue(patient.cranial_membrane_exam)
					),
					isCardiac: isCardiac(
						"Examen membranes crâniennes",
						formatValue(patient.cranial_membrane_exam)
					),
				},
				{
					label: "Examen des fascias",
					value: formatValue(patient.fascia_exam),
					badge: getMedicalBadge(
						"Examen des fascias",
						formatValue(patient.fascia_exam)
					),
					isCardiac: isCardiac(
						"Examen des fascias",
						formatValue(patient.fascia_exam)
					),
				},
				{
					label: "Examen vasculaire",
					value: formatValue(patient.vascular_exam),
					badge: getMedicalBadge(
						"Examen vasculaire",
						formatValue(patient.vascular_exam)
					),
					isCardiac: isCardiac(
						"Examen vasculaire",
						formatValue(patient.vascular_exam)
					),
				},
				{
					label: "Symptômes généraux",
					value: formatValue(patient.generalSymptoms),
					badge: getMedicalBadge(
						"Symptômes généraux",
						formatValue(patient.generalSymptoms)
					),
					isCardiac: isCardiac(
						"Symptômes généraux",
						formatValue(patient.generalSymptoms)
					),
				},
			],
		},
		{
			title: "Sphère périphérique",
			icon: Activity,
			category: "general" as const,
			items: [
				{ label: "Sous-section : Membres supérieurs", value: "" },
				...periphericSection[0].items.map((i) => ({
					...i,
					badge: getMedicalBadge(i.label, i.value),
					isCardiac: isCardiac(i.label, i.value),
				})),
				{ label: "Sous-section : Membres inférieurs", value: "" },
				...periphericSection[1].items.map((i) => ({
					...i,
					badge: getMedicalBadge(i.label, i.value),
					isCardiac: isCardiac(i.label, i.value),
				})),
			],
		},
		{
			title: "Sphère pelvienne/gynéco-uro",
			icon: Baby,
			category: "reproductive" as const,
			items: [
				{
					label: "Antécédents pelviens/gynéco-uro",
					value: formatValue(patient.pelvic_history),
					badge: getMedicalBadge(
						"Antécédents pelviens/gynéco-uro",
						formatValue(patient.pelvic_history)
					),
					isCardiac: isCardiac(
						"Antécédents pelviens/gynéco-uro",
						formatValue(patient.pelvic_history)
					),
				},
				{
					label: "Antécédents gynécologiques",
					value: formatValue(patient.gynecological_history),
					badge: getMedicalBadge(
						"Antécédents gynécologiques",
						formatValue(patient.gynecological_history)
					),
					isCardiac: isCardiac(
						"Antécédents gynécologiques",
						formatValue(patient.gynecological_history)
					),
				},
			],
		},
		{
			title: "Enfant : données enfant/pédiatrie",
			icon: Baby,
			category: "pediatric" as const,
			items: [
				{
					label: "Poids de naissance",
					value: formatValue(patient.weight_at_birth),
					badge: getMedicalBadge(
						"Poids de naissance",
						formatValue(patient.weight_at_birth)
					),
					isCardiac: isCardiac(
						"Poids de naissance",
						formatValue(patient.weight_at_birth)
					),
				},
				{
					label: "Taille de naissance",
					value: formatValue(patient.height_at_birth),
					badge: getMedicalBadge(
						"Taille de naissance",
						formatValue(patient.height_at_birth)
					),
					isCardiac: isCardiac(
						"Taille de naissance",
						formatValue(patient.height_at_birth)
					),
				},
				{
					label: "Périmètre crânien",
					value: formatValue(patient.head_circumference),
					badge: getMedicalBadge(
						"Périmètre crânien",
						formatValue(patient.head_circumference)
					),
					isCardiac: isCardiac(
						"Périmètre crânien",
						formatValue(patient.head_circumference)
					),
				},
				{
					label: "Score d'Apgar",
					value: formatValue(patient.apgar_score),
					badge: getMedicalBadge(
						"Score d'Apgar",
						formatValue(patient.apgar_score)
					),
					isCardiac: isCardiac(
						"Score d'Apgar",
						formatValue(patient.apgar_score)
					),
				},
				{
					label: "Mode de garde",
					value: formatValue(patient.childcare_type),
					badge: getMedicalBadge(
						"Mode de garde",
						formatValue(patient.childcare_type)
					),
					isCardiac: isCardiac(
						"Mode de garde",
						formatValue(patient.childcare_type)
					),
				},
				{
					label: "Niveau scolaire",
					value: formatValue(patient.school_grade),
					badge: getMedicalBadge(
						"Niveau scolaire",
						formatValue(patient.school_grade)
					),
					isCardiac: isCardiac(
						"Niveau scolaire",
						formatValue(patient.school_grade)
					),
				},
				{
					label: "Pédiatre",
					value: formatValue(patient.pediatrician_name),
					badge: getMedicalBadge(
						"Pédiatre",
						formatValue(patient.pediatrician_name)
					),
					isCardiac: isCardiac(
						"Pédiatre",
						formatValue(patient.pediatrician_name)
					),
				},
				{
					label: "Suivi paramédical",
					value: formatValue(patient.paramedical_followup),
					badge: getMedicalBadge(
						"Suivi paramédical",
						formatValue(patient.paramedical_followup)
					),
					isCardiac: isCardiac(
						"Suivi paramédical",
						formatValue(patient.paramedical_followup)
					),
				},
				{
					label: "Commentaires enfant",
					value: formatValue(patient.other_comments_child),
					badge: getMedicalBadge(
						"Commentaires enfant",
						formatValue(patient.other_comments_child)
					),
					isCardiac: isCardiac(
						"Commentaires enfant",
						formatValue(patient.other_comments_child)
					),
				},
			],
		},
	];

	const handleAppointmentSuccess = () => {
		onAppointmentCreated?.();
		setShowNewAppointmentForm(false);
	};

	const handlePatientUpdate = async (updatedData: PatientFormValues) => {
		if (onPatientUpdated) {
			try {
				setIsUpdating(true);
				await onPatientUpdated(updatedData);
				setShowEditPatientForm(false);
				toast.success("Informations mises à jour avec succès !");
			} catch (error) {
				console.error("Error updating patient:", error);
				toast.error("Erreur lors de la mise à jour");
			} finally {
				setIsUpdating(false);
			}
		}
	};

	// Gestionnaire pour le bouton Modifier
	const handleEditClick = () => {
		if (showNewAppointmentForm) {
			setShowNewAppointmentForm(false);
		}
		setShowEditPatientForm(!showEditPatientForm);
	};

	// Gestionnaire pour le bouton Nouvelle séance
	const handleNewAppointmentClick = () => {
		if (showEditPatientForm) {
			setShowEditPatientForm(false);
		}
		setShowNewAppointmentForm(!showNewAppointmentForm);
	};

	// Préparer les blocs cliniques
	const clinicalSections = [
		{
			field: patient.medical_examination,
			title: "Examen médical",
			icon: <ClipboardList className="h-5 w-5 text-indigo-700" />,
		},
		{
			field: patient.diagnosis,
			title: "Diagnostic",
			icon: <Stethoscope className="h-5 w-5 text-pink-700" />,
		},
		{
			field: patient.treatment_plan,
			title: "Plan de traitement",
			icon: <Syringe className="h-5 w-5 text-green-800" />,
		},
		{
			field: patient.consultation_conclusion,
			title: "Conclusion",
			icon: <CheckCircle2 className="h-5 w-5 text-blue-700" />,
		},
	];

	return (
		<div className="space-y-6 mt-6 p-6 bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
			{/* Boutons d'action */}
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Dossier médical</h3>
				<div className="fixed top-20 right-16 z-50 flex flex-col md:flex-row gap-2 items-end md:items-center">
					<Button
						onClick={handleEditClick}
						variant={showEditPatientForm ? "outline" : "default"}
						className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 hover:text-white text-white dark:bg-white dark:text-slate-900 dark:hover:bg-white/80 text-sm md:text-base px-3 md:px-4 py-2"
						disabled={isUpdating}
					>
						{showEditPatientForm ? (
							<>
								<X className="h-4 w-4 bg-red-700 hover:text-white dark:text-white" />
								Annuler
							</>
						) : (
							<>
								<Edit className="h-4 w-4" />
								{isUpdating ? "Mise à jour..." : "Modifier"}
							</>
						)}
					</Button>
					<Button
						onClick={handleNewAppointmentClick}
						variant={showNewAppointmentForm ? "outline" : "default"}
						className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-white/80 hover:text-white text-sm md:text-base px-3 md:px-4 py-2"
					>
						{showNewAppointmentForm ? (
							<>
								<X className="h-4 w-4 bg-red-700 hover:text-white dark:text-white" />
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
							Modifier les informations de {
								patient.firstName
							}{" "}
							{patient.lastName}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<PatientForm
							patient={patient}
							onSave={handlePatientUpdate}
							selectedCabinetId={selectedCabinetId}
							isLoading={isUpdating}
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
							Nouvelle séance pour {patient.firstName}{" "}
							{patient.lastName}
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

			{/* Affichage des sphères sous forme d'accordéon avec icônes */}
			<MedicalAccordion
				sections={spheres.map((sphere) => ({
					title: sphere.title,
					icon: sphere.icon,
					category: sphere.category,
					items: sphere.items.map((item) => ({
						...item,
						// Ajout CSS text-red-600 si cardiaque pour <dt> (texte rouge)
						isCritical: item.isCardiac,
						isImportant: item.badge === "important",
						badge: item.badge, // être passé à l'accordéon si besoin
					})),
					defaultOpen: sphere.defaultOpen || false,
				}))}
			/>
			{/* plus de sections si besoin */}
		</div>
	);
}
