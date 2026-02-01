import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import {
	UserCog,
	Building,
	CheckCircle,
	ArrowRight,
	Plus,
	AlertTriangle,
	Phone,
	Mail,
} from "lucide-react";
import { toast } from "sonner";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Osteopath, Cabinet } from "@/types";
import { Button } from "@/components/ui/button";
import { CabinetForm } from "@/components/cabinet";
import { FancyLoader } from "@/components/ui/fancy-loader";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useDemo } from "@/contexts/DemoContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OsteopathProfilePage = () => {
	const { user, updateUser, loadStoredToken } = useAuth();
	const { isDemoMode } = useDemo();
	const [loading, setLoading] = useState(true);
	const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
	const [cabinets, setCabinets] = useState<Cabinet[]>([]);
	const [showCabinetForm, setShowCabinetForm] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [showAuthSheet, setShowAuthSheet] = useState(false);
	const [authChecked, setAuthChecked] = useState(false);
	const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
	const [setupFlow, setSetupFlow] = useState<"profile" | "cabinet">(
		"profile",
	);
	const [setupProgress, setSetupProgress] = useState(0);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const selectedPlan = (searchParams.get("plan") || "light") as
		| "light"
		| "full"
		| "pro";

	// Générer un nom par défaut si firstName et lastName sont manquants
	const getDefaultName = useCallback(() => {
		if (user) {
			if (user.firstName && user.lastName) {
				return `${user.firstName} ${user.lastName}`;
			} else if (user.firstName) {
				return user.firstName;
			} else if (user.lastName) {
				return user.lastName;
			} else if (user.email) {
				// Extraire un nom à partir de l'email
				const emailName = user.email.split("@")[0];
				// Capitaliser le nom extrait de l'email et remplacer les points/tirets par des espaces
				return emailName
					.split(/[._-]/)
					.map(
						(part) =>
							part.charAt(0).toUpperCase() +
							part.slice(1).toLowerCase(),
					)
					.join(" ");
			}
		}
		return "";
	}, [user]);

	// Vérifier si l'utilisateur a déjà un ostéopathe et des cabinets
	const checkExistingData = useCallback(async () => {
		if (!user) return;

		try {
			// ✅ Vérification données existantes
			setLoading(true);

			// Vérifions d'abord si un ostéopathe existe
			const existingOsteopath = await api.getOsteopathByUserId(user.id);
			console.log(
				"Résultat de la recherche d'ostéopathe:",
				existingOsteopath || "Aucun trouvé",
			);

			if (existingOsteopath && existingOsteopath.id) {
				console.log("Ostéopathe trouvé avec ID:", existingOsteopath.id);
				setOsteopath(existingOsteopath);
				setSetupProgress(50);

				// Mise à jour de l'utilisateur avec l'ID de l'ostéopathe si nécessaire
				if (user && !user.osteopathId) {
					console.log(
						"Mise à jour de l'utilisateur avec l'ID de l'ostéopathe:",
						existingOsteopath.id,
					);
					const updatedUser = {
						...user,
						osteopathId: existingOsteopath.id,
					};
					updateUser(updatedUser);
				}

				// Charger les cabinets mais NE PAS rediriger automatiquement
				const existingCabinets = await api.getCabinetsByOsteopathId(
					existingOsteopath.id,
				);
				console.log(
					`${existingCabinets.length} cabinet(s) trouvé(s) pour l'ostéopathe`,
				);
				setCabinets(existingCabinets);

				// Si des cabinets existent, marquer comme terminé mais rester sur la page
				if (existingCabinets && existingCabinets.length > 0) {
					console.log(
						"Cabinets existants trouvés, configuration terminée - restant sur la page",
					);
					setSetupProgress(100);
					setSetupFlow("cabinet");
				} else {
					// Aucun cabinet, proposer la création
					setSetupFlow("cabinet");
				}
			} else {
				// Aucun ostéopathe trouvé, rester sur le formulaire de création
				console.log(
					"Aucun ostéopathe trouvé, formulaire de création nécessaire",
				);
				setOsteopath(null);
				setShowCabinetForm(false);
				setSetupFlow("profile");
				setSetupProgress(0);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la vérification des données existantes:",
				error,
			);
			setLoadError(
				"Une erreur est survenue lors de la vérification de vos données",
			);
		} finally {
			setLoading(false);
			setHasAttemptedLoad(true);
		}
	}, [user, updateUser]);

	// Rechargement du token d'authentification au montage du composant
	useEffect(() => {
		const checkAuthentication = async () => {
			try {
				console.log("Vérification de l'authentification...");
				await loadStoredToken();
				setAuthChecked(true);
			} catch (error) {
				console.error(
					"Erreur lors de la vérification d'authentification:",
					error,
				);
				setAuthChecked(true);
			}
		};

		checkAuthentication();
	}, [loadStoredToken]);

	// Chargement des données quand l'authentification est vérifiée
	useEffect(() => {
		if (authChecked && user && !hasAttemptedLoad) {
			console.log("Démarrage de la vérification des données existantes");
			checkExistingData();
		} else if (authChecked && !user) {
			console.log(
				"Utilisateur non connecté, affichage du formulaire de connexion",
			);
			setLoading(false);
		}
	}, [authChecked, user, checkExistingData, hasAttemptedLoad]);

	const handleRetry = () => {
		setLoading(true);
		setLoadError(null);
		setHasAttemptedLoad(false); // Reset pour permettre une nouvelle tentative
		loadStoredToken().then(() => {
			setTimeout(() => checkExistingData(), 500);
		});
	};

	// Si l'utilisateur n'est pas connecté et que l'authentification a été vérifiée, rediriger vers la connexion
	if (authChecked && !user && !showAuthSheet) {
		console.log("Redirection vers login: Utilisateur non connecté");
		return <Navigate to="/login" />;
	}

	const handleOsteopathSuccess = async (updatedOsteopath: Osteopath) => {
		console.log(
			"Succès de la mise à jour/création de l'ostéopathe:",
			updatedOsteopath,
		);

		// Si c'est une mise à jour d'un ostéopathe existant
		if (osteopath && osteopath.id) {
			toast.success("Profil mis à jour avec succès");

			// Mise à jour de l'utilisateur avec l'ID de l'ostéopathe si nécessaire
			if (!user?.osteopathId && updatedOsteopath.id) {
				const updatedUser = {
					...user!,
					osteopathId: updatedOsteopath.id,
				};
				updateUser(updatedUser);
			}
		} else {
			// Pour un nouveau profil
			toast.success(
				"Profil créé avec succès! Vous pouvez maintenant créer ou vous associer à un cabinet.",
			);

			// Mise à jour de l'utilisateur avec l'ID de l'ostéopathe
			if (updatedOsteopath && updatedOsteopath.id && user) {
				const updatedUser = {
					...user,
					osteopathId: updatedOsteopath.id,
				};
				updateUser(updatedUser);
			}
		}

		// Mettre à jour l'état local avec l'ostéopathe mis à jour
		setOsteopath(updatedOsteopath);
		setSetupProgress(50);

		// Vérifier si des cabinets existent déjà pour cet ostéopathe
		try {
			if (updatedOsteopath.id) {
				const existingCabinets = await api.getCabinetsByOsteopathId(
					updatedOsteopath.id,
				);
				setCabinets(existingCabinets || []);

				// Passer à l'étape cabinet mais ne pas rediriger
				setSetupFlow("cabinet");
				if (existingCabinets && existingCabinets.length > 0) {
					setSetupProgress(100);
				}
			}
		} catch (error) {
			console.error(
				"Erreur lors de la vérification des cabinets après création de l'ostéopathe:",
				error,
			);
		}
	};

	const handleCabinetSuccess = () => {
		setSetupProgress(100);
		toast.success("Cabinet créé avec succès!");
		// Recharger les cabinets après création
		if (osteopath?.id) {
			api.getCabinetsByOsteopathId(osteopath.id).then(setCabinets);
		}
	};

	const handleRelogin = () => {
		// Supprimer les données d'authentification en local et forcer un rechargement complet
		localStorage.removeItem("authState");

		// Redirection vers la page de connexion avec le chemin de retour
		window.location.href = `/login?returnTo=${encodeURIComponent("/dashboard")}`;
	};

	if (loading) {
		return <FancyLoader message="Chargement de votre profil..." />;
	}

	// Bloquer l'accès en mode démo
	if (isDemoMode) {
		return (
			<Layout>
				<div className="max-w-4xl mx-auto p-6">
					<Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
						<AlertTriangle className="h-4 w-4 text-red-600" />
						<AlertDescription className="text-red-800 dark:text-red-200">
							<strong>Accès restreint en mode démo</strong>
							<p className="mt-2">
								La modification du profil n'est pas disponible
								en mode démonstration pour des raisons de
								sécurité.
							</p>
						</AlertDescription>
					</Alert>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="max-w-4xl mx-auto">
				{/* Indicateur de progression */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<div
								className={`rounded-full flex items-center justify-center w-10 h-10 ${setupFlow === "profile" || setupProgress >= 50 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
							>
								{setupProgress >= 50 ? (
									<CheckCircle className="h-5 w-5" />
								) : (
									"1"
								)}
							</div>
							<div
								className={`h-1 w-20 mx-2 ${setupProgress >= 50 ? "bg-green-500" : "bg-gray-300"}`}
							></div>
							<div
								className={`rounded-full flex items-center justify-center w-10 h-10 ${setupFlow === "cabinet" || setupProgress >= 100 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
							>
								{setupProgress >= 100 ? (
									<CheckCircle className="h-5 w-5" />
								) : (
									"2"
								)}
							</div>
						</div>
						<div className="text-sm text-muted-foreground">
							{setupProgress === 0 &&
								"Créer votre profil professionnel"}
							{setupProgress === 50 && "Gérer vos cabinets"}
							{setupProgress === 100 && "Configuration terminée"}
						</div>
					</div>
					<div className="flex justify-between text-sm text-muted-foreground mt-2">
						<span>Profil Ostéopathe</span>
						<span>Cabinet</span>
					</div>
				</div>

				{/* Contenu principal */}
				<div className="space-y-8">
					{/* Étape 1: Profil Ostéopathe */}
					<div
						className={`transition-all duration-300 ${setupFlow === "profile" ? "opacity-100" : "opacity-50"}`}
					>
						<div className="mb-6">
							<div className="flex items-center gap-4">
								<UserCog className="h-8 w-8 text-amber-500" />
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h1 className="text-3xl font-bold">
											{osteopath
												? "Modifier votre profil"
												: "Créer votre profil professionnel"}
										</h1>
										{!osteopath && selectedPlan && (
											<span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/30 rounded-full px-3 py-1 text-sm font-medium text-primary">
												Plan{" "}
												{selectedPlan === "light"
													? "Light"
													: selectedPlan === "full"
														? "Full"
														: "Pro"}
											</span>
										)}
									</div>
									<p className="text-muted-foreground mt-1">
										{osteopath
											? "Mettez à jour vos informations professionnelles"
											: "Commençons par créer votre profil d'ostéopathe"}
									</p>
								</div>
							</div>
						</div>

						<OsteopathProfileForm
							currentOsteopath={osteopath}
							osteopathId={osteopath?.id}
							isEditing={!!osteopath}
							onSuccess={handleOsteopathSuccess}
							selectedPlan={selectedPlan} // Passer le plan sélectionné
						/>
					</div>

					{/* Étape 2: Gestion des Cabinets */}
					{osteopath && (
						<div
							className={`transition-all duration-300 ${setupFlow === "cabinet" ? "opacity-100" : "opacity-50"}`}
						>
							<div className="mb-6">
								<div className="flex items-center gap-4">
									<Building className="h-8 w-8 text-blue-500" />
									<div>
										<h2 className="text-2xl font-bold">
											Gestion des Cabinets
										</h2>
										<p className="text-muted-foreground mt-1">
											Créez un nouveau cabinet ou
											associez-vous à un cabinet existant
										</p>
									</div>
								</div>
							</div>

							{/* Liste des cabinets existants */}
							{cabinets.length > 0 && (
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-4">
										Vos cabinets
									</h3>
									<div className="grid gap-4">
										{cabinets.map((cabinet) => (
											<Card key={cabinet.id}>
												<CardHeader>
													<CardTitle className="flex items-center gap-2">
														<Building className="h-5 w-5" />
														{cabinet.name}
													</CardTitle>
													<CardDescription>
														{cabinet.address}
													</CardDescription>
												</CardHeader>
												<CardContent>
													<div className="flex justify-between items-center">
														<div className="text-sm text-muted-foreground">
															{cabinet.phone && (
																<p className="flex items-center gap-1">
																	<Phone className="h-3 w-3" />
																	{cabinet.phone}
																</p>
															)}
															{cabinet.email && (
																<p className="flex items-center gap-1">
																	<Mail className="h-3 w-3" />
																	{cabinet.email}
																</p>
															)}
														</div>
														<Button
															variant="outline"
															onClick={() =>
																navigate(
																	`/cabinets/${cabinet.id}/edit`,
																)
															}
														>
															Modifier
														</Button>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							)}

							{/* Options pour créer ou s'associer */}
							<div className="grid gap-4">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Plus className="h-5 w-5" />
											Créer un nouveau cabinet
										</CardTitle>
										<CardDescription>
											Créez votre propre cabinet si vous
											exercez seul ou si vous voulez créer
											un nouveau cabinet
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Button
											onClick={() =>
												setShowCabinetForm(true)
											}
										>
											Créer un cabinet
										</Button>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Building className="h-5 w-5" />
											S'associer à un cabinet existant
										</CardTitle>
										<CardDescription>
											Rejoignez un cabinet existant si
											vous exercez avec d'autres
											ostéopathes
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Button
											variant="outline"
											onClick={() =>
												navigate(
													"/settings/collaborations",
												)
											}
										>
											Gérer les associations
										</Button>
									</CardContent>
								</Card>
							</div>

							{/* Navigation vers le tableau de bord */}
							{cabinets.length > 0 && (
								<div className="mt-8 text-center">
									<Button
										onClick={() => navigate("/dashboard")}
										size="lg"
										className="min-w-[200px]"
									>
										Accéder au tableau de bord
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							)}
						</div>
					)}

					{/* Guide d'utilisation */}
					{osteopath && (
						<Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
							<CardHeader>
								<CardTitle className="text-blue-800 dark:text-blue-200">
									Comment ça marche ?
								</CardTitle>
							</CardHeader>
							<CardContent className="text-blue-700 dark:text-blue-300 space-y-2">
								<p>
									<strong>
										Plusieurs ostéopathes dans un cabinet :
									</strong>
								</p>
								<ul className="list-disc pl-6 space-y-1">
									<li>
										Le premier ostéopathe crée le cabinet
									</li>
									<li>
										Les autres s'associent via "Gérer les
										associations"
									</li>
									<li>
										Tous peuvent voir les patients du
										cabinet
									</li>
								</ul>
								<p className="mt-4">
									<strong>Remplacements :</strong>
								</p>
								<ul className="list-disc pl-6 space-y-1">
									<li>
										L'ostéopathe titulaire configure ses
										remplaçants
									</li>
									<li>
										Le remplaçant peut créer des factures au
										nom du titulaire
									</li>
									<li>
										Gérez cela dans "Collaborations" →
										"Remplacements"
									</li>
								</ul>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Modal pour créer un cabinet */}
				<Sheet open={showCabinetForm} onOpenChange={setShowCabinetForm}>
					<SheetContent className="w-full max-w-4xl overflow-y-auto">
						<SheetHeader>
							<SheetTitle>Créer un nouveau cabinet</SheetTitle>
						</SheetHeader>
						<div className="mt-6">
							<CabinetForm
								osteopathId={osteopath?.id}
								onSuccess={() => {
									setShowCabinetForm(false);
									handleCabinetSuccess();
								}}
							/>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</Layout>
	);
};

export default OsteopathProfilePage;
