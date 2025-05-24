import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Edit, FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface PatientHeaderProps {
	patientId: number;
}

export function PatientHeader({ patientId }: PatientHeaderProps) {
	return (
		<div className="flex justify-between items-start">
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" asChild>
					<Link to="/patients">
						<ArrowLeft className="mr-2 h-4 w-4 text-blue-500" />
						Retour
					</Link>
				</Button>
			</div>

			<div className="flex gap-2">
				<Button variant="outline" asChild>
					<Link to={`/patients/${patientId}/edit`}>
						<Edit className="mr-2 h-4 w-4 text-amber-500" />
						Modifier
					</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link to={`/appointments?patientId=${patientId}`}>
						<Calendar className="mr-2 h-4 w-4 text-purple-500" />
						Voir toutes les séances
					</Link>
				</Button>
				<Button variant="outline" asChild>
					<Link to={`/appointments/new?patientId=${patientId}`}>
						<Calendar className="mr-2 h-4 w-4 text-purple-600" />
						Séance planifiée
					</Link>
				</Button>
				<Button asChild>
					<Link to={`/appointments/immediate?patientId=${patientId}`}>
						<FileText className="mr-2 h-4 w-4 text-green-500" />
						Séance immédiate
					</Link>
				</Button>
			</div>
		</div>
	);
}
