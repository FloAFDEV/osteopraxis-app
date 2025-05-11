import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
interface EmptyPatientStateProps {
	searchQuery: string;
	activeLetter: string;
	onClearFilter: () => void;
	onCreateTestPatient: () => void;
}
const EmptyPatientState: React.FC<EmptyPatientStateProps> = ({
	searchQuery,
	activeLetter,
	onClearFilter,
}) => {
	return (
		<Card className="w-full">
			<CardContent className="pt-6">
				<div className="text-center py-10 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-dashed">
					<div className="mb-4 relative w-24 h-24 mx-auto">
						<div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
						<Users className="h-12 w-12 text-blue-500 absolute inset-0 m-auto" />
					</div>
					<h3 className="text-xl font-medium mb-2">
						Aucun patient trouvé
					</h3>
					<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
						{searchQuery || activeLetter
							? "Aucun patient ne correspond à vos critères de recherche."
							: "Aucun patient n'a été ajouté pour le moment."}
					</p>
					<div className="flex flex-wrap justify-center gap-3">
						{(searchQuery || activeLetter) && (
							<Button onClick={onClearFilter} variant="outline">
								Afficher tous les patients
							</Button>
						)}

						<Button
							asChild
							variant="outline"
							className="border-blue-500/30 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
						>
							<Link to="/patients/new">
								<Plus className="mr-2 h-4 w-4" /> Créer un
								nouveau patient
							</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
export default EmptyPatientState;
