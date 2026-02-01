import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { ErrorState, LoadingState } from "./loading-state";
import { useStorageMode } from "@/hooks/useStorageMode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Appointment, Patient, Invoice } from "@/types";

// Composants compacts
import { DashboardHeaderCompact } from "./DashboardHeaderCompact";
import { DashboardFooter } from "./DashboardFooter";
import { TodayAppointments } from "./TodayAppointments";
import { UpcomingAppointments } from "./UpcomingAppointments";
import { UnpaidInvoices } from "./UnpaidInvoices";
import { RecentPatients } from "./RecentPatients";
import { BackupReminderBanner } from "@/components/backup/BackupReminderBanner";

/**
 * Dashboard compact - Vision praticien pressé
 *
 * En 2 secondes :
 * - Qui vient aujourd'hui (nom + heure)
 * - Qui me doit de l'argent (impayés + total)
 * - Accès rapide aux actions
 */
export function Dashboard() {
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const { isDemoMode } = useStorageMode();
	const navigate = useNavigate();

	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [patients, setPatients] = useState<Patient[]>([]);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Charger toutes les données
	useEffect(() => {
		if (!isAuthenticated && !isDemoMode) return;

		const loadData = async () => {
			try {
				setLoading(true);
				const [appointmentsData, patientsData, invoicesData] = await Promise.all([
					api.getAppointments(),
					api.getPatients(),
					api.getInvoices(),
				]);

				setAppointments(appointmentsData);
				setPatients(patientsData);
				setInvoices(invoicesData);
			} catch (err) {
				console.error("Erreur chargement dashboard:", err);
				setError(err as Error);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [isAuthenticated, isDemoMode]);

	// Auth loading
	if (authLoading) {
		return <LoadingState />;
	}

	// Non authentifié
	if (!isDemoMode && (!isAuthenticated || !user)) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">Authentification requise</h2>
				<p className="text-muted-foreground">
					Veuillez vous connecter pour accéder au tableau de bord.
				</p>
			</div>
		);
	}

	// Admin redirect
	if (user && user.role === "ADMIN") {
		window.location.href = "/admin/dashboard";
		return <LoadingState />;
	}

	// Erreur
	if (error) {
		return <ErrorState error={error} />;
	}

	// Loading
	if (loading) {
		return (
			<div className="p-4 space-y-4">
				<div className="h-12 bg-muted rounded animate-pulse" />
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="h-48 bg-muted rounded animate-pulse" />
					<div className="h-48 bg-muted rounded animate-pulse" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="h-48 bg-muted rounded animate-pulse" />
					<div className="h-48 bg-muted rounded animate-pulse" />
				</div>
			</div>
		);
	}

	const hasNoPatients = patients.length === 0;

	return (
		<div className="p-4 max-w-6xl mx-auto">
			{/* Header compact */}
			<DashboardHeaderCompact />

			{/* Guide démo pour nouveaux utilisateurs */}
			{isDemoMode && hasNoPatients && (
				<Alert className="mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
					<Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
					<AlertDescription className="text-purple-900 dark:text-purple-100">
						<p className="font-semibold text-base mb-1">
							Bienvenue dans la démo !
						</p>
						<p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
							Vous avez 3 heures pour explorer. Commencez par créer votre premier patient.
						</p>
						<Button
							size="sm"
							onClick={() => navigate("/patients/new")}
							className="bg-purple-600 hover:bg-purple-700 text-white"
						>
							<UserPlus className="h-4 w-4 mr-2" />
							Créer mon premier patient
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>
					</AlertDescription>
				</Alert>
			)}

			{/* Rappel sauvegarde (mode connecté uniquement) */}
			{!isDemoMode && <BackupReminderBanner />}

			{/* Grille principale - 2x2 */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Ligne 1 : Aujourd'hui + À venir */}
				<TodayAppointments appointments={appointments} patients={patients} />
				<UpcomingAppointments appointments={appointments} patients={patients} />

				{/* Ligne 2 : Impayés + Patients récents */}
				<UnpaidInvoices invoices={invoices} patients={patients} />
				<RecentPatients patients={patients} />
			</div>

			{/* Footer discret */}
			<DashboardFooter />
		</div>
	);
}
