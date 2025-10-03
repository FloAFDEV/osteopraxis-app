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
import { useCabinetStats } from "@/hooks/useCabinetStats";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ExternalLink } from "lucide-react";
import { storageRouter } from "@/services/storage/storage-router";

export function Dashboard() {
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
	const [selectedCabinetName, setSelectedCabinetName] = useState<string | undefined>(undefined);
	const [storageMode, setStorageMode] = useState<'demo' | 'connected' | 'iframe_preview' | null>(null);
	
	// Utiliser le hook personnalisé pour les statistiques par cabinet
	const { dashboardData, allPatients, loading, error } = useCabinetStats(selectedCabinetId);

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

	// Afficher un état de chargement si l'auth est en cours ou si les données se chargent
	if (authLoading || loading) {
		return <LoadingState />;
	}

	// Si pas authentifié, afficher un message approprié
	if (!isAuthenticated || !user) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center">
				<h2 className="text-xl font-semibold mb-2">Authentification requise</h2>
				<p className="text-muted-foreground">Veuillez vous connecter pour accéder au tableau de bord.</p>
			</div>
		);
	}

	// Rediriger les administrateurs vers l'interface d'administration
	if (user.role === "ADMIN") {
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

	return (
		<div className="space-y-8 p-4 sm:p-6 lg:p-8">
			{/* Header Image Banner */}
			<DashboardHeader />

			{/* Message de bienvenue si pas de données HDS */}
			{hasNoData && (
				<Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
					<Shield className="h-4 w-4 text-blue-600" />
					<AlertDescription className="text-blue-800 dark:text-blue-200">
						<div className="space-y-3">
							<div>
								<strong>Bienvenue sur PatientHub !</strong>
								<p className="mt-1 text-sm">
									Pour commencer à gérer vos patients de manière sécurisée et conforme HDS, 
									configurez votre stockage local sécurisé.
								</p>
							</div>
							<Button
								variant="default"
								size="sm"
								className="mt-2"
								onClick={() => window.location.href = '/settings/storage'}
							>
								<Shield className="h-4 w-4 mr-2" />
								Configurer le stockage HDS sécurisé
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* Avertissement de stockage en mode connecté */}
			{storageMode === 'connected' && (
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
			<div className="animate-fade-in">
				<DashboardStats 
					data={dashboardData} 
					selectedCabinetName={selectedCabinetName}
					onCabinetChange={handleCabinetChange}
					selectedCabinetId={selectedCabinetId}
				/>
			</div>
			<div className="animate-fade-in animate-delay-100 lg:col-span-3">
				<AppointmentsOverview data={dashboardData} />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="animate-fade-in animate-delay-200">
					<ConsultationsChart data={dashboardData} />
				</div>
				<div className="animate-fade-in animate-delay-300">
					<DemographicsCard
						patients={allPatients}
						data={dashboardData}
					/>
				</div>
			</div>

			{/* Analytics Avancées */}
			<div className="animate-fade-in animate-delay-400">
				<AdvancedAnalyticsPanel />
			</div>

			<DashboardContent dashboardData={dashboardData} />
		</div>
	);
}