import { Patient } from "@/types";
import { Users, ChevronRight, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

interface RecentPatientsProps {
	patients: Patient[];
}

export function RecentPatients({ patients }: RecentPatientsProps) {
	const recentPatients = [...patients]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 5);

	const count = recentPatients.length;
	const totalPatients = patients.length;

	return (
		<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 border-b border-gray-100 dark:border-gray-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
							<Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
						</div>
						<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							Patients récents
						</h2>
					</div>
					<span className="text-xs text-gray-500 dark:text-gray-400">
						{totalPatients} au total
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="divide-y divide-gray-100 dark:divide-gray-800">
				{count === 0 ? (
					<div className="px-4 py-8 text-center">
						<Users className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Aucun patient
						</p>
						<Link
							to="/patients/new"
							className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
						>
							<UserPlus className="h-3 w-3" />
							Ajouter un patient
						</Link>
					</div>
				) : (
					recentPatients.map((patient, index) => (
						<Link
							key={patient.id}
							to={`/patients/${patient.id}`}
							className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
								index === 0 ? "bg-slate-50/50 dark:bg-slate-900/30" : ""
							}`}
						>
							<div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center mr-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
								{patient.firstName?.[0]}{patient.lastName?.[0]}
							</div>
							<span className="flex-1 text-sm truncate">
								<span className="font-medium text-gray-900 dark:text-gray-100">
									{patient.lastName}
								</span>{" "}
								<span className="text-gray-600 dark:text-gray-400">
									{patient.firstName}
								</span>
							</span>
							<ChevronRight className="h-4 w-4 text-gray-400" />
						</Link>
					))
				)}
			</div>

			{/* Footer */}
			<div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
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
