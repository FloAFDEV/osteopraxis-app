import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { AppointmentsOverview } from "./appointments-overview";
import { ConsultationsChart } from "./consultations-chart";
import { DashboardContent } from "./dashboard-content";
import { DashboardHeader } from "./dashboard-header";
import { DashboardStats } from "./dashboard-stats";
import { DemographicsCard } from "./demographics-card";
import { ErrorState, LoadingState } from "./loading-state";
import { AdvancedAnalyticsPanel } from "./advanced-analytics-panel";
import { CabinetSelector } from "./cabinet-selector";
import { useCabinetStats } from "@/hooks/useCabinetStats";

export function Dashboard() {
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
	const [selectedCabinetName, setSelectedCabinetName] = useState<string | undefined>(undefined);
	
	// Utiliser le hook personnalisé pour les statistiques par cabinet
	const { dashboardData, allPatients, loading, error } = useCabinetStats(selectedCabinetId);

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

	return (
		<div className="space-y-8 p-4 sm:p-6 lg:p-8">
			{/* Header Image Banner */}
			<DashboardHeader />

			{/* Cabinet Selector */}
			<div className="animate-fade-in">
				<CabinetSelector 
					onCabinetChange={handleCabinetChange}
					selectedCabinetId={selectedCabinetId}
				/>
			</div>

			{/* Main content */}
			<div className="animate-fade-in">
				<DashboardStats 
					data={dashboardData} 
					selectedCabinetName={selectedCabinetName}
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