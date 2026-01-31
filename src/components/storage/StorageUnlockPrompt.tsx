/**
 * Prompt de déverrouillage du stockage HDS sécurisé
 * Utilise hds-secure-manager
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield, AlertTriangle, Lightbulb, FileText } from "lucide-react";
import { hdsSecureManager } from "@/services/hds-secure-storage/hds-secure-manager";
import { toast } from "sonner";

interface StorageUnlockPromptProps {
	securityMethod: "pin" | "password";
	onUnlock: () => void;
	onCancel?: () => void;
	onPasswordForgotten?: () => void;
}

export const StorageUnlockPrompt: React.FC<StorageUnlockPromptProps> = ({
	securityMethod,
	onUnlock,
	onCancel,
	onPasswordForgotten,
}) => {
	const resetState = () => {
		setCredential("");
		setAttempts(0);
		setError(null);
	};
	const [credential, setCredential] = useState("");
	const [isUnlocking, setIsUnlocking] = useState(false);
	const [attempts, setAttempts] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const maxAttempts = 3;
	const isLocked = attempts >= maxAttempts;

	const handleUnlock = async () => {
		if (!credential.trim()) {
			setError("Veuillez saisir votre mot de passe");
			return;
		}

		setIsUnlocking(true);
		setError(null);

		try {
			const success = await hdsSecureManager.unlock(credential);

			if (success) {
				toast.success("Stockage déverrouillé avec succès");
				onUnlock();
			} else {
				const newAttempts = attempts + 1;
				setAttempts(newAttempts);

				if (newAttempts >= maxAttempts) {
					setError(
						"Trop de tentatives incorrectes. Veuillez redémarrer l'application.",
					);
					toast.error("Accès bloqué après 3 tentatives");
				} else {
					setError(
						`Mot de passe incorrect. ` +
							`${maxAttempts - newAttempts} tentative(s) restante(s).`,
					);
					setCredential("");
				}
			}
		} catch (error) {
			console.error("Unlock error:", error);
			setError("Erreur lors du déverrouillage du stockage");
			toast.error("Erreur de déverrouillage");
		} finally {
			setIsUnlocking(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !isLocked && !isUnlocking) {
			handleUnlock();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
						<Lock className="w-8 h-8 text-primary" />
					</div>
					<div>
						<CardTitle className="text-xl font-semibold">
							Déverrouillage du stockage HDS
						</CardTitle>
						<p className="text-muted-foreground mt-2">
							Saisissez votre mot de passe pour accéder aux
							données sensibles
						</p>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Indicateur de sécurité */}
					<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
						<Shield className="w-4 h-4" />
						<span>Stockage local sécurisé HDS</span>
						<Badge variant="secondary" className="text-sm">
							Obligatoire
						</Badge>
					</div>

					{/* Formulaire de déverrouillage */}
					<div className="space-y-4">
						<div>
							<Label
								htmlFor="credential"
								className="text-sm font-medium"
							>
								Mot de passe
							</Label>
							<Input
								id="credential"
								type="password"
								placeholder="Entrez votre mot de passe"
								value={credential}
								onChange={(e) => setCredential(e.target.value)}
								onKeyPress={handleKeyPress}
								disabled={isLocked || isUnlocking}
								className="text-center"
								autoFocus
							/>
						</div>

						{/* Compteur de tentatives */}
						{attempts > 0 && !isLocked && (
							<div className="text-center text-sm text-muted-foreground">
								Tentative {attempts} sur {maxAttempts}
							</div>
						)}
					</div>

					{/* Messages d'erreur */}
					{error && (
						<Alert className="border-red-200 bg-red-50">
							<AlertTriangle className="h-4 w-4 text-red-600" />
							<AlertDescription className="text-red-800">
								{error}
							</AlertDescription>
						</Alert>
					)}

					{/* Actions */}
					<div className="space-y-3">
						<Button
							onClick={handleUnlock}
							disabled={
								isLocked || isUnlocking || !credential.trim()
							}
							className="w-full"
							size="lg"
						>
							{isUnlocking ? (
								<>
									<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
									Déverrouillage...
								</>
							) : (
								"Déverrouiller"
							)}
						</Button>

						{isLocked && (
							<div className="space-y-2">
								<Button
									variant="outline"
									onClick={() => {
										resetState();
										onPasswordForgotten?.();
									}}
									className="w-full"
									size="sm"
								>
									Mot de passe oublié ?
								</Button>
								<p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-1">
									<Lightbulb className="h-3 w-3" /> Récupérez vos données via une sauvegarde
									.phds
								</p>
							</div>
						)}

						{onCancel && !isLocked && (
							<Button
								variant="ghost"
								onClick={onCancel}
								className="w-full"
								size="sm"
							>
								Annuler
							</Button>
						)}
					</div>

					{/* Information de sécurité */}
					<div className="text-sm text-center text-muted-foreground space-y-1">
						<p className="flex items-center justify-center gap-1">
							<Lock className="h-3 w-3" /> Vos données sont chiffrées localement avec
							AES-256-GCM
						</p>
						<p className="flex items-center justify-center gap-1"><FileText className="h-3 w-3" /> Conforme aux exigences HDS françaises</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
