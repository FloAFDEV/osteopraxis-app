
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicalInfoCard } from "@/components/patients/medical-info-card";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { differenceInYears, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, History, X, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { AppointmentStatusDropdown } from "./AppointmentStatusDropdown";
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
	onUpdateAppointmentStatus,
	onNavigateToHistory,
}: MedicalInfoTabProps) {
	const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(
		"COMPLETED"
	);
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
				<Card className="border-blue-100 dark:border-blue-900/50">
					<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg">
						<CardTitle className="text-lg flex flex-wrap items-center gap-2">
							<Calendar className="h-5 w-5 text-blue-500" />
							Dernière séance (
							{format(new Date(lastAppointment.date), "dd MMMM yyyy", {
								locale: fr,
							})}
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
						label: "Chirurgie",
						value: patient.surgicalHistory || "Aucun antécédent",
					},
					{
						label: "Traumatismes",
						value: patient.traumaHistory || "Aucun antécédent",
					},
					{
						label: "Rhumatologie",
						value:
							patient.rheumatologicalHistory || "Aucun antécédent",
					},
				]}
			/>

			<MedicalInfoCard
				title="Ophtalmologie"
				items={[
					{
						label: "Correction de la vue",
						value: patient.hasVisionCorrection ? "Oui" : "Non",
					},
					{
						label: "Ophtalmologue",
						value: patient.ophtalmologistName || "Non renseigné",
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
						label: "Médecin digestif",
						value: patient.digestiveDoctorName || "Non renseigné",
					},
				]}
			/>

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

			{/* Nouvelle section pour les patients pédiatriques */}
			{isChild && (
				<MedicalInfoCard
					title="Informations pédiatriques"
					items={[
						{
							label: "Grossesse",
							value: patient.pregnancyHistory || "Non renseigné",
						},
						{
							label: "Naissance",
							value: patient.birthDetails || "Non renseigné",
						},
						{
							label: "Développement moteur",
							value: patient.developmentMilestones || "Non renseigné",
						},
						{
							label: "Sommeil",
							value: patient.sleepingPattern || "Non renseigné",
						},
						{
							label: "Alimentation",
							value: patient.feeding || "Non renseigné",
						},
						{
							label: "Comportement",
							value: patient.behavior || "Non renseigné",
						},
						{
							label: "Mode de garde / Contexte",
							value: patient.childCareContext || "Non renseigné",
						},
					]}
				/>
			)}

			{pastAppointments.length > 1 && (
				<div className="flex justify-end mt-6">
					<Button
						variant="outline"
						onClick={onNavigateToHistory}
						className="flex items-center"
					>
						<History className="w-4 h-4 mr-2" />
						Voir historique complet ({pastAppointments.length} séances)
					</Button>
				</div>
			)}
		</div>
	);
}
