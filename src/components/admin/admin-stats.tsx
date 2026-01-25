import React, { useState, useEffect } from "react";
import { adminService, AdminStats } from "@/services/admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Users,
	UserCheck,
	Stethoscope,
	Building,
	CalendarDays,
	Trash2,
	TrendingUp,
	Activity,
} from "lucide-react";

export function AdminStatsPanel() {
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		try {
			setLoading(true);
			const data = await adminService.getAdminStats();
			setStats(data);
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<div className="animate-pulse">
								<div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
								<div className="h-8 bg-muted rounded w-3/4"></div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!stats) return null;

	const statCards = [
		{
			title: "Utilisateurs totaux",
			value: stats.totalUsers,
			subtitle: `${stats.activeUsers} actifs`,
			icon: Users,
			color: "text-blue-500",
			bg: "bg-blue-500/10",
		},
		{
			title: "Ostéopathes",
			value: stats.totalOsteopaths,
			subtitle: "Praticiens inscrits",
			icon: Stethoscope,
			color: "text-green-500",
			bg: "bg-green-500/10",
		},
		{
			title: "Cabinets",
			value: stats.totalCabinets,
			subtitle: "Structures médicales",
			icon: Building,
			color: "text-purple-500",
			bg: "bg-purple-500/10",
		},
		{
			title: "Patients",
			value: stats.totalPatients,
			subtitle: "Dossiers actifs",
			icon: UserCheck,
			color: "text-pink-500",
			bg: "bg-pink-500/10",
		},
		{
			title: "Rendez-vous",
			value: stats.totalAppointments,
			subtitle: "Total planifiés",
			icon: CalendarDays,
			color: "text-amber-500",
			bg: "bg-amber-500/10",
		},
		{
			title: "Suppressions",
			value: stats.deletedRecords,
			subtitle: "Enregistrements supprimés",
			icon: Trash2,
			color: "text-red-500",
			bg: "bg-red-500/10",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<Activity className="h-6 w-6 text-blue-500" />
					Statistiques Globales
				</h2>
				<button
					onClick={loadStats}
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					Actualiser
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{statCards.map((stat, index) => (
					<Card
						key={index}
						className="hover:shadow-md transition-shadow"
					>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-muted-foreground">
										{stat.title}
									</p>
									<p className="text-3xl font-bold">
										{stat.value}
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										{stat.subtitle}
									</p>
								</div>
								<div className={`${stat.bg} p-3 rounded-full`}>
									<stat.icon
										className={`h-6 w-6 ${stat.color}`}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Métriques supplémentaires */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<TrendingUp className="h-5 w-5 text-green-500" />
							Taux d'activité
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm">
									Utilisateurs actifs
								</span>
								<span className="font-medium">
									{stats.totalUsers > 0
										? Math.round(
												(stats.activeUsers /
													stats.totalUsers) *
													100,
											)
										: 0}
									%
								</span>
							</div>
							<div className="w-full bg-muted rounded-full h-2">
								<div
									className="bg-green-500 h-2 rounded-full"
									style={{
										width: `${
											stats.totalUsers > 0
												? (stats.activeUsers /
														stats.totalUsers) *
													100
												: 0
										}%`,
									}}
								></div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Trash2 className="h-5 w-5 text-red-500" />
							Données supprimées
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm">
									Enregistrements récupérables
								</span>
								<span className="font-medium text-red-500">
									{stats.deletedRecords}
								</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Ces enregistrements peuvent être restaurés
								depuis l'interface d'administration
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
