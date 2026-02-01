import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, FileQuestion, LayoutDashboard, Users, Calendar } from "lucide-react";

const NotFound = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, isDemoMode } = useAuth();

	useEffect(() => {
		console.warn(
			"Navigation vers une route inexistante:",
			location.pathname
		);
	}, [location.pathname]);

	// Mode démo (non connecté mais en démo)
	if (isDemoMode) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<div className="w-full max-w-md text-center space-y-6">
					<div className="flex justify-center">
						<div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-4">
							<AlertCircle className="h-12 w-12 text-teal-600 dark:text-teal-400" />
						</div>
					</div>

					<div className="space-y-2">
						<h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
							Page introuvable
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Cette page n'existe pas dans la démonstration.
							<br />
							Vos données d'essai sont intactes.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							onClick={() => navigate("/dashboard")}
							className="bg-teal-600 hover:bg-teal-700 text-white"
						>
							<LayoutDashboard className="h-4 w-4 mr-2" />
							Retour au tableau de bord
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate("/help")}
							className="border-gray-300 dark:border-gray-600"
						>
							Explorer les fonctionnalités
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Mode connecté (praticien authentifié)
	if (isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
				<div className="w-full max-w-md text-center space-y-6">
					<div className="flex justify-center">
						<div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
							<FileQuestion className="h-12 w-12 text-slate-500 dark:text-slate-400" />
						</div>
					</div>

					<div className="space-y-2">
						<h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
							Page introuvable
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Cette page n'existe pas ou a été déplacée.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							onClick={() => navigate("/dashboard")}
							className="bg-slate-700 hover:bg-slate-600 text-white"
						>
							<LayoutDashboard className="h-4 w-4 mr-2" />
							Tableau de bord
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate("/patients")}
							className="border-gray-300 dark:border-gray-600"
						>
							<Users className="h-4 w-4 mr-2" />
							Mes patients
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate("/schedule")}
							className="border-gray-300 dark:border-gray-600"
						>
							<Calendar className="h-4 w-4 mr-2" />
							Agenda
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Visiteur non connecté - redirection vers accueil
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
			<div className="w-full max-w-md text-center space-y-6">
				<div className="flex justify-center">
					<div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
						<FileQuestion className="h-12 w-12 text-slate-500 dark:text-slate-400" />
					</div>
				</div>

				<div className="space-y-2">
					<h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
						Page introuvable
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Cette page n'existe pas.
					</p>
				</div>

				<Button asChild className="bg-slate-700 hover:bg-slate-600 text-white">
					<Link to="/">Retour à l'accueil</Link>
				</Button>
			</div>
		</div>
	);
};

export default NotFound;
