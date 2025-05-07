
import { MedicalInfoCard } from "@/components/patients/medical-info-card";
import { Appointment, AppointmentStatus, Invoice, Patient } from "@/types";
import { PatientInfo } from "./PatientInfo";
import { PatientDetailTabs } from "./PatientDetailTabs";

interface PatientDetailContentProps {
	patient: Patient;
	upcomingAppointments: Appointment[];
	pastAppointments: Appointment[];
	invoices: Invoice[];
	onCancelAppointment: (appointmentId: number) => Promise<void>;
	onUpdateAppointmentStatus: (appointmentId: number, status: AppointmentStatus) => Promise<void>;
	viewMode: "cards" | "table";
	setViewMode: (mode: "cards" | "table") => void;
}

export function PatientDetailContent({
	patient,
	upcomingAppointments,
	pastAppointments,
	invoices,
	onCancelAppointment,
	onUpdateAppointmentStatus,
	viewMode,
	setViewMode
}: PatientDetailContentProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Left column - Patient info */}
			<div className="space-y-6">
				<PatientInfo patient={patient} />

				<MedicalInfoCard
					title="Informations personnelles"
					items={[
						{
							label: "Statut marital",
							value:
								patient.maritalStatus === "SINGLE"
									? "Célibataire"
									: patient.maritalStatus ===
									  "MARRIED"
									? "Marié(e)"
									: patient.maritalStatus ===
									  "DIVORCED"
									? "Divorcé(e)"
									: patient.maritalStatus ===
									  "WIDOWED"
									? "Veuf/Veuve"
									: patient.maritalStatus ===
									  "PARTNERED"
									? "En couple"
									: patient.maritalStatus ===
									  "ENGAGED"
									? "Fiancé(e)"
									: "Non spécifié",
						},
						{
							label: "Enfants",
							value:
								patient.childrenAges &&
								patient.childrenAges.length > 0
									? `${
											patient.childrenAges.length
									  } enfant(s) (${patient.childrenAges
											.sort((a, b) => a - b)
											.join(", ")} ans)`
									: "Pas d'enfants",
						},
						{
							label: "Latéralité",
							value:
								patient.handedness === "RIGHT"
									? "Droitier(ère)"
									: patient.handedness === "LEFT"
									? "Gaucher(ère)"
									: patient.handedness ===
									  "AMBIDEXTROUS"
									? "Ambidextre"
									: "Non spécifié",
						},
						{
							label: "Fumeur",
							value: patient.isSmoker ? "Oui" : "Non",
						},
						{
							label: "Contraception",
							value:
								patient.contraception === "NONE"
									? "Aucune"
									: patient.contraception === "PILL"
									? "Pilule"
									: patient.contraception === "IUD"
									? "Stérilet"
									: patient.contraception === "OTHER"
									? "Autre"
									: "Non spécifié",
						},
					]}
				/>
			</div>

			<div className="lg:col-span-2">
				<PatientDetailTabs
					patient={patient}
					upcomingAppointments={upcomingAppointments}
					pastAppointments={pastAppointments}
					invoices={invoices}
					onCancelAppointment={onCancelAppointment}
					onUpdateAppointmentStatus={onUpdateAppointmentStatus}
					viewMode={viewMode}
					setViewMode={setViewMode}
				/>
			</div>
		</div>
	);
}
