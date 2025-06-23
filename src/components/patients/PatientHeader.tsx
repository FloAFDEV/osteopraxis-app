import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PatientHeaderProps {
	patientCount: number;
	isRefreshing: boolean;
	onRefresh: () => void;
	onCreateTestPatient?: () => void;
}

const PatientHeader: React.FC<PatientHeaderProps> = ({
	patientCount,
	isRefreshing,
	onRefresh,
}) => {
	const { user } = useAuth();
	const needsProfileSetup = !user?.osteopathId;

	return (
		<div className="relative w-full rounded-2xl overflow-hidden shadow-none mb-8">
			{/* Fond dégradé neutre bleu-gris, avec support dark mode */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-200/40 to-slate-300 dark:from-slate-800 dark:via-slate-700/40 dark:to-slate-900 opacity-95"
				aria-hidden="true"
			/>

			{/* Contenu */}
			<div className="relative flex z-10 flex-col sm:flex-row items-center gap-6 px-6 py-10 sm:py-14">
				{/* Icône dans rond translucide */}
				<div className="rounded-full bg-white/70 dark:bg-slate-900/30 shadow-md p-4 flex items-center justify-center">
					<Users className="h-9 w-9 text-blue-600 dark:text-blue-400" />
				</div>

				{/* Texte + boutons */}
				<div className="flex-1 w-full sm:w-auto">
					<div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 justify-between mb-4">
						<div>
							<h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
								Patients{" "}
								{patientCount > 0 && (
									<span className="text-lg px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
										{patientCount}
									</span>
								)}
							</h1>
							{/* Texte descriptif sous le titre */}
							<p className="mt-1 text-base text-slate-700 dark:text-slate-300 max-w-2xl">
								Gérez facilement votre liste de patients :
								ajoutez, modifiez et suivez leurs dossiers en
								toute simplicité.
							</p>
						</div>

						<div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
							<Button
								onClick={onRefresh}
								variant="outline"
								className="w-auto hover:bg-slate-500"
								disabled={isRefreshing}
							>
								<RefreshCw
									className={`mr-2 h-4 w-4 ${
										isRefreshing ? "animate-spin" : ""
									}`}
								/>
								Actualiser
							</Button>

							<Button
								variant="default"
								asChild
								disabled={needsProfileSetup}
								className={`bg-blue-500 hover:bg-blue-700 hover:text-white w-full sm:w-auto ${
									needsProfileSetup
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}
							>
								{needsProfileSetup ? (
									<span>
										<Users className="mr-2 h-4 w-4" />{" "}
										Configurer votre profil d'abord
									</span>
								) : (
									<Link to="/patients/new">
										<Users className="mr-2 h-4 w-4" />{" "}
										Nouveau patient
									</Link>
								)}
							</Button>
						</div>
					</div>

					{needsProfileSetup && (
						<div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md">
							<p>
								Vous devez d'abord configurer votre profil
								d'ostéopathe avant de pouvoir ajouter des
								patients.
							</p>
							<Button
								variant="link"
								className="p-0 text-yellow-600 dark:text-yellow-300 underline mt-2"
								asChild
							>
								<Link to="/profile/setup">
									Configurer mon profil
								</Link>
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PatientHeader;
