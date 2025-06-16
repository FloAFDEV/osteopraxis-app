
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AppointmentStatus } from "@/types";

interface AppointmentBadgeEditorProps {
	currentStatus: AppointmentStatus;
	onStatusChange: (status: AppointmentStatus) => Promise<void>;
}

const statusOptions = [
	{ value: "SCHEDULED", label: "Planifiée", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
	{ value: "COMPLETED", label: "Terminée", color: "bg-green-100 text-green-800 hover:bg-green-200" },
	{ value: "CANCELED", label: "Annulée", color: "bg-red-100 text-red-800 hover:bg-red-200" },
	{ value: "RESCHEDULED", label: "Reportée", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
	{ value: "NO_SHOW", label: "Absence", color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
] as const;

export function AppointmentBadgeEditor({ currentStatus, onStatusChange }: AppointmentBadgeEditorProps) {
	const [isLoading, setIsLoading] = useState(false);

	const currentOption = statusOptions.find(option => option.value === currentStatus);

	const handleStatusChange = async (newStatus: AppointmentStatus) => {
		if (newStatus !== currentStatus) {
			setIsLoading(true);
			try {
				await onStatusChange(newStatus);
			} catch (error) {
				console.error("Erreur lors de la mise à jour du statut:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<Select 
			value={currentStatus} 
			onValueChange={handleStatusChange}
			disabled={isLoading}
		>
			<SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent hover:bg-gray-50 transition-colors duration-200">
				<SelectValue>
					<Badge className={`${currentOption?.color} transition-colors duration-200 cursor-pointer`}>
						{isLoading ? "Mise à jour..." : currentOption?.label}
					</Badge>
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
				{statusOptions.map((option) => (
					<SelectItem key={option.value} value={option.value} className="cursor-pointer">
						<Badge className={`${option.color} transition-colors duration-200`}>
							{option.label}
						</Badge>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
