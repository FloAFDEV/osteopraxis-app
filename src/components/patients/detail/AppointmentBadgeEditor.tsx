
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { 
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AppointmentStatus } from "@/types";
import { Edit } from "lucide-react";

interface AppointmentBadgeEditorProps {
	currentStatus: AppointmentStatus;
	onStatusChange: (status: AppointmentStatus) => Promise<void>;
}

const statusOptions = [
	{ value: "SCHEDULED", label: "Planifiée", color: "bg-blue-100 text-blue-800" },
	{ value: "COMPLETED", label: "Terminée", color: "bg-green-100 text-green-800" },
	{ value: "CANCELED", label: "Annulée", color: "bg-red-100 text-red-800" },
	{ value: "RESCHEDULED", label: "Reportée", color: "bg-yellow-100 text-yellow-800" },
	{ value: "NO_SHOW", label: "Absence", color: "bg-gray-100 text-gray-800" },
] as const;

export function AppointmentBadgeEditor({ currentStatus, onStatusChange }: AppointmentBadgeEditorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(currentStatus);
	const [isLoading, setIsLoading] = useState(false);

	const currentOption = statusOptions.find(option => option.value === currentStatus);

	const handleSave = async () => {
		if (selectedStatus !== currentStatus) {
			setIsLoading(true);
			try {
				await onStatusChange(selectedStatus);
				setIsOpen(false);
			} catch (error) {
				console.error("Erreur lors de la mise à jour du statut:", error);
			} finally {
				setIsLoading(false);
			}
		} else {
			setIsOpen(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-auto p-1 hover:bg-gray-100"
				>
					<div className="flex items-center gap-1">
						<Badge className={currentOption?.color}>
							{currentOption?.label}
						</Badge>
						<Edit className="h-3 w-3 text-gray-400" />
					</div>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Modifier le statut de la séance</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium">Nouveau statut :</label>
						<Select value={selectedStatus} onValueChange={(value: AppointmentStatus) => setSelectedStatus(value)}>
							<SelectTrigger className="w-full mt-1">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										<Badge className={option.color}>
											{option.label}
										</Badge>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setIsOpen(false)}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button
							onClick={handleSave}
							disabled={isLoading || selectedStatus === currentStatus}
						>
							{isLoading ? "Enregistrement..." : "Enregistrer"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
