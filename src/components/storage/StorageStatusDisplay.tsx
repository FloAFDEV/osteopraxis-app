import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Database,
	Shield,
	HardDrive,
	Cloud,
	Lock,
	LockOpen,
	CheckCircle,
	AlertCircle,
	Info,
	User,
	XCircle,
	AlertTriangle,
} from "lucide-react";
import { useHybridStorage } from "@/hooks/useHybridStorage";
import { useAuth } from "@/contexts/AuthContext";

export const StorageStatusDisplay: React.FC = () => {
	const { status, isLoading } = useHybridStorage();
	const { user } = useAuth();

	// Vérifier si l'utilisateur est admin
	const isAdmin = user?.email?.includes("admin");

	// Si ce n'est pas un admin, ne pas afficher le diagnostic technique
	if (!isAdmin) {
		return null;
	}

	// Détecter le mode démo
	const isDemoMode =
		user?.email?.includes("demo") || user?.id?.toString().includes("demo");

	if (isLoading) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Message d'information pour le mode démo */}
			{isDemoMode && (
				<Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-700">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
							<User className="h-5 w-5" />
							Mode démonstration
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-1">
								<AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" /> Vous êtes en mode démonstration. Aucune
								donnée ne sera enregistrée en stockage local.
							</p>
							<p className="text-sm text-amber-700 dark:text-amber-300">
								Les données saisies seront automatiquement
								supprimées dans quelques minutes.
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* État général du stockage */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5 text-primary" />
						État du stockage hybride
					</CardTitle>
					<CardDescription>
						Statut de votre stockage local sécurisé
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-green-500" />
								<span className="text-sm font-medium">
									Stockage local
								</span>
								<Badge
									variant={
										status?.physicalStorageAvailable
											? "default"
											: "destructive"
									}
								>
									{status?.physicalStorageAvailable
										? "Actif"
										: "Inactif"}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground flex items-center gap-1">
								{status?.physicalStorageAvailable
									? <><CheckCircle className="h-3 w-3 text-green-500" /> Données sensibles stockées localement (conforme HDS)</>
									: <><XCircle className="h-3 w-3 text-red-500" /> Stockage local indisponible - Conformité HDS compromise</>}
							</p>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Lock className="h-4 w-4 text-blue-500" />
								<span className="text-sm font-medium">
									Chiffrement
								</span>
								<Badge
									variant={
										status?.isUnlocked
											? "default"
											: "secondary"
									}
								>
									{status?.isUnlocked
										? "Déverrouillé"
										: "Verrouillé"}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground flex items-center gap-1">
								{status?.isUnlocked
									? <><LockOpen className="h-3 w-3" /> Accès sécurisé autorisé (AES-256)</>
									: <><Lock className="h-3 w-3" /> Authentification requise</>}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Alertes de conformité */}
			{!status?.physicalStorageAvailable && (
				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<AlertCircle className="h-5 w-5" />
							Alerte de conformité HDS
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm text-destructive flex items-start gap-1">
								<AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" /> Le stockage local est requis pour la
								conformité à la réglementation française sur les
								données de santé (HDS).
							</p>
							<p className="text-sm text-muted-foreground">
								Solutions possibles:
							</p>
							<ul className="text-sm text-muted-foreground space-y-1 ml-4">
								<li>
									• Utilisez un navigateur récent (Chrome
									102+, Edge 102+)
								</li>
								<li>• Vérifiez que votre site est en HTTPS</li>
								<li>
									• Contactez le support technique si le
									problème persiste
								</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
