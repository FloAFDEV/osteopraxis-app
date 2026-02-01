import { BarChart3, Settings, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardFooter() {
	return (
		<div className="flex items-center justify-center gap-8 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
			<Link
				to="/statistics"
				className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
			>
				<BarChart3 className="h-4 w-4" />
				<span>Statistiques</span>
			</Link>
			<Link
				to="/settings/cabinet"
				className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
			>
				<Settings className="h-4 w-4" />
				<span>Paramètres cabinet</span>
			</Link>
			<Link
				to="/help"
				className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
			>
				<HelpCircle className="h-4 w-4" />
				<span>Aide</span>
			</Link>
		</div>
	);
}
