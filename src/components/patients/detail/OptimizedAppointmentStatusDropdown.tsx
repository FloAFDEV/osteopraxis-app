
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppointmentStatus } from "@/types";
import { AlertCircle, Calendar, Check, Clock, X } from "lucide-react";
import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { useState } from "react";
import { toast } from "sonner";

interface OptimizedAppointmentStatusDropdownProps {
	status: AppointmentStatus;
	onStatusChange: (status: AppointmentStatus) => Promise<void>;
}

export function OptimizedAppointmentStatusDropdown({ 
	status, 
	onStatusChange 
}: OptimizedAppointmentStatusDropdownProps) {
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStatusChange = async (newStatus: AppointmentStatus) => {
		if (newStatus === status || isUpdating) return;
		
		setIsUpdating(true);
		try {
			await onStatusChange(newStatus);
			toast.success(`Statut modifié en "${getStatusLabel(newStatus)}"`);
		} catch (error) {
			console.error('Error updating status:', error);
			toast.error("Impossible de modifier le statut");
		} finally {
			setIsUpdating(false);
		}
	};

	const getStatusLabel = (status: AppointmentStatus): string => {
		switch (status) {
			case "SCHEDULED": return "Planifiée";
			case "COMPLETED": return "Terminée";
			case "CANCELED": return "Annulée";
			case "RESCHEDULED": return "Reportée";
			case "NO_SHOW": return "Absence";
			default: return status;
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button 
					variant="ghost" 
					size="sm" 
					className="h-8 px-2 py-1"
					disabled={isUpdating}
				>
					<AppointmentStatusBadge status={status} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem 
					onClick={() => handleStatusChange("SCHEDULED")}
					disabled={isUpdating}
				>
					<Clock className="mr-2 h-4 w-4" />
					Planifiée
				</DropdownMenuItem>
				<DropdownMenuItem 
					onClick={() => handleStatusChange("COMPLETED")}
					disabled={isUpdating}
				>
					<Check className="mr-2 h-4 w-4" />
					Terminée
				</DropdownMenuItem>
				<DropdownMenuItem 
					onClick={() => handleStatusChange("CANCELED")}
					disabled={isUpdating}
				>
					<X className="mr-2 h-4 w-4" />
					Annulée
				</DropdownMenuItem>
				<DropdownMenuItem 
					onClick={() => handleStatusChange("RESCHEDULED")}
					disabled={isUpdating}
				>
					<Calendar className="mr-2 h-4 w-4" />
					Reportée
				</DropdownMenuItem>
				<DropdownMenuItem 
					onClick={() => handleStatusChange("NO_SHOW")}
					disabled={isUpdating}
				>
					<AlertCircle className="mr-2 h-4 w-4" />
					Absence
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
