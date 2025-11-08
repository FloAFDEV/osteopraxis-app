
import { useState, useEffect } from "react";
import { isDemoSession } from "@/utils/demo-detection";
import { Layout } from "@/components/ui/layout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Settings,
	UserCog,
	Users,
	HelpCircle,
	ChevronRight,
	Upload,
	Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SecureExportDialog } from "@/components/secure-usb/SecureExportDialog";
import { SecureImportDialog } from "@/components/secure-usb/SecureImportDialog";
import { UsageMetricsSection } from "@/components/plans/UsageMetricsSection";


const SettingsPage = () => {
	const navigate = useNavigate();
	const [showExportDialog, setShowExportDialog] = useState(false);
	const [showImportDialog, setShowImportDialog] = useState(false);
	const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);

	// Déterminer le mode (démo ou connecté)
	useEffect(() => {
		isDemoSession().then(setIsDemoMode);
	}, []);

	// En mode démo, seul le guide d'utilisation est accessible
	const settingsOptions = isDemoMode 
		? [
			{
				id: "help",
				title: "Guide d'utilisation",
				description:
					"Consultez la documentation et les guides d'utilisation",
				icon: HelpCircle,
				path: "/help",
				color: "text-orange-500",
			},
		]
		: [
			{
				id: "subscription",
				title: "Plan et abonnement",
				description: "Gérez votre plan tarifaire et fonctionnalités",
				icon: Settings,
				path: "/plan-selection",
				color: "text-primary",
			},
			{
				id: "profile",
				title: "Profil & Facturation",
				description:
					"Gérez vos informations professionnelles et de facturation",
				icon: UserCog,
				path: "/settings/osteopath",
				color: "text-blue-500",
			},
			{
				id: "storage",
				title: "Stockage HDS Sécurisé",
				description:
					"Gérez votre stockage local chiffré et sauvegardes",
				icon: Shield,
				path: "/settings/storage",
				color: "text-primary",
			},
			{
				id: "import",
				title: "Import de données",
				description:
					"Importez vos patients depuis Excel/CSV ou autres logiciels",
				icon: Upload,
				path: "/settings/import",
				color: "text-green-500",
			},
			{
				id: "collaborations",
				title: "Collaborations",
				description: "Gérez vos associations de cabinet et remplacements",
				icon: Users,
				path: "/settings/collaborations",
				color: "text-purple-500",
			},
			{
				id: "help",
				title: "Guide d'utilisation",
				description:
					"Consultez la documentation et les guides d'utilisation",
				icon: HelpCircle,
				path: "/help",
				color: "text-orange-500",
			},
		];

	return (
		<Layout>
			<div className="flex items-start justify-center min-h-screen px-4 mt-16 sm:mt-20">
				{/* Conteneur principal */}
				<div className="max-w-4xl mx-auto space-y-8 w-full">
					<div className="mb-6">
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<Settings className="h-8 w-8 text-amber-500" />
							Paramètres
						</h1>
						<p className="text-muted-foreground mt-1">
							Gérez vos préférences et configurations
						</p>
					</div>

					<div className="grid gap-6">
						{settingsOptions.map((option) => {
							const IconComponent = option.icon;
							return (
								<Card
									key={option.id}
									className="hover:shadow-md transition-shadow cursor-pointer"
									onClick={() => navigate(option.path)}
								>
									<CardHeader>
										<CardTitle className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<IconComponent
													className={`h-6 w-6 ${option.color}`}
												/>
												{option.title}
											</div>
											<ChevronRight className="h-5 w-5 text-muted-foreground" />
										</CardTitle>
										<CardDescription>
											{option.description}
										</CardDescription>
									</CardHeader>
								</Card>
							);
						})}
					</div>

					{/* Section Métriques d'utilisation - masquée en mode démo */}
					{!isDemoMode && (
						<UsageMetricsSection />
					)}

					{/* Section Partage Sécurisé USB - masqué en mode démo */}
					{!isDemoMode && (
						<Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
							<CardHeader>
								<CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
									🔒 Partage Sécurisé USB
								</CardTitle>
								<CardDescription className="text-green-700 dark:text-green-300">
									Exportez et importez vos données en toute sécurité via clé USB chiffrée
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Button 
										variant="outline" 
										className="flex items-center gap-2 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
										onClick={() => setShowExportDialog(true)}
									>
										<Upload className="h-4 w-4" />
										Export Sécurisé
									</Button>
									<Button 
										variant="outline" 
										className="flex items-center gap-2 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
										onClick={() => setShowImportDialog(true)}
									>
										<Upload className="h-4 w-4" />
										Import Sécurisé
									</Button>
								</div>
								<p className="text-xs text-green-600 dark:text-green-400 mt-3">
									Chiffrement AES-256 • Conformité RGPD • Format propriétaire .phub
								</p>
							</CardContent>
						</Card>
					)}

					{/* Section d'information - masquée en mode démo */}
					{!isDemoMode && (
						<Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
							<CardHeader>
								<CardTitle className="text-amber-800 dark:text-amber-200">
									💡 Conseil
								</CardTitle>
							</CardHeader>
							<CardContent className="text-amber-700 dark:text-amber-300">
								<p>
									Commencez par configurer votre profil
									professionnel, puis utilisez l'import de données
									pour migrer vos patients existants. Gérez ensuite
									vos collaborations si vous travaillez avec d'autres
									ostéopathes. Consultez le guide d'utilisation pour
									comprendre tous les workflows disponibles.
								</p>
							</CardContent>
						</Card>
					)}
        </div>
      </div>

      {/* Dialogs */}
      <SecureExportDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog} 
      />
      <SecureImportDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
      />
    </Layout>
  );
};

export default SettingsPage;
