/**
 * 🔓 Panel de déverrouillage du stockage HDS sécurisé
 *
 * Affiché uniquement en mode connecté quand le stockage est configuré mais verrouillé
 */

import React, { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Unlock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface StorageUnlockPanelProps {
	onUnlock: (password: string) => Promise<boolean>;
	isLoading?: boolean;
}

export const StorageUnlockPanel: React.FC<StorageUnlockPanelProps> = ({
	onUnlock,
	isLoading = false,
}) => {
	const [password, setPassword] = useState("");
	const [attempting, setAttempting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleUnlock = async () => {
		if (!password) {
			setError("Veuillez saisir votre mot de passe");
			return;
		}

		setAttempting(true);
		setError(null);

		try {
			console.log("🔓 Tentative de déverrouillage du stockage HDS...");
			const success = await onUnlock(password);

			if (success) {
				console.log("✅ Stockage HDS déverrouillé avec succès");
				toast.success("Stockage HDS déverrouillé !");
				setPassword("");
			} else {
				console.error("❌ Mot de passe incorrect");
				setError("Mot de passe incorrect");
				toast.error("Mot de passe incorrect");
			}
		} catch (error) {
			console.error("❌ Erreur déverrouillage:", error);
			setError("Erreur lors du déverrouillage");
			toast.error("Erreur lors du déverrouillage du stockage");
		} finally {
			setAttempting(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleUnlock();
		}
	};

	return (
		<Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
			<CardHeader>
				<div className="flex items-center gap-3">
					<div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50">
						<Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
					</div>
					<div>
						<CardTitle className="text-xl">
							Stockage HDS verrouillé
						</CardTitle>
						<CardDescription>
							Déverrouillez votre stockage local sécurisé pour
							accéder à vos données médicales
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-2">
					<Label htmlFor="unlock-password">
						Mot de passe de déchiffrement
					</Label>
					<Input
						id="unlock-password"
						type="password"
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
							setError(null);
						}}
						onKeyPress={handleKeyPress}
						placeholder="Saisissez votre mot de passe"
						disabled={attempting || isLoading}
						autoFocus
					/>
					<p className="text-sm text-muted-foreground">
						Saisissez le mot de passe que vous avez défini lors de
						la configuration initiale
					</p>
				</div>

				<Button
					onClick={handleUnlock}
					disabled={!password || attempting || isLoading}
					className="w-full"
				>
					<Unlock className="h-4 w-4 mr-2" />
					{attempting
						? "Déverrouillage..."
						: "Déverrouiller le stockage HDS"}
				</Button>

				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription className="text-sm">
						<strong>Sécurité :</strong> Votre mot de passe n'est
						jamais stocké. Il est utilisé uniquement pour déchiffrer
						vos données localement.
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>
	);
};
