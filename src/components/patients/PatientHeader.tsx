
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
		<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6 mt-20 animate-fade-in">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<Users className="h-8 w-8 text-pink-600" />
					Patients{" "}
					{patientCount > 0 && (
						<span className="text-lg px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
							{patientCount}
						</span>
					)}
				</h1>

				<div className="flex flex-wrap gap-2 w-full md:w-auto ">
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
						className={`bg-blue-500 hover:bg-blue-700 hover:text-white w-full md:w-auto ${
							needsProfileSetup ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						{needsProfileSetup ? (
							<span>
								<Users className="mr-2 h-4 w-4" /> Configurer votre profil d'abord
							</span>
						) : (
							<Link to="/patients/new">
								<Users className="mr-2 h-4 w-4" /> Nouveau patient
							</Link>
						)}
					</Button>
				</div>
			</div>
			
			{needsProfileSetup && (
				<div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md">
					<p>Vous devez d'abord configurer votre profil d'ostéopathe avant de pouvoir ajouter des patients.</p>
					<Button
						variant="link"
						className="p-0 text-yellow-600 dark:text-yellow-300 underline"
						asChild
					>
						<Link to="/profile/setup">Configurer mon profil</Link>
					</Button>
				</div>
			)}
		</div>
	);
};

export default PatientHeader;
