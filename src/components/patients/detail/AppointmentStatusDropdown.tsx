
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppointmentStatus } from "@/types";
import { AlertCircle, Calendar, Check, Clock, X } from "lucide-react";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";

interface AppointmentStatusDropdownProps {
	status: AppointmentStatus;
	onStatusChange: (status: AppointmentStatus) => void;
}

export function AppointmentStatusDropdown({ 
	status, 
	onStatusChange 
}: AppointmentStatusDropdownProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 px-2 py-1">
					<AppointmentStatusBadge status={status} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => onStatusChange("SCHEDULED")}>
					<Clock className="mr-2 h-4 w-4" />
					Planifiée
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onStatusChange("COMPLETED")}>
					<Check className="mr-2 h-4 w-4" />
					Terminée
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onStatusChange("CANCELED")}>
					<X className="mr-2 h-4 w-4" />
					Annulée
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onStatusChange("RESCHEDULED")}>
					<Calendar className="mr-2 h-4 w-4" />
					Reportée
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => onStatusChange("NO_SHOW")}>
					<AlertCircle className="mr-2 h-4 w-4" />
					Absence
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
