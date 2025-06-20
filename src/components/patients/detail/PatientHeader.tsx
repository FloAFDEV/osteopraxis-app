
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PatientHeaderProps {
	patientId: number;
}

export function PatientHeader({ patientId }: PatientHeaderProps) {
	return (
		<div className="flex justify-between items-start p-4">
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" asChild>
					<Link to="/patients">
						<ArrowLeft className="mr-2 h-4 w-4 text-blue-500" />
						Retour
					</Link>
				</Button>
			</div>
		</div>
	);
}
