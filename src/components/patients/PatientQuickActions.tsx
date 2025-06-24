import { Button } from "@/components/ui/button";
import { Patient } from "@/types";
import { Calendar, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface PatientQuickActionsProps {
	patient: Patient;
	variant?: "compact" | "full";
}

export function PatientQuickActions({
	patient,
	variant = "full",
}: PatientQuickActionsProps) {
	const handleEmailClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const handleNewAppointmentClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	if (variant === "compact") {
		return (
			<div className="flex gap-1">
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0"
					asChild
					onClick={handleNewAppointmentClick}
				>
					<Link to={`/appointments/new?patientId=${patient.id}`}>
						<Calendar className="h-4 w-4" />
					</Link>
				</Button>
				{patient.email && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
						asChild
						onClick={handleEmailClick}
					>
						<a href={`mailto:${patient.email}`}>
							<Mail className="h-4 w-4" />
						</a>
					</Button>
				)}
			</div>
		);
	}
}
