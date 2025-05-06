
import { MedicalInfoCard } from "@/components/patients/medical-info-card";
import { Patient } from "@/types";
import { RecentAppointmentsCard } from "./RecentAppointmentsCard";
import { Appointment, AppointmentStatus } from "@/types";

interface MedicalInfoTabProps {
	patient: Patient;
	pastAppointments: Appointment[];
	onUpdateAppointmentStatus: (appointmentId: number, status: AppointmentStatus) => Promise<void>;
	onNavigateToHistory: () => void;
}

export function MedicalInfoTab({
	patient,
	pastAppointments,
	onUpdateAppointmentStatus,
	onNavigateToHistory
}: MedicalInfoTabProps) {
	return (
		<div className="space-y-6 mt-6">
			<MedicalInfoCard
				title="Médecins et spécialistes"
				items={[
					{
						label: "Médecin traitant",
						value: patient.generalPractitioner,
					},
					{
						label: "Ophtalmologiste",
						value: patient.ophtalmologistName,
					},
					{
						label: "ORL",
						value: patient.entDoctorName,
					},
					{
						label: "Gastro-entérologue",
						value: patient.digestiveDoctorName,
					},
				]}
			/>

			<MedicalInfoCard
				title="Antécédents médicaux"
				items={[
					{
						label: "Traitement actuel",
						value: patient.currentTreatment,
						showSeparatorAfter: true,
					},
					{
						label: "Antécédents chirurgicaux",
						value: patient.surgicalHistory,
					},
					{
						label: "Antécédents traumatiques",
						value: patient.traumaHistory,
					},
					{
						label: "Antécédents rhumatologiques",
						value: patient.rheumatologicalHistory,
						showSeparatorAfter: true,
					},
					{
						label: "Problèmes digestifs",
						value: patient.digestiveProblems,
					},
					{
						label: "Problèmes ORL",
						value: patient.entProblems,
					},
					{
						label: "Correction visuelle",
						value: patient.hasVisionCorrection
							? "Oui"
							: "Non",
					},
				]}
			/>

			{/* Aperçu des dernières séances */}
			<RecentAppointmentsCard 
				appointments={pastAppointments} 
				onStatusChange={onUpdateAppointmentStatus}
				onNavigateToHistory={onNavigateToHistory}
			/>
		</div>
	);
}
