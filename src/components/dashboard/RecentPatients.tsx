import { Patient } from "@/types";
import { Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RecentPatientsProps {
	patients: Patient[];
}

export function RecentPatients({ patients }: RecentPatientsProps) {
	// Trier par date de création (plus récent en premier)
	const recentPatients = [...patients]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 5);

	const count = recentPatients.length;

	return (
		<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
			{/* Header */}
			<div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
				<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
					Patients récents
				</h2>
			</div>

			{/* Content */}
			<div className="divide-y divide-gray-100 dark:divide-gray-800">
				{count === 0 ? (
					<div className="px-4 py-6 text-center">
						<Users className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Aucun patient
						</p>
						<Link
							to="/patients/new"
							className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
						>
							Ajouter un patient
						</Link>
					</div>
				) : (
					recentPatients.map((patient) => (
						<Link
							key={patient.id}
							to={`/patients/${patient.id}`}
							className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
						>
							<span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
								<span className="font-medium text-gray-900 dark:text-gray-100">
									{patient.lastName}
								</span>{" "}
								{patient.firstName}
							</span>
							<ChevronRight className="h-4 w-4 text-gray-400" />
						</Link>
					))
				)}
			</div>

			{/* Footer */}
			<div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
				<Link
					to="/patients"
					className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
				>
					<span>Tous les patients</span>
					<ChevronRight className="h-4 w-4" />
				</Link>
			</div>
		</div>
	);
}
