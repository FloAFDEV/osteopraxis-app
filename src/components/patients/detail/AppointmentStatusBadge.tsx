
import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/types";
import { 
	AlertCircle, 
	Calendar, 
	Check, 
	Clock, 
	X, 
	UserCheck,
	CircleCheck,
	CircleX,
	Ban,
	RotateCcw
} from "lucide-react";

interface AppointmentStatusBadgeProps {
	status: AppointmentStatus;
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
	const getStatusBadgeColor = (status: AppointmentStatus): string => {
		switch (status) {
			case "SCHEDULED":
				return "bg-blue-500";
			case "COMPLETED":
				return "bg-green-500";
			case "CANCELED":
				return "bg-red-500";
			case "RESCHEDULED":
				return "bg-amber-500";
			case "NO_SHOW":
				return "bg-gray-500";
			default:
				return "bg-gray-500";
		}
	};

	const getStatusIcon = (status: AppointmentStatus) => {
		switch (status) {
			case "SCHEDULED":
				return <Calendar className="h-3 w-3 mr-1" />;
			case "COMPLETED":
				return <CircleCheck className="h-3 w-3 mr-1" />;
			case "CANCELED":
				return <Ban className="h-3 w-3 mr-1" />;
			case "RESCHEDULED":
				return <RotateCcw className="h-3 w-3 mr-1" />;
			case "NO_SHOW":
				return <CircleX className="h-3 w-3 mr-1" />;
			default:
				return <Clock className="h-3 w-3 mr-1" />;
		}
	};

	const getStatusLabel = (status: AppointmentStatus): string => {
		switch (status) {
			case "SCHEDULED":
				return "Planifiée";
			case "COMPLETED":
				return "Terminée";
			case "CANCELED":
				return "Annulée";
			case "RESCHEDULED":
				return "Reportée";
			case "NO_SHOW":
				return "Absence";
			default:
				return status;
		}
	};

	return (
		<Badge className={`text-white ${getStatusBadgeColor(status)}`}>
			<span className="flex items-center">
				{getStatusIcon(status)}
				{getStatusLabel(status)}
			</span>
		</Badge>
	);
}
