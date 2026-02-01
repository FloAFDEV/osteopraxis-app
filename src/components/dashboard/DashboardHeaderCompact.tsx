import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UserPlus, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function DashboardHeaderCompact() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
	const greeting = getGreeting();
	const userName = user?.firstName || "Docteur";

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return "Bonjour";
		if (hour < 18) return "Bon après-midi";
		return "Bonsoir";
	}

	return (
		<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
			{/* Left: Greeting */}
			<div>
				<h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{greeting}, {userName}
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
					{today}
				</p>
			</div>

			{/* Right: Action buttons */}
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate("/patients/new")}
					className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
				>
					<UserPlus className="h-4 w-4 mr-1.5" />
					Patient
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate("/appointments/new")}
					className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
				>
					<Calendar className="h-4 w-4 mr-1.5" />
					Séance
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => navigate("/invoices/new")}
					className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
				>
					<FileText className="h-4 w-4 mr-1.5" />
					Facture
				</Button>
			</div>
		</div>
	);
}
