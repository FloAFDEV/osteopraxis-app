import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "./contexts/AuthContext";

// Routes Components imports
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import NewPatientPage from "./pages/NewPatientPage";
import EditPatientPage from "./pages/EditPatientPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import NewAppointmentPage from "./pages/NewAppointmentPage";
import ImmediateAppointmentPage from "./pages/ImmediateAppointmentPage";
import EditAppointmentPage from "./pages/EditAppointmentPage";
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import OsteopathSettingsPage from "./pages/OsteopathSettingsPage";
import OsteopathProfilePage from "./pages/OsteopathProfilePage";
import CabinetSettingsPage from "./pages/CabinetSettingsPage";
import InvoicesPage from "./pages/InvoicesPage";
import NewInvoicePage from "./pages/NewInvoicePage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import EditInvoicePage from "./pages/EditInvoicePage";
import CabinetsManagementPage from "./pages/CabinetsManagementPage";
import NewCabinetPage from "./pages/NewCabinetPage";
import EditCabinetPage from "./pages/EditCabinetPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
	const { isAuthenticated, loadStoredToken, user, redirectToSetupIfNeeded } = useAuth();
	const [loading, setLoading] = useState(true);
	const location = useLocation();

	// Chargement initial du token stocké au démarrage de l'application
	useEffect(() => {
		const initAuth = async () => {
			console.log("Chargement initial du token stocké...");
			try {
				await loadStoredToken();
			} catch (error) {
				console.error(
					"Erreur lors du chargement initial du token:",
					error
				);
			} finally {
				setLoading(false);
			}
		};
		initAuth();
	}, [loadStoredToken]);

	// Vérifie si l'utilisateur doit compléter son profil après chaque changement d'authentification
	useEffect(() => {
		if (!loading && isAuthenticated && user) {
			console.log("Vérification si l'utilisateur doit compléter son profil:", 
				{hasOsteopathId: !!user.osteopathId, path: location.pathname});
			
			// Exclure les pages/routes qui sont explicitement exclues de la redirection automatique
			const excludedPaths = ['/profile/setup', '/login', '/register', '/privacy-policy', '/terms-of-service'];
			
			// Ne pas rediriger si on est déjà sur une des pages exclues
			if (!excludedPaths.some(path => location.pathname.startsWith(path))) {
				// Si l'utilisateur n'a pas d'osteopathId, rediriger vers la page de configuration du profil
				if (!user.osteopathId) {
					console.log("Utilisateur sans osteopathId, redirection vers la configuration du profil");
					redirectToSetupIfNeeded(location.pathname);
				} else {
					console.log("Utilisateur avec osteopathId, pas de redirection nécessaire");
				}
			} else {
				console.log("Chemin courant exclu de la redirection automatique:", location.pathname);
			}
		}
	}, [isAuthenticated, loading, user, location.pathname, redirectToSetupIfNeeded]);

	// Ajout d'un intercepteur global pour toutes les requêtes fetch
	useEffect(() => {
		const originalFetch = window.fetch;
		window.fetch = function (input, init) {
			const modifiedInit = init || {};
			
			// Pour les requêtes vers les fonctions edge de Supabase
			if (typeof input === "string" && input.includes("supabase.co/functions")) {
				// Ne pas ajouter de headers CORS côté client
				// Access-Control-Allow-* sont des headers de réponse, pas de requête
				// S'assurer que les headers d'authentification sont présents
				const headers = modifiedInit.headers || {};
				modifiedInit.headers = headers;
			}
			
			return originalFetch(input, modifiedInit);
		};

		return () => {
			window.fetch = originalFetch; // Restauration de la fonction d'origine lors du démontage
		};
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	const isAdmin = user?.role === "ADMIN";

	return (
		<>
			<Routes>
				<Route
					path="/login"
					element={
						!isAuthenticated ? (
							<LoginPage />
						) : (
							<Navigate to="/dashboard" />
						)
					}
				/>
				<Route
					path="/register"
					element={
						!isAuthenticated ? (
							<RegisterPage />
						) : (
							<Navigate to="/dashboard" />
						)
					}
				/>

				{/* Routes protégées qui nécessitent une authentification */}
				<Route
					path="/dashboard"
					element={
						isAuthenticated ? (
							<DashboardPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/patients"
					element={
						isAuthenticated ? (
							<PatientsPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/patients/new"
					element={
						isAuthenticated ? (
							<NewPatientPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/patients/:id/edit"
					element={
						isAuthenticated ? (
							<EditPatientPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/patients/:id"
					element={
						isAuthenticated ? (
							<PatientDetailPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/appointments"
					element={
						isAuthenticated ? (
							<AppointmentsPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/appointments/new"
					element={
						isAuthenticated ? (
							<NewAppointmentPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/appointments/immediate"
					element={
						isAuthenticated ? (
							<ImmediateAppointmentPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/appointments/:id/edit"
					element={
						isAuthenticated ? (
							<EditAppointmentPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/schedule"
					element={
						isAuthenticated ? (
							<SchedulePage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/settings"
					element={
						isAuthenticated ? (
							<SettingsPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/settings/profile"
					element={
						isAuthenticated ? (
							<OsteopathSettingsPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				{/* Routes spécifiques */}
				<Route
					path="/profile/setup"
					element={
						isAuthenticated ? (
							<OsteopathProfilePage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/settings/cabinet"
					element={
						isAuthenticated ? (
							<CabinetSettingsPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/invoices"
					element={
						isAuthenticated ? (
							<InvoicesPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/invoices/new"
					element={
						isAuthenticated ? (
							<NewInvoicePage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/invoices/:id"
					element={
						isAuthenticated ? (
							<InvoiceDetailPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/invoices/:id/edit"
					element={
						isAuthenticated ? (
							<EditInvoicePage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/"
					element={
						<Navigate
							to={isAuthenticated ? "/dashboard" : "/login"}
						/>
					}
				/>
				<Route
					path="/cabinets"
					element={
						isAuthenticated ? (
							<CabinetsManagementPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/cabinets/new"
					element={
						isAuthenticated ? (
							<NewCabinetPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/cabinets/:id/edit"
					element={
						isAuthenticated ? (
							<EditCabinetPage />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
				<Route
					path="/terms-of-service"
					element={<TermsOfServicePage />}
				/>

				{/* Nouvelle route pour l'administration */}
				<Route
					path="/admin"
					element={
						isAuthenticated ? (
							isAdmin ? (
								<AdminDashboardPage />
							) : (
								<Navigate to="/dashboard" />
							)
						) : (
							<Navigate to="/login" />
						)
					}
				/>

				{/* Redirect cabinet à cabinets */}
				<Route
					path="/cabinet"
					element={
						isAuthenticated ? (
							<Navigate to="/cabinets" />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
			</Routes>
			<Toaster position="top-right" richColors closeButton />
		</>
	);
}

export default App;
