
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointment-form";
import { Patient } from "@/types";

interface NewAppointmentModalProps {
	isOpen: boolean;
	onClose: () => void;
	patient: Patient;
	onSuccess?: () => void;
}

export function NewAppointmentModal({ 
	isOpen, 
	onClose, 
	patient,
	onSuccess 
}: NewAppointmentModalProps) {
	const handleSuccess = () => {
		onSuccess?.();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">
						Nouvelle séance pour {patient.firstName} {patient.lastName}
					</DialogTitle>
				</DialogHeader>
				<div className="mt-4">
					<AppointmentForm
						defaultValues={{
							patientId: patient.id,
							date: new Date(),
							time: "09:00",
							status: "SCHEDULED",
							website: "",
						}}
						onSuccess={handleSuccess}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
