import { BarChart3, Settings, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardFooter() {
	return (
		<div className="flex items-center justify-center gap-6 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
			<Link
				to="/statistics"
				className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
			>
				<BarChart3 className="h-4 w-4" />
				<span>Statistiques</span>
			</Link>
			<Link
				to="/settings"
				className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
			>
				<Settings className="h-4 w-4" />
				<span>Paramètres</span>
			</Link>
			<Link
				to="/help"
				className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
			>
				<HelpCircle className="h-4 w-4" />
				<span>Aide</span>
			</Link>
		</div>
	);
}
