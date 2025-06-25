
import { AppointmentForm } from "@/components/appointment-form";
import { Patient } from "@/types";
import { Calendar } from "lucide-react";

interface NewAppointmentTabProps {
	patient: Patient;
	onAppointmentCreated: (newAppointment?: any) => void;
}

export function NewAppointmentTab({
	patient,
	onAppointmentCreated
}: NewAppointmentTabProps) {
	return (
		<div className="space-y-6 mt-6">
			<header className="mb-6">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<Calendar className="h-6 w-6 text-purple-500" />
					Nouvelle séance pour {patient.firstName} {patient.lastName}
				</h2>
				<p className="text-gray-500 mt-2">
					Créez une séance en remplissant le formulaire ci-dessous. 
					Ajoutez un motif et un compte rendu pour suivre l'historique du patient.
				</p>
			</header>

			<section className="rounded-lg border border-gray-200 shadow-sm p-6">
				<AppointmentForm
					defaultValues={{
						patientId: patient.id,
						date: new Date(),
						time: "09:00",
						status: "SCHEDULED",
						website: "", // Initialiser le honeypot
					}}
					onSuccess={onAppointmentCreated}
				/>
			</section>
		</div>
	);
}
