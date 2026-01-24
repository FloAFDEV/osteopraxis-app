import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { AppointmentsOverview } from "./appointments-overview";
import { ConsultationsChart } from "./consultations-chart";
import { DashboardContent } from "./dashboard-content";
import { DashboardHeader } from "./dashboard-header";
import { DashboardStats } from "./dashboard-stats";
import { DemographicsCard } from "./demographics-card";
import { ErrorState, LoadingState } from "./loading-state";
import { AdvancedAnalyticsPanel } from "./advanced-analytics-panel";
import { BackupStatusBanner } from "./BackupStatusBanner";
import { CollapsibleSection } from "./CollapsibleSection";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStorageMode } from "@/hooks/useStorageMode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ExternalLink, Calendar, TrendingUp, Users, BarChart3 } from "lucide-react";
import { storageRouter } from "@/services/storage/storage-router";

export function Dashboard() {
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const { isDemoMode } = useStorageMode();
	const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
	const [selectedCabinetName, setSelectedCabinetName] = useState<string | undefined>(undefined);
	const [storageMode, setStorageMode] = useState<'demo' | 'connected' | 'iframe_preview' | null>(null);
	const [loadingTimeout, setLoadingTimeout] = useState(false);
	
	// Hook unifié qui gère automatiquement démo vs connecté
	const { dashboardData, allPatients, loading, error, pinError, reload } = useDashboardStats(selectedCabinetId);

	// Protection contre chargement infini - après 5 secondes, on affiche quand même le contenu
	useEffect(() => {
		if (loading) {
			const timer = setTimeout(() => {
				console.warn('⚠️ Chargement trop long détecté - Affichage du contenu disponible');
				setLoadingTimeout(true);
			}, 5000);
			return () => clearTimeout(timer);
		} else {
			setLoadingTimeout(false);
		}
	}, [loading]);

	// Vérifier le mode de stockage pour afficher les avertissements appropriés
	useEffect(() => {
		const checkStorageMode = async () => {
			try {
				const diagnosis = await storageRouter.diagnose();
				setStorageMode(diagnosis.mode);
			} catch (error) {
				console.error('Erreur lors du diagnostic de stockage:', error);
			}
		};
		
		if (isAuthenticated && !authLoading) {
			checkStorageMode();
		}
	}, [isAuthenticated, authLoading]);

	// Afficher un état de chargement uniquement si l'auth est en cours
	if (authLoading) {
		return <LoadingState />;
	}

	// Si pas authentifié ET pas en mode démo, afficher un message approprié
	if (!isDemoMode && (!isAuthenticated || !user)) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">Authentification requise</h2>
				<p className="text-muted-foreground">Veuillez vous connecter pour accéder au tableau de bord.</p>
			</div>
		);
	}

	// Rediriger les administrateurs vers l'interface d'administration (uniquement en mode connecté)
	if (user && user.role === "ADMIN") {
		window.location.href = "/admin/dashboard";
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState error={error} />;
	}

	const handleCabinetChange = (cabinetId: number | null, cabinetName?: string) => {
		setSelectedCabinetId(cabinetId);
		setSelectedCabinetName(cabinetName);
	};

	// Afficher un message si aucune donnée et pas de cabinet
	const hasNoData = dashboardData.totalPatients === 0 && allPatients.length === 0;
	const showContent = !loading || loadingTimeout;

	return (
		<div className="space-y-8 p-4 sm:p-6 lg:p-8">
			{/* Header Image Banner */}
			<DashboardHeader />
			
		{/* Banner de statut de backup - uniquement si HDS configuré et données présentes */}
		{showContent && !isDemoMode && !hasNoData && <BackupStatusBanner />}
			
			{/* Skeleton loader pendant le chargement des données */}
			{loading && !loadingTimeout && (
				<div className="space-y-4 animate-pulse">
					<div className="h-32 bg-muted rounded-lg" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="h-24 bg-muted rounded-lg" />
						<div className="h-24 bg-muted rounded-lg" />
						<div className="h-24 bg-muted rounded-lg" />
					</div>
					<p className="text-center text-muted-foreground">Chargement de vos données...</p>
				</div>
			)}

		{/* Avertissement de stockage en mode connecté - uniquement si utilisateur actif */}
		{showContent && !hasNoData && storageMode === 'connected' && (
				<Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
					<AlertTriangle className="h-4 w-4 text-orange-600" />
					<AlertDescription className="text-orange-800 dark:text-orange-200">
						<div className="flex items-center justify-between">
							<div>
								<strong>Stockage Supabase</strong> - Vos données sont stockées sur Supabase. 
								Pour une sécurité maximale, configurez le stockage local sécurisé.
							</div>
							<Button
								variant="outline"
								size="sm"
								className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
								onClick={() => window.open('/settings/storage', '_blank')}
							>
								<Shield className="h-4 w-4 mr-2" />
								Configurer le stockage
								<ExternalLink className="h-3 w-3 ml-1" />
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* Main content with integrated cabinet selector */}
			{showContent && (
				<>
					<div className="animate-fade-in">
						<DashboardStats
							data={dashboardData}
							selectedCabinetName={selectedCabinetName}
							onCabinetChange={handleCabinetChange}
							selectedCabinetId={selectedCabinetId}
						/>
					</div>

					{/* Section Rendez-vous à venir - Refermable */}
					<div className="animate-fade-in animate-delay-100">
						<CollapsibleSection
							title="Rendez-vous à venir"
							icon={<Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
							defaultOpen={true}
							storageKey="dashboard-appointments-section"
						>
							<AppointmentsOverview data={dashboardData} />
						</CollapsibleSection>
					</div>

					{/* Section Statistiques - Refermable (Consultations et Démographie côte à côte) */}
					<div className="animate-fade-in animate-delay-200">
						<CollapsibleSection
							title="Statistiques"
							icon={<BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
							defaultOpen={true}
							storageKey="dashboard-stats-section"
						>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div>
									<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
										<TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
										Consultations
									</h3>
									<ConsultationsChart data={dashboardData} />
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
										<Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
										Démographie
									</h3>
									<DemographicsCard
										patients={allPatients}
										data={dashboardData}
									/>
								</div>
							</div>
						</CollapsibleSection>
					</div>

					{/* Analytics Avancées */}
					<div className="animate-fade-in animate-delay-400">
						<AdvancedAnalyticsPanel selectedCabinetId={selectedCabinetId} />
					</div>

					{/* Section Évolution de l'activité */}
					<div className="animate-fade-in animate-delay-500">
						<DashboardContent dashboardData={dashboardData} />
					</div>
				</>
			)}
		</div>
	);
}