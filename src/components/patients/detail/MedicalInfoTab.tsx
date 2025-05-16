import { MedicalInfoCard } from "@/components/patients/medical-info-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { differenceInYears, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";

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
	const [selectedStatus, setSelectedStatus] =
		useState<AppointmentStatus>("COMPLETED");
	const [isChild, setIsChild] = useState<boolean>(false);

	const lastAppointment =
		pastAppointments && pastAppointments.length > 0
			? pastAppointments[0]
			: null;

	// Déterminer si c'est un enfant (moins de 17 ans)
	useEffect(() => {
		if (patient.birthDate) {
			const age = differenceInYears(
				new Date(),
				new Date(patient.birthDate)
			);
			setIsChild(age < 17);
		}
	}, [patient.birthDate]);

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

			<MedicalInfoCard
				title="Informations médicales générales"
				items={[
					{
						label: "Médecin généraliste",
						value: patient.generalPractitioner || "Non renseigné",
					},
					{
						label: "Traitement actuel",
						value: patient.currentTreatment || "Aucun",
					},
					{
						label: "Antécédents médicaux familiaux",
						value: patient.familyStatus || "Non renseigné",
					},
					{
						label: "Chirurgie",
						value: patient.surgicalHistory || "Aucun antécédent",
					},
					{
						label: "Fractures",
						value: patient.fracture_history || "Aucun antécédent",
					},
					{
						label: "Traumatismes",
						value: patient.traumaHistory || "Aucun antécédent",
					},
					{
						label: "Rhumatologie",
						value:
							patient.rheumatologicalHistory ||
							"Aucun antécédent",
					},
				]}
			/>

			<MedicalInfoCard
				title="Activité physique / Sommeil"
				items={[
					{
						label: "Activité physique",
						value: patient.physicalActivity || "Non renseigné",
					},
					{
						label: "Fréquence sportive",
						value: patient.sport_frequency || "Non renseigné",
					},
					{
						label: "Qualité du sommeil",
						value: patient.sleep_quality || "Non renseigné",
					},
				]}
			/>

			<MedicalInfoCard
				title="Ophtalmologie / Dentaire"
				items={[
					{
						label: "Correction de la vue",
						value: patient.hasVisionCorrection ? "Oui" : "Non",
					},
					{
						label: "Ophtalmologue",
						value: patient.ophtalmologistName || "Non renseigné",
					},
					{
						label: "Santé dentaire",
						value: patient.dental_health || "Non renseigné",
					},
				]}
			/>

			<MedicalInfoCard
				title="ORL"
				items={[
					{
						label: "Problèmes ORL",
						value: patient.entProblems || "Aucun",
					},
					{
						label: "Médecin ORL",
						value: patient.entDoctorName || "Non renseigné",
					},
					{
						label: "Suivi ORL",
						value: patient.ent_followup || "Non renseigné",
					},
				]}
			/>

			<MedicalInfoCard
				title="Digestif"
				items={[
					{
						label: "Problèmes digestifs",
						value: patient.digestiveProblems || "Aucun",
					},
					{
						label: "Transit intestinal",
						value: patient.intestinal_transit || "Non renseigné",
					},
					{
						label: "Médecin digestif",
						value: patient.digestiveDoctorName || "Non renseigné",
					},
				]}
			/>

			{!isChild && (
				<MedicalInfoCard
					title="Gynécologique"
					items={[
						{
							label: "Contraception",
							value: patient.contraception
								? String(patient.contraception)
								: "Non renseigné",
						},
						{
							label: "Antécédents gynécologiques",
							value:
								patient.gynecological_history ||
								"Non renseigné",
						},
					]}
				/>
			)}

			{/* Nouvelle section pour tous les patients */}
			<MedicalInfoCard
				title="Anamnèse complémentaire"
				items={[
					{
						label: "Examens complémentaires",
						value: patient.complementaryExams || "Aucun",
					},
					{
						label: "Symptômes généraux",
						value: patient.generalSymptoms || "Non renseignés",
					},
				]}
			/>

			{/* Commentaires additionnels adultes */}
			{!isChild && patient.other_comments_adult && (
				<MedicalInfoCard
					title="Autres commentaires"
					items={[
						{
							label: "Notes supplémentaires",
							value: patient.other_comments_adult,
						},
					]}
				/>
			)}

			{/* Sections spécifiques aux enfants */}
			{isChild && (
				<>
					<MedicalInfoCard
						title="Informations pédiatriques générales"
						items={[
							{
								label: "Grossesse",
								value:
									patient.pregnancyHistory || "Non renseigné",
							},
							{
								label: "Naissance",
								value: patient.birthDetails || "Non renseigné",
							},
							{
								label: "Score APGAR",
								value: patient.apgar_score || "Non renseigné",
							},
							{
								label: "Poids à la naissance",
								value: patient.weight_at_birth
									? `${patient.weight_at_birth} g`
									: "Non renseigné",
							},
							{
								label: "Taille à la naissance",
								value: patient.height_at_birth
									? `${patient.height_at_birth} cm`
									: "Non renseigné",
							},
							{
								label: "Périmètre crânien",
								value: patient.head_circumference
									? `${patient.head_circumference} cm`
									: "Non renseigné",
							},
						]}
					/>

					<MedicalInfoCard
						title="Développement et suivi"
						items={[
							{
								label: "Développement moteur",
								value:
									patient.developmentMilestones ||
									"Non renseigné",
							},
							{
								label: "Motricité fine",
								value:
									patient.fine_motor_skills ||
									"Non renseigné",
							},
							{
								label: "Motricité globale",
								value:
									patient.gross_motor_skills ||
									"Non renseigné",
							},
							{
								label: "Sommeil",
								value:
									patient.sleepingPattern || "Non renseigné",
							},
							{
								label: "Alimentation",
								value: patient.feeding || "Non renseigné",
							},
							{
								label: "Comportement",
								value: patient.behavior || "Non renseigné",
							},
						]}
					/>

					<MedicalInfoCard
						title="Environnement et suivi"
						items={[
							{
								label: "Mode de garde",
								value:
									patient.childcare_type || "Non renseigné",
							},
							{
								label: "Niveau scolaire",
								value: patient.school_grade || "Non renseigné",
							},
							{
								label: "Pédiatre",
								value:
									patient.pediatrician_name ||
									"Non renseigné",
							},
							{
								label: "Suivis paramédicaux",
								value:
									patient.paramedical_followup ||
									"Non renseigné",
							},
							{
								label: "Contexte de garde",
								value:
									patient.childCareContext || "Non renseigné",
							},
						]}
					/>

					{/* Commentaires additionnels enfants */}
					{patient.other_comments_child && (
						<MedicalInfoCard
							title="Autres commentaires"
							items={[
								{
									label: "Notes supplémentaires",
									value: patient.other_comments_child,
								},
							]}
						/>
					)}
				</>
			)}
		</div>
	);
}
