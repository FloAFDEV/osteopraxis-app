import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import { WeeklyTrendCard } from "./weekly-trend-card";
import { DashboardData, Cabinet } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Calendar,
	TrendingUp,
	UserPlus,
	Users,
	Stethoscope,
	Building2,
	Filter,
	Euro,
} from "lucide-react";
import { HeroStat, CompactStat } from "@/components/ui/hero-stat";
import { BlurredNumber, BlurredAmount } from "@/components/ui/blurred-amount";
import { PrivacyToggle } from "@/components/ui/privacy-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DashboardStatsProps {
	data: DashboardData;
	selectedCabinetName?: string;
	onCabinetChange?: (cabinetId: number | null, cabinetName?: string) => void;
	selectedCabinetId?: number | null;
}

export function DashboardStats({ 
	data, 
	selectedCabinetName, 
	onCabinetChange,
	selectedCabinetId 
}: DashboardStatsProps) {
	const today = new Date();
	const formattedToday = format(today, "EEEE d MMMM yyyy", { locale: fr });
	const [cabinets, setCabinets] = useState<Cabinet[]>([]);
	const [loadingCabinets, setLoadingCabinets] = useState(true);
	const [showDetailedStats, setShowDetailedStats] = useState(false);

	useEffect(() => {
		const loadCabinets = async () => {
			try {
				setLoadingCabinets(true);
				const cabinetData = await api.getCabinets();
				setCabinets(cabinetData || []);
			} catch (error) {
				console.error("Erreur lors du chargement des cabinets:", error);
			} finally {
				setLoadingCabinets(false);
			}
		};

		loadCabinets();
	}, []);

	let nextAppointmentText = "Aucune séance prévue";

	if (
		data &&
		data.nextAppointment &&
		data.nextAppointment !== "Aucune séance prévue"
	) {
		nextAppointmentText = `Prochaine: ${data.nextAppointment}`;
	}

	if (!data) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card
						key={i}
						className="overflow-hidden border-t-4 border-t-blue-300 h-full"
					>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Chargement...
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2">
							<div className="space-y-2">
								<div className="animate-pulse h-6 bg-blue-100 dark:bg-blue-800/30 rounded" />
								<div className="animate-pulse h-4 w-1/2 bg-blue-100 dark:bg-blue-800/30 rounded" />
							</div>
						</CardContent>
						<CardFooter className="mt-auto">
							<div className="text-xs text-muted-foreground">
								Chargement des données
							</div>
						</CardFooter>
					</Card>
				))}
			</div>
		);
	}

	const showCabinetSelector = !loadingCabinets && cabinets.length > 1 && onCabinetChange;

	// Helper function to get positive message when values are 0
	const getEmptyStateMessage = () => {
		if (data.appointmentsToday === 0 && data.consultationsThisMonth === 0 && data.revenueThisMonth === 0) {
			return "Aucun RDV prévu aujourd'hui, profitez de votre temps libre !";
		}
		return null;
	};

	return (
		<div className="space-y-6">
			{/* Header avec sélecteur de cabinet et contrôles */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
						<TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Tableau de bord
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{selectedCabinetName ? `Cabinet : ${selectedCabinetName}` : 'Vue globale - Tous les cabinets'}
						</p>
					</div>
				</div>
				
				<div className="flex items-center gap-3">
					{showCabinetSelector && (
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-gray-500" />
							<Select
								value={selectedCabinetId?.toString() || "all"}
								onValueChange={(value) => {
									if (value === "all") {
										onCabinetChange(null);
									} else {
										const cabinetId = parseInt(value);
										const cabinet = cabinets.find(c => c.id === cabinetId);
										onCabinetChange(cabinetId, cabinet?.name);
									}
								}}
							>
								<SelectTrigger className="w-[200px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
									<SelectValue placeholder="Sélectionner un cabinet" />
								</SelectTrigger>
								<SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
									<SelectItem value="all">
										<div className="flex items-center gap-2">
											<Building2 className="h-4 w-4" />
											Tous les cabinets
										</div>
									</SelectItem>
									{cabinets.map((cabinet) => (
										<SelectItem key={cabinet.id} value={cabinet.id.toString()}>
											<div className="flex items-center gap-2">
												<Building2 className="h-4 w-4" />
												{cabinet.name}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					<PrivacyToggle size="sm" />
				</div>
			</div>

			{/* Vue rapide - Indicateurs prioritaires */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
							Vue d'ensemble
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Indicateurs clés de votre activité
						</p>
					</div>
				</div>

				{/* Message positif si tout est à 0 */}
				{getEmptyStateMessage() && (
					<div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-lg">
						<p className="text-sm text-green-700 dark:text-green-400 text-center">
							{getEmptyStateMessage()}
						</p>
					</div>
				)}

				{/* Hero Stat - Métrique principale XXL */}
				<HeroStat
					label="Total Patients"
					value={data.totalPatients}
					icon={Users}
					trend={{
						value: data.thirtyDayGrowthPercentage || 0,
						label: "vs mois dernier",
						isPositive: (data.thirtyDayGrowthPercentage || 0) >= 0,
					}}
					description={`${data.newPatientsThisMonth} nouveaux patients ce mois-ci`}
				/>

				{/* Compact Stats - Métriques secondaires */}
				<div className="grid gap-4 grid-cols-1 md:grid-cols-3">
					<CompactStat
						label="Séances aujourd'hui"
						value={data.appointmentsToday}
						icon={Calendar}
						change={nextAppointmentText}
					/>

					<CompactStat
						label="Consultations ce mois"
						value={data.consultationsThisMonth}
						icon={Stethoscope}
						change={
							data.consultationsTrend > 0
								? `+${data.consultationsTrend}% vs mois dernier`
								: data.consultationsTrend < 0
								? `${data.consultationsTrend}% vs mois dernier`
								: "Stable vs mois dernier"
						}
					/>

					<CompactStat
						label="Revenus ce mois"
						value={<BlurredAmount amount={data.revenueThisMonth} />}
						icon={Euro}
						change={
							data.revenueTrend !== undefined
								? data.revenueTrend > 0
									? `+${data.revenueTrend}% vs mois dernier`
									: data.revenueTrend < 0
									? `${data.revenueTrend}% vs mois dernier`
									: "Stable vs mois dernier"
								: `${data.pendingInvoices} factures en attente`
						}
					/>
				</div>
			</div>

			{/* Bouton pour afficher/masquer les stats détaillées */}
			<div className="flex justify-center">
				<Button
					variant="outline"
					onClick={() => setShowDetailedStats(!showDetailedStats)}
					className="flex items-center gap-2"
				>
					{showDetailedStats ? (
						<>
							<ChevronUp className="h-4 w-4" />
							Masquer les stats détaillées
						</>
					) : (
						<>
							<ChevronDown className="h-4 w-4" />
							Voir plus de stats
						</>
					)}
				</Button>
			</div>

			{/* Vue détaillée - Statistiques complémentaires */}
			{showDetailedStats && (
				<div className="space-y-4">
					<div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
							Statistiques détaillées
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Analyses complémentaires et tendances
						</p>
					</div>

					<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						<StatCard
							title="Patients totaux"
							value={data.totalPatients}
							description={
								data.thirtyDayGrowthPercentage > 0
									? `+${data.thirtyDayGrowthPercentage}% ce mois-ci`
									: `${data.thirtyDayGrowthPercentage}% ce mois-ci`
							}
							color="text-slate-600"
							icon={<Users />}
						/>

						<StatCard
							title="Nouveaux patients (30j)"
							value={data.newPatientsLast30Days}
							description={`+${data.newPatientsThisMonth} ce mois-ci`}
							color="text-slate-600"
							icon={<UserPlus />}
						/>

						<StatCard
							title="Revenu annuel"
							value={
								<BlurredAmount amount={data.revenueThisYear || 0} />
							}
							description={
								data.annualTrend !== undefined
									? data.annualTrend > 0
										? `+${data.annualTrend}% vs année dernière`
										: data.annualTrend < 0
										? `${data.annualTrend}% vs année dernière`
										: "Stable vs année dernière"
									: "Revenus depuis janvier"
							}
							color="text-slate-600"
							icon={<TrendingUp />}
						/>

						<StatCard
							title="Revenu moyen / RDV"
							value={
								<BlurredAmount amount={data.averageRevenuePerAppointment || 0} />
							}
							description="Par consultation facturée"
							color="text-slate-600"
							icon={<Euro />}
						/>
					</div>

					{/* Tendance 7 jours */}
					<div className="mt-6">
						<WeeklyTrendCard data={data} />
					</div>
				</div>
			)}
		</div>
	);
}