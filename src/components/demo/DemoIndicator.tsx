import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDemoSession } from "@/hooks/useDemoSession";
import { useAuth } from "@/contexts/AuthContext";

interface DemoIndicatorProps {
	className?: string;
	showCTA?: boolean;
}

export const DemoIndicator = ({
	className = "",
	showCTA = true,
}: DemoIndicatorProps) => {
	const { isDemoActive, remainingFormatted } = useDemoSession();
	const { isDemoMode } = useAuth();
	const navigate = useNavigate();

	// Ne rien afficher si pas en mode démo
	if (!isDemoActive && !isDemoMode) {
		return null;
	}

	return (
		<div
			className={`bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-700/50 rounded-lg p-4 ${className}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="bg-purple-100 dark:bg-purple-800/50 rounded-full p-2">
						<Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<div className="flex items-center gap-2 mb-1">
							<Badge
								variant="outline"
								className="bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-200 border-purple-300 dark:border-purple-600/50"
							>
								MODE DÉMO
							</Badge>
						</div>
						<p className="text-sm text-purple-700 dark:text-purple-200 font-medium">
							Session limitée à 3 heures • Données non sauvegardées
						</p>
						<p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
							Temps restant : {remainingFormatted}
						</p>
					</div>
				</div>

				{showCTA && (
					<div className="flex flex-col gap-2 ml-auto">
						<Button
							size="sm"
							className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 whitespace-nowrap"
							onClick={() => navigate("/register")}
						>
							<Crown className="h-4 w-4 mr-2" />
							Créer mon compte
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};
