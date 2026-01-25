import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/ui/admin-layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, UserCheck, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLogsPanel } from "@/components/admin/admin-logs";
import { AdminSettingsPanel } from "@/components/admin/admin-settings";

// Type pour les utilisateurs à afficher dans l'interface admin
interface AdminUser {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	createdAt: string;
	osteopathId: number | null;
}

const AdminPage = () => {
	const { isAdmin, isLoading: authLoading, promoteToAdmin } = useAuth();
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// Redirection si non admin
	useEffect(() => {
		if (!authLoading && !isAdmin) {
			toast.error("Accès non autorisé");
			navigate("/");
		}
	}, [isAdmin, authLoading, navigate]);

	// Charger les utilisateurs
	useEffect(() => {
		const loadUsers = async () => {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from("User")
					.select("*")
					.order("created_at", { ascending: false });

				if (error) throw error;

				const formattedUsers = data.map((user) => ({
					id: user.id,
					email: user.email,
					firstName: user.first_name || "Non défini",
					lastName: user.last_name || "Non défini",
					role: user.role,
					createdAt: new Date(user.created_at).toLocaleDateString(
						"fr-FR",
					),
					osteopathId: user.osteopathId,
				}));

				setUsers(formattedUsers);
			} catch (error) {
				console.error(
					"Erreur lors du chargement des utilisateurs:",
					error,
				);
				toast.error("Erreur lors du chargement des utilisateurs");
			} finally {
				setLoading(false);
			}
		};

		if (isAdmin) {
			loadUsers();
		}
	}, [isAdmin]);

	const handlePromoteToAdmin = async (userId: string) => {
		try {
			await promoteToAdmin(userId);
			// Mettre à jour la liste des utilisateurs
			setUsers(
				users.map((user) => {
					if (user.id === userId) {
						return { ...user, role: "ADMIN" };
					}
					return user;
				}),
			);
		} catch (error) {
			console.error("Erreur lors de la promotion:", error);
		}
	};

	if (authLoading) {
		return (
			<AdminLayout>
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
				</div>
			</AdminLayout>
		);
	}

	if (!isAdmin) {
		return null; // La redirection sera gérée par useEffect
	}

	return (
		<AdminLayout>
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center mb-6">
					<Shield className="h-8 w-8 text-pink-500 mr-3" />
					<h1 className="text-3xl font-bold">Administration</h1>
				</div>

				<div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
					<div className="flex flex-col md:flex-row items-center">
						<AlertTriangle className="h-12 w-12 text-amber-500 mb-4 md:mb-0 md:mr-6" />
						<div>
							<h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">
								Zone d'administration
							</h3>
							<p className="text-amber-600/70 dark:text-amber-400/70 mt-1">
								Cette section est réservée aux administrateurs.
								Vous pouvez gérer les utilisateurs, attribuer
								des rôles et surveiller l'activité du système.
							</p>
						</div>
					</div>
				</div>

				<Tabs defaultValue="users" className="w-full">
					<TabsList className="grid grid-cols-1 md:grid-cols-3 mb-6">
						<TabsTrigger
							value="users"
							className="flex items-center"
						>
							<Users className="w-4 h-4 mr-2" />
							<span>Utilisateurs</span>
						</TabsTrigger>
						<TabsTrigger value="logs" className="flex items-center">
							<span>Logs</span>
						</TabsTrigger>
						<TabsTrigger
							value="settings"
							className="flex items-center"
						>
							<span>Paramètres</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="users">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<User className="h-5 w-5 mr-2" />
									Gestion des utilisateurs
								</CardTitle>
								<CardDescription>
									Liste des utilisateurs enregistrés sur la
									plateforme. Vous pouvez modifier leurs rôles
									ici.
								</CardDescription>
							</CardHeader>
							<CardContent>
								{loading ? (
									<div className="flex justify-center py-8">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
									</div>
								) : (
									<div className="overflow-x-auto">
										<table className="w-full border-collapse">
											<thead>
												<tr className="bg-muted/50 text-left">
													<th className="p-3 font-medium">
														Nom
													</th>
													<th className="p-3 font-medium">
														Email
													</th>
													<th className="p-3 font-medium">
														Rôle
													</th>
													<th className="p-3 font-medium">
														Date de création
													</th>
													<th className="p-3 font-medium">
														Actions
													</th>
												</tr>
											</thead>
											<tbody className="divide-y">
												{users.map((user) => (
													<tr
														key={user.id}
														className="hover:bg-muted/30"
													>
														<td className="p-3">
															{user.firstName}{" "}
															{user.lastName}
														</td>
														<td className="p-3">
															{user.email}
														</td>
														<td className="p-3">
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
																	user.role ===
																	"ADMIN"
																		? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
																		: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
																}`}
															>
																{user.role}
															</span>
														</td>
														<td className="p-3">
															{user.createdAt}
														</td>
														<td className="p-3">
															{user.role !==
															"ADMIN" ? (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		handlePromoteToAdmin(
																			user.id,
																		)
																	}
																	className="flex items-center"
																>
																	<UserCheck className="w-4 h-4 mr-1" />
																	Promouvoir
																	admin
																</Button>
															) : (
																<span className="text-sm text-muted-foreground">
																	Administrateur
																</span>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</CardContent>
							<CardFooter className="border-t p-4 bg-muted/20">
								<div className="text-sm text-muted-foreground">
									Total: {users.length} utilisateurs •{" "}
									{
										users.filter((u) => u.role === "ADMIN")
											.length
									}{" "}
									administrateurs
								</div>
							</CardFooter>
						</Card>
					</TabsContent>

					<TabsContent value="logs">
						<AdminLogsPanel />
					</TabsContent>

					<TabsContent value="settings">
						<AdminSettingsPanel />
					</TabsContent>
				</Tabs>
			</div>
		</AdminLayout>
	);
};

export default AdminPage;
