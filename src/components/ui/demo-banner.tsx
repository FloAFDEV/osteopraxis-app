import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Database, Trash2, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoSession } from "@/hooks/useDemoSession";

interface DemoBannerProps {
	onClearDemo?: () => void;
}

export function DemoBanner({ onClearDemo }: DemoBannerProps) {
	const { logout } = useAuth();
	const { remainingFormatted, endDemo } = useDemoSession();

	const handleClearDemo = async () => {
		try {
			console.log("Quitter le mode démo - Début du processus");

			// 1. Nettoyer la session démo
			endDemo();
			console.log("Session démo nettoyée");

			// 2. Appeler le callback si fourni (pour nettoyer les queries)
			if (onClearDemo) {
				onClearDemo();
				console.log("Callback onClearDemo exécuté");
			}

			// 3. Déconnexion complète via le contexte d'authentification
			console.log("Déconnexion utilisateur...");
			await logout();
		} catch (error) {
			console.error(
				"Erreur lors du nettoyage de la session démo:",
				error,
			);
			// En cas d'erreur, forcer la déconnexion et redirection
			try {
				await logout();
			} catch (logoutError) {
				console.error(
					"Erreur lors de la déconnexion forcée:",
					logoutError,
				);
				// En dernier recours, redirection manuelle
				window.location.href = "/";
			}
		}
	};

	return (
		<Alert className="border-teal-200 bg-teal-50 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-100">
			<Info className="h-4 w-4 text-teal-600 dark:text-teal-400" />
			<AlertDescription className="flex items-center justify-between w-full">
				<div className="flex items-center gap-3 flex-1">
					<Badge
						variant="outline"
						className="bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/50 dark:text-teal-200 dark:border-teal-600"
					>
						<Database className="h-3 w-3 mr-1" />
						MODE DÉMO
					</Badge>
					<span className="text-sm text-teal-800 dark:text-teal-200">
						Vos données sont temporaires et seront effacées
						automatiquement
					</span>
					<div className="flex items-center gap-1 text-sm text-teal-700 dark:text-teal-300">
						<Clock className="h-3 w-3" />
						<span className="font-mono">{remainingFormatted}</span>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleClearDemo}
					className="border-teal-300 text-teal-800 hover:bg-teal-100 ml-3 dark:border-teal-600 dark:text-teal-200 dark:hover:bg-teal-900/50"
				>
					<Trash2 className="h-3 w-3 mr-1" />
					Quitter le mode démo
				</Button>
			</AlertDescription>
		</Alert>
	);
}
