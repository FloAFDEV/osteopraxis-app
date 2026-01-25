/**
 * 📊 UsageMetricsSection - Métriques d'utilisation professionnelles
 *
 * Affiche l'analyse de l'utilisation pour aider à choisir le bon plan
 */

import { useUsageMetrics } from "@/hooks/useUsageMetrics";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	BarChart3,
	Calendar,
	FileText,
	Users,
	TrendingUp,
	AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FEATURE_ICONS = {
	appointments: Calendar,
	invoices: FileText,
	schedule: Calendar,
	team: Users,
	analytics: BarChart3,
};

const FEATURE_PLAN_REQUIREMENTS = {
	appointments: "Full",
	invoices: "Full",
	schedule: "Full",
	team: "Pro",
	analytics: "Pro",
};

export function UsageMetricsSection() {
	const {
		stats,
		getMetrics,
		getMostRequestedFeature,
		getUniqueFeatureCount,
	} = useUsageMetrics();
	const navigate = useNavigate();
	const metrics = getMetrics();
	const mostRequested = getMostRequestedFeature();

	if (stats.totalAttempts === 0) {
		return null;
	}

	return (
		<Card className="w-full border-2">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="h-5 w-5 text-primary" />
							Analyse d'utilisation
						</CardTitle>
						<CardDescription>
							Fonctionnalités que vous avez tenté d'utiliser
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Statistiques globales */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="p-4 border bg-card">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<TrendingUp className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="text-2xl font-bold text-foreground">
									{stats.totalAttempts}
								</p>
								<p className="text-sm text-muted-foreground">
									Tentatives totales
								</p>
							</div>
						</div>
					</Card>

					<Card className="p-4 border bg-card">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<AlertCircle className="h-5 w-5 text-primary" />
							</div>
							<div>
								<p className="text-2xl font-bold text-foreground">
									{getUniqueFeatureCount()}
								</p>
								<p className="text-sm text-muted-foreground">
									Fonctionnalités demandées
								</p>
							</div>
						</div>
					</Card>

					{mostRequested && (
						<Card className="p-4 border bg-card">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-primary/10">
									{(() => {
										const Icon =
											FEATURE_ICONS[
												mostRequested.category
											];
										return (
											<Icon className="h-5 w-5 text-primary" />
										);
									})()}
								</div>
								<div>
									<p className="text-sm font-medium text-foreground truncate">
										{mostRequested.featureName}
									</p>
									<p className="text-sm text-muted-foreground">
										Plus demandée
									</p>
								</div>
							</div>
						</Card>
					)}
				</div>

				{/* Liste des fonctionnalités tentées */}
				<div>
					<h4 className="text-sm font-semibold mb-3 text-foreground">
						Détail des fonctionnalités
					</h4>
					<div className="space-y-3">
						{metrics.map((metric) => {
							const Icon = FEATURE_ICONS[metric.category];
							const requiredPlan =
								FEATURE_PLAN_REQUIREMENTS[metric.category];
							const lastAttemptDate = new Date(
								metric.lastAttempt,
							);

							return (
								<Card
									key={metric.feature}
									className="p-4 border"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3 flex-1">
											<div className="p-2 rounded-lg bg-muted">
												<Icon className="h-4 w-4 text-muted-foreground" />
											</div>
											<div className="flex-1">
												<p className="font-medium text-sm text-foreground">
													{metric.featureName}
												</p>
												<p className="text-sm text-muted-foreground">
													{metric.attemptCount}{" "}
													tentative
													{metric.attemptCount > 1
														? "s"
														: ""}{" "}
													• Dernière:{" "}
													{lastAttemptDate.toLocaleDateString(
														"fr-FR",
													)}
												</p>
											</div>
										</div>
										<Badge
											variant="secondary"
											className="text-sm"
										>
											Plan {requiredPlan}
										</Badge>
									</div>
								</Card>
							);
						})}
					</div>
				</div>

				{/* Recommandation de plan */}
				{stats.totalAttempts >= 3 && (
					<Card className="p-4 border-2 border-primary/20 bg-primary/5">
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<AlertCircle className="h-5 w-5 text-primary mt-0.5" />
								<div className="flex-1">
									<p className="text-sm font-semibold text-foreground mb-1">
										Recommandation basée sur votre
										utilisation
									</p>
									<p className="text-sm text-muted-foreground">
										Vous avez tenté d'accéder à ces
										fonctionnalités {stats.totalAttempts}{" "}
										fois. Un plan adapté vous permettrait
										d'optimiser votre pratique quotidienne.
									</p>
								</div>
							</div>
							<Button
								onClick={() => navigate("/pricing")}
								className="w-full"
							>
								Comparer les plans
							</Button>
						</div>
					</Card>
				)}
			</CardContent>
		</Card>
	);
}
