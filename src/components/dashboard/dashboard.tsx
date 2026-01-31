import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { AppointmentsOverview } from "./appointments-overview";
import { DashboardHeader } from "./dashboard-header";
import { ErrorState, LoadingState } from "./loading-state";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStorageMode } from "@/hooks/useStorageMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Calendar,
	UserPlus,
	FileText,
	Clock,
	Users,
	Receipt,
	BarChart3,
	ChevronRight,
	Sparkles,
	ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { BackupReminderBanner } from "@/components/backup/BackupReminderBanner";

/**
 * Dashboard orienté ACTION - Pas de statistiques
 *
 * Objectif : Donner accès immédiat aux actions quotidiennes
 * - Créer un patient
 * - Créer une séance
 * - Créer une facture
 * - Voir les prochains rendez-vous
 * - Voir les patients récents
 * - Voir les dernières factures
 */
export function Dashboard() {
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const { isDemoMode } = useStorageMode();
	const [loadingTimeout, setLoadingTimeout] = useState(false);
	const navigate = useNavigate();

	// Pour les données minimales (prochains RDV uniquement)
	const { dashboardData, loading, error, pinError } = useDashboardStats(null);

	// États pour données récentes
	const [recentPatients, setRecentPatients] = useState<any[]>([]);
	const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
	const [loadingRecent, setLoadingRecent] = useState(true);

	// Charger les données récentes
	useEffect(() => {
		const loadRecentData = async () => {
			try {
				const [patients, invoices] = await Promise.all([
					api.getPatients(),
					api.getInvoices(),
				]);

				// Trier par date de création et prendre les 5 derniers
				const sortedPatients = [...patients]
					.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() -
							new Date(a.createdAt).getTime(),
					)
					.slice(0, 5);

				const sortedInvoices = [...invoices]
					.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() -
							new Date(a.createdAt).getTime(),
					)
					.slice(0, 5);

				setRecentPatients(sortedPatients);
				setRecentInvoices(sortedInvoices);
			} catch (err) {
				console.error("Erreur chargement données récentes:", err);
			} finally {
				setLoadingRecent(false);
			}
		};

		if (isDemoMode || isAuthenticated) {
			loadRecentData();
		}
	}, [isDemoMode, isAuthenticated]);

	// Protection contre chargement infini
	useEffect(() => {
		if (loading) {
			const timer = setTimeout(() => {
				setLoadingTimeout(true);
			}, 5000);
			return () => clearTimeout(timer);
		} else {
			setLoadingTimeout(false);
		}
	}, [loading]);

	if (authLoading) {
		return <LoadingState />;
	}

	if (!isDemoMode && (!isAuthenticated || !user)) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">
					Authentification requise
				</h2>
				<p className="text-muted-foreground">
					Veuillez vous connecter pour accéder au tableau de bord.
				</p>
			</div>
		);
	}

	if (user && user.role === "ADMIN") {
		window.location.href = "/admin/dashboard";
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState error={error} />;
	}

	const showContent = !loading || loadingTimeout;

	return (
		<div className="space-y-4 p-4">
			{/* Header Image Banner */}
			<DashboardHeader />

			{/* Guide de bienvenue pour la démo */}
			{isDemoMode && recentPatients.length === 0 && (
				<Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
					<Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
					<AlertDescription className="text-purple-900 dark:text-purple-100">
						<p className="font-semibold text-base mb-2">
							Bienvenue dans la démo OsteoPraxis !
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

			{/* Rappel de sauvegarde (seulement en mode inscrit, pas en démo) */}
			{!isDemoMode && <BackupReminderBanner />}

			{/* Skeleton loader pendant le chargement */}
			{loading && !loadingTimeout && (
				<div className="space-y-4 animate-pulse">
					<div className="h-32 bg-muted rounded-lg" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="h-24 bg-muted rounded-lg" />
						<div className="h-24 bg-muted rounded-lg" />
						<div className="h-24 bg-muted rounded-lg" />
					</div>
				</div>
			)}

			{showContent && (
				<>
					{/* Actions principales - CTA sobres et cohérents */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<button
							onClick={() => navigate("/patients/new")}
							className="h-auto py-3 px-3 flex flex-col items-center gap-1.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white rounded-md transition-colors"
						>
							<UserPlus className="h-5 w-5" />
							<div className="text-center">
								<div className="font-medium text-sm">
									Nouveau patient
								</div>
								<div className="text-sm text-slate-300">
									Ajouter un patient
								</div>
							</div>
						</button>

						<button
							onClick={() => navigate("/appointments/new")}
							className="h-auto py-3 px-3 flex flex-col items-center gap-1.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white rounded-md transition-colors"
						>
							<Calendar className="h-5 w-5" />
							<div className="text-center">
								<div className="font-medium text-sm">
									Nouvelle séance
								</div>
								<div className="text-sm text-slate-300">
									Planifier un RDV
								</div>
							</div>
						</button>

						<button
							onClick={() => navigate("/invoices/new")}
							className="h-auto py-3 px-3 flex flex-col items-center gap-1.5 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white rounded-md transition-colors"
						>
							<FileText className="h-5 w-5" />
							<div className="text-center">
								<div className="font-medium text-sm">
									Nouvelle facture
								</div>
								<div className="text-sm text-slate-300">
									Créer une note d'honoraire
								</div>
							</div>
						</button>
					</div>

					{/* Lien vers les statistiques - discret */}
					<Card className="border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
						<CardContent className="p-3">
							<Link
								to="/statistics"
								className="flex items-center justify-between hover:opacity-80 transition-opacity"
							>
								<div className="flex items-center gap-2">
									<div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
										<BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
									</div>
									<div>
										<p className="font-medium text-slate-700 dark:text-slate-200 text-sm">
											Statistiques & Analytics
										</p>
										<p className="text-sm text-slate-500 dark:text-slate-400">
											Consultez vos graphiques et
											indicateurs
										</p>
									</div>
								</div>
								<ChevronRight className="h-4 w-4 text-slate-400" />
							</Link>
						</CardContent>
					</Card>

					{/* Section Rendez-vous à venir */}
					<Card className="border-slate-200 dark:border-slate-700">
						<CardHeader className="p-3 pb-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5">
									<Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
									<CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">
										Prochains rendez-vous
									</CardTitle>
								</div>
								<Link
									to="/schedule"
									className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-0.5"
								>
									Voir le planning
									<ChevronRight className="h-3 w-3" />
								</Link>
							</div>
						</CardHeader>
						<CardContent className="p-3 pt-0">
							<AppointmentsOverview data={dashboardData} />
						</CardContent>
					</Card>

					{/* Grille Patients récents + Factures récentes */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Patients récents */}
						<Card className="border-slate-200 dark:border-slate-700">
							<CardHeader className="p-3 pb-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1.5">
										<Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
										<CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">
											Patients récents
										</CardTitle>
									</div>
									<Link
										to="/patients"
										className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-0.5"
									>
										Tous les patients
										<ChevronRight className="h-3 w-3" />
									</Link>
								</div>
							</CardHeader>
							<CardContent className="p-3 pt-0">
								{loadingRecent ? (
									<div className="space-y-2">
										{[1, 2, 3].map((i) => (
											<div
												key={i}
												className="h-10 bg-muted rounded animate-pulse"
											/>
										))}
									</div>
								) : recentPatients.length === 0 ? (
									<div className="text-center py-4 text-muted-foreground">
										<Users className="h-8 w-8 mx-auto mb-1.5 opacity-50" />
										<p className="text-sm">
											Aucun patient pour le moment
										</p>
										<Button
											variant="link"
											onClick={() =>
												navigate("/patients/new")
											}
											className="mt-1 text-sm"
										>
											Ajouter votre premier patient
										</Button>
									</div>
								) : (
									<div className="space-y-1">
										{recentPatients.map((patient) => (
											<Link
												key={patient.id}
												to={`/patients/${patient.id}`}
												className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
											>
												<div className="flex items-center gap-2">
													<div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium">
														{patient.firstName?.[0]}
														{patient.lastName?.[0]}
													</div>
													<div>
														<p className="font-medium text-sm">
															{patient.firstName}{" "}
															{patient.lastName}
														</p>
														<p className="text-sm text-muted-foreground">
															{patient.phone ||
																patient.email ||
																"Pas de contact"}
														</p>
													</div>
												</div>
												<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
											</Link>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Factures récentes */}
						<Card className="border-slate-200 dark:border-slate-700">
							<CardHeader className="p-3 pb-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1.5">
										<Receipt className="h-4 w-4 text-slate-500 dark:text-slate-400" />
										<CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">
											Dernières factures
										</CardTitle>
									</div>
									<Link
										to="/invoices"
										className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-0.5"
									>
										Toutes les factures
										<ChevronRight className="h-3 w-3" />
									</Link>
								</div>
							</CardHeader>
							<CardContent className="p-3 pt-0">
								{loadingRecent ? (
									<div className="space-y-2">
										{[1, 2, 3].map((i) => (
											<div
												key={i}
												className="h-10 bg-muted rounded animate-pulse"
											/>
										))}
									</div>
								) : recentInvoices.length === 0 ? (
									<div className="text-center py-4 text-muted-foreground">
										<Receipt className="h-8 w-8 mx-auto mb-1.5 opacity-50" />
										<p className="text-sm">
											Aucune facture pour le moment
										</p>
										<Button
											variant="link"
											onClick={() =>
												navigate("/invoices/new")
											}
											className="mt-1 text-sm"
										>
											Créer votre première facture
										</Button>
									</div>
								) : (
									<div className="space-y-1">
										{recentInvoices.map((invoice) => (
											<Link
												key={invoice.id}
												to={`/invoices/${invoice.id}`}
												className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
											>
												<div className="flex items-center gap-2">
													<div
														className={`px-1.5 py-0.5 rounded text-sm font-medium ${
															invoice.paymentStatus ===
															"PAID"
																? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
																: invoice.paymentStatus ===
																	  "PENDING"
																	? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
																	: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
														}`}
													>
														{invoice.paymentStatus ===
														"PAID"
															? "Payée"
															: invoice.paymentStatus ===
																  "PENDING"
																? "En attente"
																: "Annulée"}
													</div>
													<div>
														<p className="font-medium text-sm">
															{
																invoice.invoiceNumber
															}
														</p>
														<p className="text-sm text-muted-foreground">
															{new Date(
																invoice.date,
															).toLocaleDateString(
																"fr-FR",
															)}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-1.5">
													<span className="font-semibold text-sm">
														{invoice.amount}€
													</span>
													<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
												</div>
											</Link>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</>
			)}
		</div>
	);
}
