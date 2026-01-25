import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { AppointmentsOverview } from "./appointments-overview";
import { DashboardHeader } from "./dashboard-header";
import { ErrorState, LoadingState } from "./loading-state";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStorageMode } from "@/hooks/useStorageMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Calendar,
	UserPlus,
	FileText,
	Clock,
	Users,
	Receipt,
	BarChart3,
	ChevronRight
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
					api.getInvoices()
				]);

				// Trier par date de création et prendre les 5 derniers
				const sortedPatients = [...patients]
					.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
					.slice(0, 5);

				const sortedInvoices = [...invoices]
					.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
					.slice(0, 5);

				setRecentPatients(sortedPatients);
				setRecentInvoices(sortedInvoices);
			} catch (err) {
				console.error('Erreur chargement données récentes:', err);
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
				<h2 className="text-xl font-semibold mb-2">Authentification requise</h2>
				<p className="text-muted-foreground">Veuillez vous connecter pour accéder au tableau de bord.</p>
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
		<div className="space-y-6 p-4 sm:p-6 lg:p-8">
			{/* Header Image Banner */}
			<DashboardHeader />

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
					{/* Actions principales - CTA visibles et prioritaires */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Button
							onClick={() => navigate('/patients/new')}
							className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
						>
							<UserPlus className="h-8 w-8" />
							<div className="text-center">
								<div className="font-semibold text-lg">Nouveau patient</div>
								<div className="text-xs opacity-80">Ajouter un patient</div>
							</div>
						</Button>

						<Button
							onClick={() => navigate('/appointments/new')}
							className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
						>
							<Calendar className="h-8 w-8" />
							<div className="text-center">
								<div className="font-semibold text-lg">Nouvelle séance</div>
								<div className="text-xs opacity-80">Planifier un RDV</div>
							</div>
						</Button>

						<Button
							onClick={() => navigate('/invoices/new')}
							className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg"
						>
							<FileText className="h-8 w-8" />
							<div className="text-center">
								<div className="font-semibold text-lg">Nouvelle facture</div>
								<div className="text-xs opacity-80">Créer une note d'honoraire</div>
							</div>
						</Button>
					</div>

					{/* Lien vers les statistiques */}
					<Card className="border-dashed border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
						<CardContent className="p-4">
							<Link
								to="/statistics"
								className="flex items-center justify-between hover:opacity-80 transition-opacity"
							>
								<div className="flex items-center gap-3">
									<div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
										<BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
									</div>
									<div>
										<p className="font-medium text-indigo-900 dark:text-indigo-100">
											Statistiques & Analytics
										</p>
										<p className="text-sm text-indigo-600 dark:text-indigo-400">
											Consultez vos graphiques et indicateurs détaillés
										</p>
									</div>
								</div>
								<ChevronRight className="h-5 w-5 text-indigo-400" />
							</Link>
						</CardContent>
					</Card>

					{/* Section Rendez-vous à venir */}
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
									<CardTitle className="text-lg">Prochains rendez-vous</CardTitle>
								</div>
								<Link
									to="/schedule"
									className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
								>
									Voir le planning
									<ChevronRight className="h-4 w-4" />
								</Link>
							</div>
						</CardHeader>
						<CardContent>
							<AppointmentsOverview data={dashboardData} />
						</CardContent>
					</Card>

					{/* Grille Patients récents + Factures récentes */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Patients récents */}
						<Card>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
										<CardTitle className="text-lg">Patients récents</CardTitle>
									</div>
									<Link
										to="/patients"
										className="text-sm text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1"
									>
										Tous les patients
										<ChevronRight className="h-4 w-4" />
									</Link>
								</div>
							</CardHeader>
							<CardContent>
								{loadingRecent ? (
									<div className="space-y-3">
										{[1, 2, 3].map((i) => (
											<div key={i} className="h-12 bg-muted rounded animate-pulse" />
										))}
									</div>
								) : recentPatients.length === 0 ? (
									<div className="text-center py-6 text-muted-foreground">
										<Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
										<p>Aucun patient pour le moment</p>
										<Button
											variant="link"
											onClick={() => navigate('/patients/new')}
											className="mt-2"
										>
											Ajouter votre premier patient
										</Button>
									</div>
								) : (
									<div className="space-y-2">
										{recentPatients.map((patient) => (
											<Link
												key={patient.id}
												to={`/patients/${patient.id}`}
												className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
											>
												<div className="flex items-center gap-3">
													<div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
														patient.gender === 'Femme' ? 'bg-pink-500' : 'bg-blue-500'
													}`}>
														{patient.firstName?.[0]}{patient.lastName?.[0]}
													</div>
													<div>
														<p className="font-medium text-sm">
															{patient.firstName} {patient.lastName}
														</p>
														<p className="text-xs text-muted-foreground">
															{patient.phone || patient.email || 'Pas de contact'}
														</p>
													</div>
												</div>
												<ChevronRight className="h-4 w-4 text-muted-foreground" />
											</Link>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Factures récentes */}
						<Card>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
										<CardTitle className="text-lg">Dernières factures</CardTitle>
									</div>
									<Link
										to="/invoices"
										className="text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1"
									>
										Toutes les factures
										<ChevronRight className="h-4 w-4" />
									</Link>
								</div>
							</CardHeader>
							<CardContent>
								{loadingRecent ? (
									<div className="space-y-3">
										{[1, 2, 3].map((i) => (
											<div key={i} className="h-12 bg-muted rounded animate-pulse" />
										))}
									</div>
								) : recentInvoices.length === 0 ? (
									<div className="text-center py-6 text-muted-foreground">
										<Receipt className="h-10 w-10 mx-auto mb-2 opacity-50" />
										<p>Aucune facture pour le moment</p>
										<Button
											variant="link"
											onClick={() => navigate('/invoices/new')}
											className="mt-2"
										>
											Créer votre première facture
										</Button>
									</div>
								) : (
									<div className="space-y-2">
										{recentInvoices.map((invoice) => (
											<Link
												key={invoice.id}
												to={`/invoices/${invoice.id}`}
												className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
											>
												<div className="flex items-center gap-3">
													<div className={`px-2 py-1 rounded text-xs font-medium ${
														invoice.paymentStatus === 'PAID'
															? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
															: invoice.paymentStatus === 'PENDING'
															? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
															: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
													}`}>
														{invoice.paymentStatus === 'PAID' ? 'Payée' :
														 invoice.paymentStatus === 'PENDING' ? 'En attente' : 'Annulée'}
													</div>
													<div>
														<p className="font-medium text-sm">
															{invoice.invoiceNumber}
														</p>
														<p className="text-xs text-muted-foreground">
															{new Date(invoice.date).toLocaleDateString('fr-FR')}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<span className="font-semibold text-sm">
														{invoice.amount}€
													</span>
													<ChevronRight className="h-4 w-4 text-muted-foreground" />
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
