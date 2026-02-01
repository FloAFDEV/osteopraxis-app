import { useAuth } from "@/contexts/AuthContext";
import { useStorageMode } from "@/hooks/useStorageMode";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserPlus, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function DashboardHeaderCompact() {
	const { user } = useAuth();
	const { isDemoMode } = useStorageMode();
	const navigate = useNavigate();

	// Récupérer le nom de l'ostéopathe en mode connecté
	const { data: osteopath } = useQuery({
		queryKey: ["osteopath", user?.osteopathId],
		queryFn: () => user?.osteopathId ? api.getOsteopathById(user.osteopathId) : null,
		enabled: !isDemoMode && !!user?.osteopathId,
	});

	const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
	const greeting = getGreeting();

	// Déterminer le nom à afficher
	const getUserName = () => {
		if (isDemoMode) {
			return "Dr. Utilisateur Démo";
		}
		if (osteopath?.name) {
			return osteopath.name;
		}
		if (user?.firstName && user?.lastName) {
			return `${user.firstName} ${user.lastName}`;
		}
		if (user?.firstName) {
			return user.firstName;
		}
		return "Docteur";
	};

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return "Bonjour";
		if (hour < 18) return "Bon après-midi";
		return "Bonsoir";
	}

	return (
		<div className="mb-6">
			{/* Image banner compacte */}
			<div className="relative w-full h-32 md:h-40 overflow-hidden rounded-xl shadow-md mb-4">
				<img
					src="/images/3b5eb6d0-bf13-4f00-98c8-6cc25a7e5c4f.png"
					alt="Cabinet d'ostéopathie"
					className="w-full h-full object-cover"
					loading="lazy"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent flex items-center">
					<div className="px-5 md:px-8">
						<h1 className="text-xl md:text-2xl text-white font-semibold">
							{greeting}, {getUserName()}
						</h1>
						<p className="text-white/80 text-sm capitalize mt-0.5">
							{today}
						</p>
					</div>
				</div>
			</div>

			{/* Actions rapides */}
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate("/patients/new")}
					className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 shadow-sm"
				>
					<UserPlus className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
					Nouveau patient
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate("/appointments/new")}
					className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 shadow-sm"
				>
					<Calendar className="h-4 w-4 mr-1.5 text-purple-600 dark:text-purple-400" />
					Nouvelle séance
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate("/invoices/new")}
					className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 shadow-sm"
				>
					<FileText className="h-4 w-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
					Nouvelle facture
				</Button>
			</div>
		</div>
	);
}
