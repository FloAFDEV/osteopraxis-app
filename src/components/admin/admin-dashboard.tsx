import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { Layout } from "@/components/ui/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
	Building,
	Calendar,
	RefreshCw,
	ShieldCheck,
	User,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export function AdminDashboard() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalOsteopaths: 0,
		totalCabinets: 0,
		totalPatients: 0,
		totalAppointments: 0,
	});
	const [activeTab, setActiveTab] = useState("overview");

	// Charger les statistiques au montage du composant
	useEffect(() => {
		const loadAdminStats = async () => {
			try {
				setLoading(true);

				// Dans un environnement réel, vous auriez une API dédiée pour les statistiques d'admin
				// Pour l'instant, nous utilisons des appels API existants pour simuler
				const [users, osteopaths, cabinets, patients, appointments] =
					await Promise.all([
						api.getOsteopaths(), // Utilisé comme proxy pour les utilisateurs
						api.getOsteopaths(),
						api.getCabinets(),
						api.getPatients(),
						api.getAppointments(),
					]);

				setStats({
					totalUsers: osteopaths.length || 0,
					totalOsteopaths: osteopaths.length || 0,
					totalCabinets: cabinets.length || 0,
					totalPatients: patients.length || 0,
					totalAppointments: appointments.length || 0,
				});
			} catch (error) {
				console.error(
					"Erreur lors du chargement des statistiques admin:",
					error
				);
			} finally {
				setLoading(false);
			}
		};

		if (user?.role === "ADMIN") {
			loadAdminStats();
		}
	}, [user]);

	if (!user || user.role !== "ADMIN") {
		return (
			<Layout>
				<div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
					<ShieldCheck className="text-red-500 h-16 w-16 mb-4" />
					<h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
					<p className="text-muted-foreground text-center max-w-md">
						Vous n'avez pas les droits d'administration nécessaires
						pour accéder à cette page.
					</p>
				</div>
			</Layout>
		);
	}

	if (loading) {
		return (
			<FancyLoader message="Chargement de l'interface d'administration..." />
		);
	}

	return (
		<Layout>
			<div className="space-y-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<ShieldCheck className="h-8 w-8 text-amber-500" />
							Administration
						</h1>
						<p className="text-muted-foreground">
							Interface d'administration pour gérer l'ensemble des
							utilisateurs, ostéopathes et cabinets
						</p>
					</div>
					<button
						onClick={() => window.location.reload()}
						className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1.5 rounded-md text-sm"
					>
						<RefreshCw className="h-3.5 w-3.5" />
						Actualiser
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Utilisateurs
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex justify-between items-center">
								<div className="text-2xl font-bold">
									{stats.totalUsers}
								</div>
								<Users className="h-4 w-4 text-muted-foreground" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Ostéopathes
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex justify-between items-center">
								<div className="text-2xl font-bold">
									{stats.totalOsteopaths}
								</div>
								<User className="h-4 w-4 text-muted-foreground" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Cabinets
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex justify-between items-center">
								<div className="text-2xl font-bold">
									{stats.totalCabinets}
								</div>
								<Building className="h-4 w-4 text-muted-foreground" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Patients
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex justify-between items-center">
								<div className="text-2xl font-bold">
									{stats.totalPatients}
								</div>
								<Calendar className="h-4 w-4 text-muted-foreground" />
							</div>
						</CardContent>
					</Card>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
						<TabsTrigger value="overview">
							Vue d'ensemble
						</TabsTrigger>
						<TabsTrigger value="osteopaths">
							Ostéopathes
						</TabsTrigger>
						<TabsTrigger value="cabinets">Cabinets</TabsTrigger>
						<TabsTrigger value="patients">Patients</TabsTrigger>
					</TabsList>

					<TabsContent value="overview">
						<Card>
							<CardHeader>
								<CardTitle>Vue d'ensemble</CardTitle>
							</CardHeader>
							<CardContent>
								<p>
									Cette interface vous permet d'administrer
									l'ensemble de l'application. Vous pouvez y
									voir et gérer tous les ostéopathes, cabinets
									et patients.
								</p>
								<div className="mt-4 grid gap-4">
									<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
										<h3 className="font-medium mb-1 flex items-center gap-1.5">
											<ShieldCheck className="h-4 w-4" />
											Accès administrateur
										</h3>
										<p className="text-sm text-muted-foreground">
											En tant qu'administrateur, vous avez
											un accès complet à toutes les
											données de la plateforme.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="osteopaths">
						<Card>
							<CardHeader>
								<CardTitle>Gestion des ostéopathes</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<p className="text-muted-foreground">
										Interface de gestion des ostéopathes à
										implémenter
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="cabinets">
						<Card>
							<CardHeader>
								<CardTitle>Gestion des cabinets</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<p className="text-muted-foreground">
										Interface de gestion des cabinets à
										implémenter
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="patients">
						<Card>
							<CardHeader>
								<CardTitle>Gestion des patients</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<p className="text-muted-foreground">
										Interface de gestion des patients à
										implémenter
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</Layout>
	);
}
