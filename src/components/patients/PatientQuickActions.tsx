
import { Button } from "@/components/ui/button";
import { Patient } from "@/types";
import { Calendar, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface PatientQuickActionsProps {
	patient: Patient;
	variant?: "compact" | "full";
}

export function PatientQuickActions({ patient, variant = "full" }: PatientQuickActionsProps) {
	const handleEmailClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const handlePhoneClick = (e: React.MouseEvent) => {
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
				{patient.phone && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
						asChild
						onClick={handlePhoneClick}
					>
						<a href={`tel:${patient.phone}`}>
							<Phone className="h-4 w-4" />
						</a>
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="flex gap-2 flex-wrap">
			<Button
				variant="outline"
				size="sm"
				className="h-8 px-3 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
				asChild
				onClick={handleNewAppointmentClick}
			>
				<Link to={`/appointments/new?patientId=${patient.id}`}>
					<Calendar className="h-3 w-3 mr-1" />
					RDV
				</Link>
			</Button>
			
			{patient.email && (
				<Button
					variant="outline"
					size="sm"
					className="h-8 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
					asChild
					onClick={handleEmailClick}
				>
					<a href={`mailto:${patient.email}`}>
						<Mail className="h-3 w-3 mr-1" />
						Email
					</a>
				</Button>
			)}
			
			{patient.phone && (
				<Button
					variant="outline"
					size="sm"
					className="h-8 px-3 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
					asChild
					onClick={handlePhoneClick}
				>
					<a href={`tel:${patient.phone}`}>
						<Phone className="h-3 w-3 mr-1" />
						Appel
					</a>
				</Button>
			)}
		</div>
	);
}
