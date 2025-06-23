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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
	const navigate = useNavigate();

	const settingsOptions = [
		{
			id: "profile",
			title: "Profil & Facturation",
			description:
				"Gérez vos informations professionnelles et de facturation",
			icon: UserCog,
			path: "/settings/profile",
			color: "text-blue-500",
		},
		{
			id: "collaborations",
			title: "Collaborations",
			description: "Gérez vos associations de cabinet et remplacements",
			icon: Users,
			path: "/settings/collaborations",
			color: "text-green-500",
		},
		{
			id: "help",
			title: "Guide d'utilisation",
			description:
				"Consultez la documentation et les guides d'utilisation",
			icon: HelpCircle,
			path: "/help",
			color: "text-purple-500",
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

					{/* Section d'information */}
					<Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
						<CardHeader>
							<CardTitle className="text-amber-800 dark:text-amber-200">
								💡 Conseil
							</CardTitle>
						</CardHeader>
						<CardContent className="text-amber-700 dark:text-amber-300">
							<p>
								Commencez par configurer votre profil
								professionnel, puis gérez vos collaborations si
								vous travaillez avec d'autres ostéopathes.
								Consultez le guide d'utilisation pour comprendre
								tous les workflows disponibles.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</Layout>
	);
};

export default SettingsPage;
