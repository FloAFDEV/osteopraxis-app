import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
	DollarSign,
	Users,
	TrendingUp,
	Search,
	Filter,
	Download,
	Crown,
	Zap,
	Star,
} from "lucide-react";

interface OsteopathSubscription {
	id: number;
	name: string;
	userId: string;
	authId: string;
	plan: "light" | "full" | "pro";
	createdAt: string;
	updatedAt: string;
}

interface SubscriptionStats {
	totalOsteopaths: number;
	lightUsers: number;
	fullUsers: number;
	proUsers: number;
	monthlyRevenue: number;
	conversionRate: number;
}

const PLAN_PRICES = {
	light: 0,
	full: 9,
	pro: 16,
};

const PLAN_LABELS = {
	light: "Light",
	full: "Full",
	pro: "Pro",
};

const PLAN_COLORS = {
	light: "secondary",
	full: "default",
	pro: "default",
} as const;

const PLAN_ICONS = {
	light: Star,
	full: Zap,
	pro: Crown,
};

export function SubscriptionManagement() {
	const [osteopaths, setOsteopaths] = useState<OsteopathSubscription[]>([]);
	const [stats, setStats] = useState<SubscriptionStats>({
		totalOsteopaths: 0,
		lightUsers: 0,
		fullUsers: 0,
		proUsers: 0,
		monthlyRevenue: 0,
		conversionRate: 0,
	});
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPlan, setFilterPlan] = useState<string>("all");

	useEffect(() => {
		loadSubscriptionData();
	}, []);

	const loadSubscriptionData = async () => {
		try {
			setLoading(true);

			// Charger tous les ostéopathes avec leur plan
			const { data: osteopathsData, error: osteopathsError } =
				await supabase
					.from("Osteopath")
					.select(
						"id, name, userId, authId, plan, createdAt, updatedAt",
					)
					.order("createdAt", { ascending: false });

			if (osteopathsError) throw osteopathsError;

			const osteopathsList = osteopathsData || [];
			setOsteopaths(osteopathsList);

			// Calculer les statistiques
			const total = osteopathsList.length;
			const lightCount = osteopathsList.filter(
				(o) => o.plan === "light",
			).length;
			const fullCount = osteopathsList.filter(
				(o) => o.plan === "full",
			).length;
			const proCount = osteopathsList.filter(
				(o) => o.plan === "pro",
			).length;

			// Revenus mensuels estimés
			const monthlyRevenue =
				fullCount * PLAN_PRICES.full + proCount * PLAN_PRICES.pro;

			// Taux de conversion (utilisateurs payants / total)
			const payingUsers = fullCount + proCount;
			const conversionRate = total > 0 ? (payingUsers / total) * 100 : 0;

			setStats({
				totalOsteopaths: total,
				lightUsers: lightCount,
				fullUsers: fullCount,
				proUsers: proCount,
				monthlyRevenue,
				conversionRate,
			});
		} catch (error) {
			console.error(
				"Erreur lors du chargement des données d'abonnement:",
				error,
			);
			toast.error("Erreur lors du chargement des données");
		} finally {
			setLoading(false);
		}
	};

	const updatePlan = async (
		osteopathId: number,
		newPlan: "light" | "full" | "pro",
	) => {
		try {
			const { error } = await supabase
				.from("Osteopath")
				.update({
					plan: newPlan,
					updatedAt: new Date().toISOString(),
				})
				.eq("id", osteopathId);

			if (error) throw error;

			toast.success(`Plan mis à jour vers ${PLAN_LABELS[newPlan]}`);
			loadSubscriptionData();
		} catch (error) {
			console.error("Erreur lors de la modification du plan:", error);
			toast.error("Erreur lors de la modification");
		}
	};

	const exportSubscriptionData = () => {
		const csvData = osteopaths.map((osteo) => ({
			Nom: osteo.name,
			Plan: PLAN_LABELS[osteo.plan],
			"Prix mensuel": `${PLAN_PRICES[osteo.plan]}€`,
			"Date de création": new Date(osteo.createdAt).toLocaleDateString(
				"fr-FR",
			),
			"Dernière mise à jour": new Date(
				osteo.updatedAt,
			).toLocaleDateString("fr-FR"),
		}));

		const csv = [
			Object.keys(csvData[0]).join(","),
			...csvData.map((row) => Object.values(row).join(",")),
		].join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `subscriptions-${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const filteredOsteopaths = osteopaths.filter((osteo) => {
		const matchesSearch = osteo.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesPlan = filterPlan === "all" || osteo.plan === filterPlan;

		return matchesSearch && matchesPlan;
	});

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold">
						Gestion des Plans d'Abonnement
					</h2>
					<p className="text-sm text-muted-foreground">
						Gérez les plans Light, Full et Pro des ostéopathes
					</p>
				</div>
				<Button onClick={exportSubscriptionData} variant="outline">
					<Download className="h-4 w-4 mr-2" />
					Exporter CSV
				</Button>
			</div>

			{/* Statistiques globales */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Ostéopathes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-center">
							<div className="text-2xl font-bold">
								{stats.totalOsteopaths}
							</div>
							<Users className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
							<Zap className="h-3 w-3" /> Plan Full
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-center">
							<div className="text-2xl font-bold text-blue-600">
								{stats.fullUsers}
							</div>
							<Badge>9€/mois</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
							<Crown className="h-3 w-3" /> Plan Pro
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-center">
							<div className="text-2xl font-bold text-purple-600">
								{stats.proUsers}
							</div>
							<Badge className="bg-purple-600">16€/mois</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Revenus Mensuels
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-center">
							<div className="text-2xl font-bold text-green-600">
								{stats.monthlyRevenue}€
							</div>
							<DollarSign className="h-4 w-4 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Taux Conversion
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-center">
							<div className="text-2xl font-bold">
								{stats.conversionRate.toFixed(1)}%
							</div>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filtres et recherche */}
			<div className="flex gap-4 items-center">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Rechercher par nom..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-muted-foreground" />
					<Select value={filterPlan} onValueChange={setFilterPlan}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filtrer par plan" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous les plans</SelectItem>
							<SelectItem value="full">Full (9€)</SelectItem>
							<SelectItem value="pro">Pro (16€)</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Liste des ostéopathes */}
			<Card>
				<CardHeader>
					<CardTitle>
						Ostéopathes ({filteredOsteopaths.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{filteredOsteopaths.map((osteopath) => {
							const PlanIcon = PLAN_ICONS[osteopath.plan];
							return (
								<div
									key={osteopath.id}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center space-x-4">
										<div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
											<PlanIcon className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="font-medium">
												{osteopath.name}
											</p>
											<p className="text-sm text-muted-foreground">
												Créé le{" "}
												{new Date(
													osteopath.createdAt,
												).toLocaleDateString("fr-FR")}
											</p>
										</div>
									</div>

									<div className="flex items-center space-x-4">
										<div className="text-right mr-4">
											<div className="text-sm font-medium">
												{PLAN_PRICES[osteopath.plan]}
												€/mois
											</div>
											<div className="text-sm text-muted-foreground">
												{osteopath.plan === "light"
													? "Gratuit"
													: "Payant"}
											</div>
										</div>

										<Badge
											variant={
												PLAN_COLORS[osteopath.plan]
											}
											className="min-w-[70px] justify-center"
										>
											{PLAN_LABELS[osteopath.plan]}
										</Badge>

										<Select
											value={osteopath.plan}
											onValueChange={(value) =>
												updatePlan(
													osteopath.id,
													value as
														| "light"
														| "full"
														| "pro",
												)
											}
										>
											<SelectTrigger className="w-[140px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="full">
													<div className="flex items-center gap-2">
														<Zap className="h-3 w-3" />
														Full (9€)
													</div>
												</SelectItem>
												<SelectItem value="pro">
													<div className="flex items-center gap-2">
														<Crown className="h-3 w-3" />
														Pro (16€)
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							);
						})}

						{filteredOsteopaths.length === 0 && (
							<div className="text-center py-8 text-muted-foreground">
								Aucun ostéopathe trouvé
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
