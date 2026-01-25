/**
 * 🎯 Prompt de première sauvegarde OBLIGATOIRE post-configuration
 * Modal non-ignorable qui force l'utilisateur à créer sa première sauvegarde
 */

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
	AlertTriangle,
	Download,
	CheckCircle,
	Shield,
	FileWarning,
} from "lucide-react";
import { hdsSecureManager } from "@/services/hds-secure-storage/hds-secure-manager";
import { toast } from "sonner";

interface FirstBackupPromptProps {
	isOpen: boolean;
	onComplete: () => void;
}

export const FirstBackupPrompt: React.FC<FirstBackupPromptProps> = ({
	isOpen,
	onComplete,
}) => {
	const [isExporting, setIsExporting] = useState(false);
	const [exported, setExported] = useState(false);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			await hdsSecureManager.exportAllSecure();
			setExported(true);
			toast.success("Première sauvegarde créée avec succès !");

			// Attendre 1.5s pour laisser l'utilisateur voir le succès
			setTimeout(() => {
				onComplete();
			}, 1500);
		} catch (error) {
			console.error("Erreur export:", error);
			toast.error("Erreur lors de la création de la sauvegarde");
			setIsExporting(false);
		}
	};

	const handleManualConfirm = () => {
		const confirmed = window.confirm(
			"⚠️ Êtes-vous absolument certain d'avoir créé et sécurisé votre sauvegarde ?\n\n" +
				"Sans sauvegarde valide, un mot de passe oublié entraînera la PERTE DÉFINITIVE de toutes vos données.\n\n" +
				"Continuer sans créer de sauvegarde maintenant ?",
		);

		if (!confirmed) return;

		const doubleConfirm = window.confirm(
			"🚨 DERNIÈRE CONFIRMATION\n\n" +
				"Je confirme avoir créé et sécurisé ma première sauvegarde .phds dans un endroit sûr.\n\n" +
				"Je comprends qu'en cas de perte du mot de passe ET de la sauvegarde, mes données seront irrécupérables.",
		);

		if (doubleConfirm) {
			toast.warning("Pensez à créer votre sauvegarde dès que possible !");
			onComplete();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={() => {}}>
			<DialogContent
				className="max-w-2xl"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Shield className="w-6 h-6 text-primary" />
						🎯 ÉTAPE CRUCIALE : Créez votre première sauvegarde
					</DialogTitle>
					<DialogDescription>
						Cette sauvegarde est votre assurance en cas d'oubli du
						mot de passe
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Alerte critique */}
					<Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
						<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
						<AlertDescription className="text-red-800 dark:text-red-200">
							<p className="font-bold text-base mb-2">
								⚠️ Sans cette sauvegarde :
							</p>
							<ul className="space-y-1 text-sm">
								<li>
									• Mot de passe oublié ={" "}
									<strong>PERTE TOTALE</strong> de vos données
								</li>
								<li>• Aucune récupération possible</li>
								<li>
									• Patients, rendez-vous, factures : tout
									sera inaccessible
								</li>
							</ul>
						</AlertDescription>
					</Alert>

					{/* Message principal */}
					{!exported ? (
						<Card className="p-6 border-primary">
							<div className="space-y-4">
								<div className="flex items-start gap-4">
									<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
										<Download className="w-6 h-6 text-primary" />
									</div>
									<div className="flex-1">
										<h3 className="font-semibold text-lg mb-2">
											Créez votre sauvegarde maintenant
										</h3>
										<p className="text-muted-foreground text-sm mb-4">
											Un fichier{" "}
											<code className="bg-muted px-1 rounded">
												.phds
											</code>{" "}
											chiffré sera téléchargé.
											Conservez-le dans un endroit sûr
											(clé USB, cloud personnel,
											gestionnaire de mots de passe).
										</p>
										<Button
											onClick={handleExport}
											disabled={isExporting}
											size="lg"
											className="w-full"
										>
											{isExporting ? (
												<>
													<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
													Création en cours...
												</>
											) : (
												<>
													<Download className="w-4 h-4 mr-2" />
													Créer ma première sauvegarde
												</>
											)}
										</Button>
									</div>
								</div>
							</div>
						</Card>
					) : (
						<Card className="p-6 border-green-200 bg-green-50 dark:bg-green-900/20">
							<div className="flex items-start gap-4">
								<CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
								<div className="flex-1">
									<h3 className="font-semibold text-lg text-green-700 dark:text-green-300 mb-2">
										✅ Sauvegarde créée avec succès !
									</h3>
									<p className="text-sm text-green-600 dark:text-green-400">
										Votre fichier .phds a été téléchargé.
										Conservez-le précieusement dans un
										endroit sûr.
									</p>
								</div>
							</div>
						</Card>
					)}

					{/* Informations de sécurité */}
					<Alert>
						<Shield className="h-4 w-4" />
						<AlertDescription>
							<p className="font-medium mb-2">
								💡 À propos de ce fichier .phds :
							</p>
							<ul className="space-y-1 text-sm">
								<li>
									• <strong>Chiffré</strong> avec votre mot de
									passe
								</li>
								<li>
									• Contient toutes vos données HDS actuelles
								</li>
								<li>
									• Permet la récupération en cas d'oubli du
									mot de passe
								</li>
								<li>
									• À conserver dans un endroit sécurisé (clé
									USB, cloud privé, etc.)
								</li>
							</ul>
						</AlertDescription>
					</Alert>

					{/* Option alternative */}
					{!exported && (
						<div className="border-t pt-4">
							<Button
								variant="ghost"
								onClick={handleManualConfirm}
								className="w-full text-muted-foreground hover:text-foreground"
								size="sm"
							>
								<FileWarning className="w-4 h-4 mr-2" />
								Je l'ai déjà fait manuellement (à vos risques)
							</Button>
						</div>
					)}

					{/* Rappel final */}
					<div className="text-sm text-center text-muted-foreground space-y-1">
						<p>
							📋 Recommandation : Créez une nouvelle sauvegarde
							chaque mois
						</p>
						<p>
							🔒 Ce fichier est votre seul moyen de récupération
							en cas de problème
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
