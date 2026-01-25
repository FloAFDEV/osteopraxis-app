import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	TestTube,
	Settings,
	Shield,
	BarChart3,
	Database,
	RefreshCw,
	ExternalLink,
	Trash2,
	Zap,
	FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function QuickActionsPanel() {
	const navigate = useNavigate();

	const actions = [
		{
			title: "Suite de Tests Complète",
			description: "Tester toutes les fonctionnalités de l'application",
			icon: TestTube,
			color: "text-primary",
			href: "/admin/testing",
			external: false,
		},
		{
			title: "Diagnostics Stockage",
			description: "Vérifier l'état du stockage HDS",
			icon: Database,
			color: "text-blue-600",
			href: "/admin/storage-diagnostic",
			external: false,
		},
		{
			title: "Paramètres Système",
			description: "Configuration avancée",
			icon: Settings,
			color: "text-gray-600",
			action: () => {
				// Scroll to settings tab
				const settingsTab =
					document.querySelector('[value="settings"]');
				if (settingsTab) {
					(settingsTab as HTMLElement).click();
				}
			},
		},
		{
			title: "Audit de Sécurité",
			description: "Lancer un audit complet",
			icon: Shield,
			color: "text-green-600",
			action: () => {
				const securityTab =
					document.querySelector('[value="security"]');
				if (securityTab) {
					(securityTab as HTMLElement).click();
				}
			},
		},
		{
			title: "Analytics Business",
			description: "Métriques et statistiques",
			icon: BarChart3,
			color: "text-purple-600",
			action: () => {
				const analyticsTab = document.querySelector(
					'[value="analytics"]',
				);
				if (analyticsTab) {
					(analyticsTab as HTMLElement).click();
				}
			},
		},
		{
			title: "Nettoyer les Logs",
			description: "Supprimer les logs de plus de 30 jours",
			icon: Trash2,
			color: "text-orange-600",
			action: async () => {
				try {
					const { data, error } = await supabase.rpc(
						"admin_cleanup_old_logs",
						{ days_old: 30 },
					);
					if (error) throw error;
					const result = data as any;
					toast.success(`${result.deleted_count} logs supprimés`);
				} catch (error) {
					toast.error("Erreur lors du nettoyage des logs");
				}
			},
		},
		{
			title: "Optimiser Performance",
			description: "Lancer l'optimisation de la base",
			icon: Zap,
			color: "text-green-600",
			action: async () => {
				try {
					const { data, error } = await supabase.rpc(
						"admin_optimize_performance",
					);
					if (error) throw error;
					toast.success("Optimisation terminée avec succès");
				} catch (error) {
					toast.error("Erreur lors de l'optimisation");
				}
			},
		},
		{
			title: "Rapport d'Utilisation",
			description: "Générer un rapport détaillé",
			icon: FileText,
			color: "text-blue-600",
			action: async () => {
				try {
					const { data, error } = await supabase.rpc(
						"admin_generate_usage_report",
					);
					if (error) throw error;
					console.log("Rapport généré:", data);
					toast.success("Rapport d'utilisation généré");
				} catch (error) {
					toast.error("Erreur lors de la génération du rapport");
				}
			},
		},
		{
			title: "Actualiser Système",
			description: "Recharger toutes les données",
			icon: RefreshCw,
			color: "text-orange-600",
			action: () => {
				window.location.reload();
			},
		},
	];

	const handleAction = (action: (typeof actions)[0]) => {
		if (action.href) {
			if (action.external) {
				window.open(action.href, "_blank");
			} else {
				navigate(action.href);
			}
		} else if (action.action) {
			action.action();
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Settings className="h-5 w-5" />
					Actions Rapides d'Administration
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{actions.map((action, index) => (
						<Button
							key={index}
							variant="outline"
							className="h-auto p-4 justify-start hover:bg-accent/50 transition-colors group"
							onClick={() => handleAction(action)}
						>
							<div className="flex items-center gap-3 w-full">
								<action.icon
									className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`}
								/>
								<div className="text-left flex-1">
									<div className="font-medium text-foreground flex items-center gap-1">
										{action.title}
										{action.href && action.external && (
											<ExternalLink className="h-3 w-3 opacity-50" />
										)}
									</div>
									<div className="text-sm text-muted-foreground">
										{action.description}
									</div>
								</div>
							</div>
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
