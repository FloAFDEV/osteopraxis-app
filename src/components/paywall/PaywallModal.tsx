import React from "react";
import { useNavigate } from "react-router-dom";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Lock, Crown, Zap } from "lucide-react";
import type { PaywallReason } from "@/hooks/useDemoSession";

interface PaywallModalProps {
	isOpen: boolean;
	reason: PaywallReason;
	onClose?: () => void;
	onUpgrade?: () => void;
}

const PAYWALL_CONFIG: Record<
	PaywallReason,
	{
		title: string;
		message: string;
		icon: React.ReactNode;
		blocking: boolean;
	}
> = {
	timer_expired: {
		title: "Temps écoulé",
		message:
			"Votre session démo de 1 heure est terminée. Créez votre compte pour continuer sans limite.",
		icon: <Clock className="h-12 w-12 text-orange-500" />,
		blocking: true,
	},
	patient_limit: {
		title: "Limite atteinte",
		message:
			"La démo est limitée à 3 patients. Passez à la version Pro pour gérer un nombre illimité de patients.",
		icon: <Lock className="h-12 w-12 text-blue-500" />,
		blocking: false,
	},
	appointment_limit: {
		title: "Limite atteinte",
		message:
			"La démo est limitée à 2 rendez-vous. Débloquez les rendez-vous illimités avec un compte Pro.",
		icon: <Lock className="h-12 w-12 text-blue-500" />,
		blocking: false,
	},
	invoice_limit: {
		title: "Limite atteinte",
		message:
			"La démo est limitée à 1 facture. Créez autant de factures que nécessaire avec un compte Pro.",
		icon: <Lock className="h-12 w-12 text-blue-500" />,
		blocking: false,
	},
	export_blocked: {
		title: "Fonctionnalité Pro",
		message:
			"L'export PDF est réservé aux comptes Pro. Créez votre compte pour débloquer cette fonctionnalité.",
		icon: <Crown className="h-12 w-12 text-purple-500" />,
		blocking: false,
	},
	save_blocked: {
		title: "Sauvegarde désactivée",
		message:
			"Les données ne sont pas persistantes en mode démo. Créez un compte pour sauvegarder vos données de manière sécurisée.",
		icon: <Zap className="h-12 w-12 text-yellow-500" />,
		blocking: false,
	},
};

export function PaywallModal({
	isOpen,
	reason,
	onClose,
	onUpgrade,
}: PaywallModalProps) {
	const navigate = useNavigate();
	const config = PAYWALL_CONFIG[reason];

	const handleUpgrade = () => {
		if (onUpgrade) {
			onUpgrade();
		} else {
			navigate("/pricing");
		}
	};

	const handleClose = () => {
		if (onClose && !config.blocking) {
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				className="sm:max-w-lg"
				onPointerDownOutside={(e) => {
					if (config.blocking) {
						e.preventDefault();
					}
				}}
				onEscapeKeyDown={(e) => {
					if (config.blocking) {
						e.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<div className="flex flex-col items-center gap-4 mb-4">
						{config.icon}
						<DialogTitle className="text-2xl text-center">
							{config.title}
						</DialogTitle>
					</div>
					<DialogDescription className="text-center text-base">
						{config.message}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 mt-6">
					{/* Comparaison rapide */}
					<div className="bg-gray-50 rounded-lg p-4 space-y-2">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">Démo</span>
							<span className="text-sm font-medium">
								Cabinet Pro
							</span>
						</div>
						<div className="border-t pt-2 space-y-1">
							<div className="flex justify-between text-sm">
								<span className="text-gray-500">Patients</span>
								<span className="font-medium">
									3 max → Illimités
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-500">Durée</span>
								<span className="font-medium">
									1h → Illimitée
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-500">
									Sauvegarde
								</span>
								<span className="font-medium">❌ → ✅</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-500">
									Export PDF
								</span>
								<span className="font-medium">❌ → ✅</span>
							</div>
						</div>
					</div>

					{/* CTA principal */}
					<Button
						size="lg"
						className="w-full"
						onClick={handleUpgrade}
					>
						<Crown className="mr-2 h-5 w-5" />
						Créer mon compte Pro - 49€/mois
					</Button>

					{/* CTA secondaire (si non bloquant) */}
					{!config.blocking && onClose && (
						<Button
							variant="ghost"
							className="w-full"
							onClick={handleClose}
						>
							Continuer la démo
						</Button>
					)}

					<p className="text-sm text-center text-gray-500">
						Sans engagement • Annulable à tout moment
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
