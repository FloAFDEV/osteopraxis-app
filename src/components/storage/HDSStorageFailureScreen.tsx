/**
 * Écran d'erreur pour les échecs du stockage HDS sécurisé
 * Implémente la stratégie "Fail Fast" pour forcer la sécurité
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, FileX, Users, RefreshCw } from "lucide-react";

interface HDSStorageFailureScreenProps {
	error: string;
	onRetry?: () => void;
	onUseDemo?: () => void;
}

export const HDSStorageFailureScreen: React.FC<
	HDSStorageFailureScreenProps
> = ({ error, onRetry, onUseDemo }) => {
	const navigate = useNavigate();

	const handleUseDemo = () => {
		if (onUseDemo) {
			onUseDemo();
		} else {
			// Redirection vers démo avec paramètre
			navigate("/?demo=forced");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center">
						<Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
					</div>
					<CardTitle className="text-2xl">
						Configuration du stockage sécurisé HDS
					</CardTitle>
					<CardDescription className="text-base mt-2">
						Pour garantir la conformité avec la réglementation HDS
						française, vos données patients doivent être stockées
						localement de manière sécurisée.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Pourquoi c'est obligatoire */}
					<Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
						<AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
						<AlertDescription className="text-blue-900 dark:text-blue-100">
							<strong className="block mb-2">
								Protection de vos données
							</strong>
							OstéoPraxis utilise un stockage local sécurisé :
							<ul className="list-disc ml-6 mt-2 space-y-1">
								<li>Stockage local chiffré (AES-256-GCM)</li>
								<li>
									Aucune donnée transmise vers un serveur externe
								</li>
								<li>Contrôle total sur vos données</li>
							</ul>
						</AlertDescription>
					</Alert>

					{/* Étapes de configuration */}
					<div className="space-y-3">
						<h3 className="font-semibold flex items-center gap-2">
							<FileX className="h-5 w-5 text-blue-600" />
							Configuration en 3 étapes :
						</h3>
						<ol className="space-y-3 ml-2">
							<li className="flex gap-3 items-start">
								<span className="font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-sm font-semibold">
									1
								</span>
								<span>
									Choisir un dossier de stockage sur votre
									ordinateur
								</span>
							</li>
							<li className="flex gap-3 items-start">
								<span className="font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-sm font-semibold">
									2
								</span>
								<span>
									Créer un mot de passe de chiffrement fort
									(≥12 caractères)
								</span>
							</li>
							<li className="flex gap-3 items-start">
								<span className="font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-sm font-semibold">
									3
								</span>
								<span>
									Valider - vos données seront automatiquement
									chiffrées
								</span>
							</li>
						</ol>
					</div>

					{/* Bouton de configuration */}
					<Button
						onClick={onRetry}
						className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
						size="lg"
					>
						<RefreshCw className="mr-2 h-5 w-5" />
						Configurer le stockage sécurisé maintenant
					</Button>

					{/* Alternative mode démo */}
					{onUseDemo && (
						<>
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-sm uppercase">
									<span className="bg-background px-2 text-muted-foreground">
										Ou
									</span>
								</div>
							</div>

							<Button
								onClick={onUseDemo}
								variant="outline"
								className="w-full"
							>
								<Users className="w-4 h-4 mr-2" />
								Utiliser le mode démo (sans données réelles)
							</Button>
						</>
					)}

					{/* Note sur la sécurité */}
					<div className="text-center pt-2">
						<p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
							<Shield className="h-4 w-4" />
							Vos données restent sur votre ordinateur, aucune
							synchronisation cloud
						</p>
					</div>

					{/* Informations techniques */}
					<details className="text-sm text-muted-foreground">
						<summary className="cursor-pointer font-medium mb-2 hover:text-foreground transition-colors">
							Informations techniques
						</summary>
						<div className="space-y-1 ml-4 text-sm">
							<p>
								• Stockage requis: File System Access API + OPFS
							</p>
							<p>• Chiffrement: AES-256-GCM obligatoire</p>
							<p>
								• Support: Navigateurs modernes uniquement
								(Chrome, Edge, Firefox récents)
							</p>
							<p>• Contexte: HTTPS ou localhost requis</p>
						</div>
					</details>
				</CardContent>
			</Card>
		</div>
	);
};
