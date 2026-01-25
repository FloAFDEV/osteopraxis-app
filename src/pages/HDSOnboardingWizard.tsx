/**
 * Wizard interactif pour la configuration HDS
 * Guide l'utilisateur pas à pas dans la configuration du stockage sécurisé
 */

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
	Shield,
	Lock,
	HardDrive,
	CheckCircle,
	ArrowRight,
	ArrowLeft,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hdsSecureManager } from "@/services/hds-secure-storage/hds-secure-manager";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type WizardStep = "intro" | "password" | "storage" | "complete";

export default function HDSOnboardingWizard() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState<WizardStep>("intro");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const steps: { key: WizardStep; label: string }[] = [
		{ key: "intro", label: "Introduction" },
		{ key: "password", label: "Mot de passe" },
		{ key: "storage", label: "Stockage" },
		{ key: "complete", label: "Terminé" },
	];

	const currentStepIndex = steps.findIndex((s) => s.key === currentStep);
	const progress = ((currentStepIndex + 1) / steps.length) * 100;

	const handleSetupStorage = async () => {
		if (password.length < 12) {
			toast.error("Le mot de passe doit contenir au moins 12 caractères");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Les mots de passe ne correspondent pas");
			return;
		}

		setLoading(true);

		try {
			// Utiliser OPFS automatiquement
			await hdsSecureManager.configure({
				password,
				entities: ["patients", "appointments", "invoices"],
			});

			setCurrentStep("complete");
			toast.success("Stockage HDS configuré avec succès !");
		} catch (error) {
			console.error("Erreur configuration HDS:", error);
			toast.error("Erreur lors de la configuration du stockage sécurisé");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Helmet>
				<title>Configuration HDS - OstéoPraxis</title>
			</Helmet>

			<div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
				<div className="container max-w-3xl mx-auto px-4 py-12">
					{/* Progress bar */}
					<div className="mb-8">
						<Progress value={progress} className="h-2" />
						<div className="flex justify-between mt-2 text-sm text-muted-foreground">
							{steps.map((step, index) => (
								<span
									key={step.key}
									className={
										currentStepIndex >= index
											? "font-medium text-foreground"
											: ""
									}
								>
									{step.label}
								</span>
							))}
						</div>
					</div>

					{/* Intro */}
					{currentStep === "intro" && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3 mb-2">
									<Shield className="h-8 w-8 text-primary" />
									<CardTitle className="text-2xl">
										Bienvenue dans OstéoPraxis
									</CardTitle>
								</div>
								<CardDescription>
									Configuration du stockage sécurisé conforme
									HDS
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<Alert>
									<Lock className="h-4 w-4" />
									<AlertDescription>
										<strong>
											Conformité HDS obligatoire
										</strong>{" "}
										: Vos données de santé sont stockées
										localement sur votre ordinateur,
										chiffrées avec un mot de passe que vous
										seul connaissez.
									</AlertDescription>
								</Alert>

								<div className="space-y-4">
									<div className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-1" />
										<div>
											<p className="font-medium">
												Sécurité maximale
											</p>
											<p className="text-sm text-muted-foreground">
												Chiffrement AES-256-GCM + HMAC
												pour l'intégrité des données
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-1" />
										<div>
											<p className="font-medium">
												Contrôle total
											</p>
											<p className="text-sm text-muted-foreground">
												Vos données restent sur votre
												machine, aucun cloud tiers
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-1" />
										<div>
											<p className="font-medium">
												Conformité garantie
											</p>
											<p className="text-sm text-muted-foreground">
												Respect complet du cadre
												réglementaire HDS et RGPD
											</p>
										</div>
									</div>
								</div>

								<Button
									className="w-full"
									size="lg"
									onClick={() => setCurrentStep("password")}
								>
									Commencer la configuration
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Password step */}
					{currentStep === "password" && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3 mb-2">
									<Lock className="h-8 w-8 text-primary" />
									<CardTitle className="text-2xl">
										Créez votre mot de passe de sécurité
									</CardTitle>
								</div>
								<CardDescription>
									Ce mot de passe chiffrera toutes vos données
									sensibles
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<Alert>
									<AlertDescription>
										<strong>Important :</strong> Conservez
										ce mot de passe précieusement. Sans lui,
										impossible d'accéder à vos données. Nous
										ne pouvons pas le récupérer.
									</AlertDescription>
								</Alert>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="password">
											Mot de passe (min. 12 caractères)
										</Label>
										<Input
											id="password"
											type="password"
											value={password}
											onChange={(e) =>
												setPassword(e.target.value)
											}
											placeholder="Minimum 12 caractères"
											autoComplete="new-password"
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="confirmPassword">
											Confirmer le mot de passe
										</Label>
										<Input
											id="confirmPassword"
											type="password"
											value={confirmPassword}
											onChange={(e) =>
												setConfirmPassword(
													e.target.value,
												)
											}
											placeholder="Confirmez votre mot de passe"
											autoComplete="new-password"
										/>
									</div>

									<div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
										<p className="font-medium">
											Conseils pour un mot de passe fort :
										</p>
										<ul className="space-y-1 ml-4 list-disc text-muted-foreground">
											<li>Au moins 12 caractères</li>
											<li>
												Mélangez majuscules, minuscules,
												chiffres et symboles
											</li>
											<li>
												Évitez les mots courants du
												dictionnaire
											</li>
											<li>
												Ne réutilisez pas un mot de
												passe existant
											</li>
										</ul>
									</div>
								</div>

								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() => setCurrentStep("intro")}
										className="flex-1"
									>
										<ArrowLeft className="mr-2 h-4 w-4" />
										Retour
									</Button>
									<Button
										className="flex-1"
										onClick={() =>
											setCurrentStep("storage")
										}
										disabled={
											!password || password.length < 12
										}
									>
										Continuer
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Storage step */}
					{currentStep === "storage" && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3 mb-2">
									<HardDrive className="h-8 w-8 text-primary" />
									<CardTitle className="text-2xl">
										Configuration du stockage
									</CardTitle>
								</div>
								<CardDescription>
									Initialisation du stockage local sécurisé
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="p-4 bg-muted rounded-lg">
										<p className="text-sm">
											<strong>
												Technologie utilisée :
											</strong>{" "}
											Origin Private File System (OPFS)
										</p>
										<p className="text-sm text-muted-foreground mt-2">
											Vos données sont stockées dans un
											espace privé du navigateur,
											automatiquement chiffré et
											accessible uniquement avec votre mot
											de passe.
										</p>
									</div>

									<Alert>
										<AlertDescription>
											Le stockage sera configuré
											automatiquement. Aucune action
											manuelle requise.
										</AlertDescription>
									</Alert>
								</div>

								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() =>
											setCurrentStep("password")
										}
										className="flex-1"
										disabled={loading}
									>
										<ArrowLeft className="mr-2 h-4 w-4" />
										Retour
									</Button>
									<Button
										className="flex-1"
										onClick={handleSetupStorage}
										disabled={loading}
									>
										{loading
											? "Configuration..."
											: "Configurer le stockage"}
										{!loading && (
											<ArrowRight className="ml-2 h-4 w-4" />
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Complete step */}
					{currentStep === "complete" && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3 mb-2">
									<CheckCircle className="h-8 w-8 text-green-500" />
									<CardTitle className="text-2xl">
										Configuration terminée !
									</CardTitle>
								</div>
								<CardDescription>
									Votre stockage sécurisé HDS est maintenant
									opérationnel
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<Alert className="bg-green-50 border-green-200">
									<CheckCircle className="h-4 w-4 text-green-600" />
									<AlertDescription className="text-green-800">
										Vos données sont maintenant protégées
										par un chiffrement de niveau bancaire.
										Vous êtes prêt à commencer !
									</AlertDescription>
								</Alert>

								<div className="space-y-3">
									<h3 className="font-medium">
										Prochaines étapes :
									</h3>
									<div className="space-y-2 text-sm text-muted-foreground">
										<p>✓ Créez votre premier cabinet</p>
										<p>✓ Ajoutez vos premiers patients</p>
										<p>
											✓ Explorez les fonctionnalités de
											l'application
										</p>
									</div>
								</div>

								<Button
									className="w-full"
									size="lg"
									onClick={() => navigate("/dashboard")}
								>
									Accéder au dashboard
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>

								<p className="text-sm text-center text-muted-foreground">
									💡 Astuce : Pensez à exporter vos données
									régulièrement depuis les paramètres
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</>
	);
}
