import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
	Users,
	Building,
	Calendar,
	Database,
	AlertTriangle,
	CheckCircle,
	RefreshCw,
	Trash2,
	Zap,
} from "lucide-react";

interface SystemOverview {
	totalUsers: number;
	activeUsers: number;
	totalPatients: number;
	totalAppointments: number;
	totalCabinets: number;
	systemHealth: "healthy" | "warning" | "critical";
	lastBackup: string;
	storageUsed: string;
}

export function SimpleAdminOverview() {
	const [overview, setOverview] = useState<SystemOverview>({
		totalUsers: 0,
		activeUsers: 0,
		totalPatients: 0,
		totalAppointments: 0,
		totalCabinets: 0,
		systemHealth: "healthy",
		lastBackup: "Automatique - Supabase",
		storageUsed: "Calcul en cours...",
	});
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	const loadSystemOverview = async () => {
		try {
			setLoading(true);

			// Charger les stats système
			const { data: stats, error } = await supabase.rpc(
				"admin_get_system_stats",
			);

			if (error) throw error;

			if (stats && stats.length > 0) {
				const stat = stats[0];
				setOverview({
					totalUsers: stat.total_users || 0,
					activeUsers: stat.active_users || 0,
					totalPatients: stat.total_patients || 0,
					totalAppointments: stat.total_appointments || 0,
					totalCabinets: stat.total_cabinets || 0,
					systemHealth: "healthy",
					lastBackup: "Automatique - Supabase",
					storageUsed: "Optimisé",
				});
			}
		} catch (error) {
			console.error("Erreur lors du chargement:", error);
			toast.error("Erreur lors du chargement des données");
		} finally {
			setLoading(false);
		}
	};

	const runQuickAction = async (action: string) => {
		setActionLoading(action);
		try {
			switch (action) {
				case "cleanup":
					const { data: cleanupResult, error: cleanupError } =
						await supabase.rpc("admin_cleanup_old_logs", {
							days_old: 30,
						});
					if (cleanupError) throw cleanupError;
					toast.success(
						`Nettoyage terminé: ${(cleanupResult as any)?.deleted_count || 0} logs supprimés`,
					);
					break;

				case "optimize":
					const { data: optimizeResult, error: optimizeError } =
						await supabase.rpc("admin_optimize_performance");
					if (optimizeError) throw optimizeError;
					toast.success(
						"Optimisation de la base de données terminée",
					);
					break;

				case "refresh":
					await loadSystemOverview();
					toast.success("Données actualisées");
					break;

				default:
					toast.info("Action en cours de développement");
			}
		} catch (error) {
			console.error("Erreur action:", error);
			toast.error("Erreur lors de l'exécution de l'action");
		} finally {
			setActionLoading(null);
		}
	};

	useEffect(() => {
		loadSystemOverview();
	}, []);

	const getHealthBadge = (health: string) => {
		switch (health) {
			case "healthy":
				return (
					<Badge className="bg-green-100 text-green-800">
						<CheckCircle className="h-3 w-3 mr-1" />
						Système OK
					</Badge>
				);
			case "warning":
				return (
					<Badge className="bg-yellow-100 text-yellow-800">
						<AlertTriangle className="h-3 w-3 mr-1" />
						Attention
					</Badge>
				);
			case "critical":
				return (
					<Badge className="bg-red-100 text-red-800">
						<AlertTriangle className="h-3 w-3 mr-1" />
						Critique
					</Badge>
				);
			default:
				return <Badge variant="secondary">Inconnu</Badge>;
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="animate-pulse">
									<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
									<div className="h-8 bg-gray-200 rounded w-1/2"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Statistiques principales */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Utilisateurs
								</p>
								<p className="text-2xl font-bold">
									{overview.totalUsers}
								</p>
								<p className="text-sm text-muted-foreground">
									{overview.activeUsers} actifs
								</p>
							</div>
							<Users className="h-8 w-8 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Patients
								</p>
								<p className="text-2xl font-bold">
									{overview.totalPatients}
								</p>
							</div>
							<Calendar className="h-8 w-8 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Cabinets
								</p>
								<p className="text-2xl font-bold">
									{overview.totalCabinets}
								</p>
							</div>
							<Building className="h-8 w-8 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									RDV
								</p>
								<p className="text-2xl font-bold">
									{overview.totalAppointments}
								</p>
							</div>
							<Calendar className="h-8 w-8 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* État du système */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="h-5 w-5" />
							État du Système
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm">Santé globale</span>
							{getHealthBadge(overview.systemHealth)}
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Stockage</span>
							<Badge variant="outline">
								{overview.storageUsed}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm">Dernier backup</span>
							<Badge variant="outline">
								{overview.lastBackup}
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Actions Rapides</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button
							onClick={() => runQuickAction("cleanup")}
							disabled={actionLoading === "cleanup"}
							variant="outline"
							className="w-full justify-start"
						>
							<Trash2 className="h-4 w-4 mr-2" />
							{actionLoading === "cleanup"
								? "Nettoyage..."
								: "Nettoyer les logs"}
						</Button>

						<Button
							onClick={() => runQuickAction("optimize")}
							disabled={actionLoading === "optimize"}
							variant="outline"
							className="w-full justify-start"
						>
							<Zap className="h-4 w-4 mr-2" />
							{actionLoading === "optimize"
								? "Optimisation..."
								: "Optimiser la base"}
						</Button>

						<Button
							onClick={() => runQuickAction("refresh")}
							disabled={actionLoading === "refresh"}
							variant="outline"
							className="w-full justify-start"
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							{actionLoading === "refresh"
								? "Actualisation..."
								: "Actualiser les données"}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
