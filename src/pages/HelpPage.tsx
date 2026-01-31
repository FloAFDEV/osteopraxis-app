import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { HelpButton } from "@/components/ui/help-button";
import { Layout } from "@/components/ui/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AlertTriangle,
	ArrowRight,
	Building2,
	Building,
	CheckCircle,
	CreditCard,
	FileText,
	HelpCircle,
	UserCheck,
	UserPlus,
	Users,
	Zap,
	TrendingUp,
	Database,
	Activity,
	BookOpen,
	Calendar,
	LayoutDashboard,
	Settings,
	Lock,
	Lightbulb,
} from "lucide-react";

const HelpPage = () => {
	return (
		<Layout>
			<div className="max-w-4xl mx-auto space-y-8">
				<BackButton />

				<div className="mb-6">
					<div className="flex items-center gap-2">
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<HelpCircle className="h-8 w-8 text-blue-500" />
							Guide d'utilisation
						</h1>
						<HelpButton content="Ce guide complet vous explique comment utiliser toutes les fonctionnalités de l'application : gestion des cabinets, remplacements, patients et facturation. Parcourez les onglets pour découvrir chaque section." />
					</div>
					<p className="text-muted-foreground mt-1">
						Découvrez comment utiliser efficacement votre
						application de gestion
					</p>
				</div>

				<Tabs defaultValue="overview" className="space-y-6">
					<TabsList className="grid w-full grid-cols-6">
						<TabsTrigger value="overview" className="flex items-center gap-2">
							<BookOpen className="w-4 h-4" />
							Vue d'ensemble
						</TabsTrigger>
						<TabsTrigger value="cabinets" className="flex items-center gap-2">
							<Building2 className="w-4 h-4" />
							Cabinets
						</TabsTrigger>
						<TabsTrigger value="remplacements" className="flex items-center gap-2">
							<UserPlus className="w-4 h-4" />
							Remplacements
						</TabsTrigger>
						<TabsTrigger value="patients" className="flex items-center gap-2">
							<Users className="w-4 h-4" />
							Patients
						</TabsTrigger>
						<TabsTrigger value="facturation" className="flex items-center gap-2">
							<CreditCard className="w-4 h-4" />
							Facturation
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<LayoutDashboard className="h-5 w-5 text-blue-500" />
									Bienvenue dans OstéoPraxis
								</CardTitle>
								<CardDescription>
									Votre application de gestion tout-en-un pour votre pratique d'ostéopathie
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid gap-4 md:grid-cols-2">
									<Card className="border-blue-200 bg-blue-50/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-base flex items-center gap-2">
												<Users className="h-4 w-4 text-blue-600" />
												Gestion des Patients
											</CardTitle>
										</CardHeader>
										<CardContent className="text-sm text-muted-foreground">
											Créez et gérez facilement vos dossiers patients, consultez l'historique des séances et partagez les informations entre cabinets.
										</CardContent>
									</Card>

									<Card className="border-purple-200 bg-purple-50/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-base flex items-center gap-2">
												<Calendar className="h-4 w-4 text-purple-600" />
												Planning & Rendez-vous
											</CardTitle>
										</CardHeader>
										<CardContent className="text-sm text-muted-foreground">
											Visualisez votre planning, créez des rendez-vous et gérez votre emploi du temps en temps réel.
										</CardContent>
									</Card>

									<Card className="border-amber-200 bg-amber-50/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-base flex items-center gap-2">
												<CreditCard className="h-4 w-4 text-amber-600" />
												Facturation
											</CardTitle>
										</CardHeader>
										<CardContent className="text-sm text-muted-foreground">
											Générez des factures professionnelles avec vos informations (RPPS, SIRET, APE) et exportez-les en PDF.
										</CardContent>
									</Card>

									<Card className="border-green-200 bg-green-50/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-base flex items-center gap-2">
												<Building2 className="h-4 w-4 text-green-600" />
												Multi-cabinets
											</CardTitle>
										</CardHeader>
										<CardContent className="text-sm text-muted-foreground">
											Gérez plusieurs cabinets, collaborez avec d'autres ostéopathes et organisez vos remplacements.
										</CardContent>
									</Card>
								</div>

								<Alert>
									<Settings className="h-4 w-4" />
									<AlertDescription>
										<strong className="font-semibold">Pour commencer :</strong> Complétez vos informations professionnelles dans{" "}
										<strong>Paramètres → Mon Profil</strong> (RPPS, SIRET, APE) pour générer vos premières factures.
									</AlertDescription>
								</Alert>

								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<ArrowRight className="h-4 w-4 text-blue-500" />
										Accès rapide
									</h3>
									<div className="space-y-2 pl-6">
										<p className="text-sm flex items-start gap-2">
											<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
											<span><strong>Patients</strong> : Créez et consultez vos dossiers patients</span>
										</p>
										<p className="text-sm flex items-start gap-2">
											<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
											<span><strong>Séances</strong> : Gérez vos rendez-vous au quotidien</span>
										</p>
										<p className="text-sm flex items-start gap-2">
											<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
											<span><strong>Planning</strong> : Vue calendrier de votre emploi du temps</span>
										</p>
										<p className="text-sm flex items-start gap-2">
											<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
											<span><strong>Notes d'honoraires</strong> : Créez et exportez vos factures</span>
										</p>
										<p className="text-sm flex items-start gap-2">
											<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
											<span><strong>Paramètres</strong> : Configurez votre profil et vos cabinets</span>
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="cabinets" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Building className="h-5 w-5 text-blue-500" />
									Gestion des Cabinets
									<HelpButton content="Les cabinets permettent de structurer votre pratique et de collaborer avec d'autres ostéopathes. Vous pouvez créer votre propre cabinet ou rejoindre un cabinet existant." />
								</CardTitle>
								<CardDescription>
									Comment créer et gérer vos cabinets avec
									plusieurs ostéopathes
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Scénario 1: Cabinet avec plusieurs
										ostéopathes
										<HelpButton content="Configuration recommandée pour les cabinets de groupe où plusieurs ostéopathes travaillent ensemble et partagent une patientèle." />
									</h3>
									<div className="space-y-3 pl-6">
										<div className="flex items-start gap-3">
											<Badge variant="outline">1</Badge>
											<div>
												<p className="font-medium">
													Premier ostéopathe
												</p>
												<p className="text-sm text-muted-foreground">
													Crée le cabinet avec toutes
													les informations (nom,
													adresse, etc.)
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Badge variant="outline">2</Badge>
											<div>
												<p className="font-medium">
													Autres ostéopathes
												</p>
												<p className="text-sm text-muted-foreground">
													S'associent au cabinet via
													"Paramètres" →
													"Collaborations" →
													"Associations Cabinet"
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Badge variant="outline">3</Badge>
											<div>
												<p className="font-medium">
													Partage des patients
												</p>
												<p className="text-sm text-muted-foreground">
													Tous les ostéopathes du
													cabinet peuvent voir et
													gérer les patients du
													cabinet
												</p>
											</div>
										</div>
									</div>
								</div>

								<Alert>
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>
										<strong>Important :</strong> Seul le
										créateur du cabinet peut modifier les
										informations du cabinet (nom, adresse,
										etc.). Les autres ostéopathes peuvent
										seulement s'associer ou se dissocier.
									</AlertDescription>
								</Alert>

								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Scénario 2: Ostéopathe en exercice
										libéral seul
										<HelpButton content="Configuration pour les praticiens en exercice individuel qui gèrent leur cabinet de manière autonome." />
									</h3>
									<div className="space-y-3 pl-6">
										<div className="flex items-start gap-3">
											<Badge variant="outline">1</Badge>
											<div>
												<p className="font-medium">
													Création simple
												</p>
												<p className="text-sm text-muted-foreground">
													Créez votre cabinet
													personnel avec vos
													informations
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Badge variant="outline">2</Badge>
											<div>
												<p className="font-medium">
													Gestion autonome
												</p>
												<p className="text-sm text-muted-foreground">
													Vous gérez seul vos patients
													et votre facturation
												</p>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="remplacements" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<UserCheck className="h-5 w-5 text-green-500" />
									Système de Remplacements
									<HelpButton content="Le système de remplacements vous permet de déléguer temporairement vos patients à un collègue. Très utile pour les congés, formations ou absences." />
								</CardTitle>
								<CardDescription>
									Comment configurer et gérer vos
									remplacements
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Configuration d'un remplacement
										<HelpButton content="Processus simple en 3 étapes pour mettre en place un remplacement temporaire avec un collègue." />
									</h3>
									<div className="space-y-3 pl-6">
										<div className="flex items-start gap-3">
											<Badge variant="outline">1</Badge>
											<div>
												<p className="font-medium">
													Ostéopathe titulaire
												</p>
												<p className="text-sm text-muted-foreground">
													Va dans "Paramètres" →
													"Collaborations" → "Gestion
													des Remplacements"
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Badge variant="outline">2</Badge>
											<div>
												<p className="font-medium">
													Ajouter un remplaçant
												</p>
												<p className="text-sm text-muted-foreground">
													Sélectionne l'ostéopathe
													remplaçant (collègue du même
													cabinet ou autre ostéopathe
													autorisé)
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Badge variant="outline">3</Badge>
											<div>
												<p className="font-medium">
													Définir la période
												</p>
												<p className="text-sm text-muted-foreground">
													Optionnel : dates de début
													et fin, notes explicatives
												</p>
											</div>
										</div>
									</div>
								</div>

								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Pendant le remplacement
										<HelpButton content="Droits et responsabilités du remplaçant pendant la période de remplacement active." />
									</h3>
									<div className="space-y-3 pl-6">
										<div className="flex items-start gap-3">
											<Badge variant="outline">✓</Badge>
											<div>
												<p className="font-medium">
													Accès aux patients
												</p>
												<p className="text-sm text-muted-foreground">
													Le remplaçant peut voir et
													consulter les patients du
													titulaire
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Badge variant="outline">✓</Badge>
											<div>
												<p className="font-medium">
													Facturation
												</p>
												<p className="text-sm text-muted-foreground">
													Le remplaçant crée des
													factures au nom du titulaire
													(avec ses informations
													RPPS/SIRET)
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Badge variant="outline">✓</Badge>
											<div>
												<p className="font-medium">
													Rendez-vous
												</p>
												<p className="text-sm text-muted-foreground">
													Le remplaçant peut créer et
													gérer les rendez-vous
												</p>
											</div>
										</div>
									</div>
								</div>

								<Alert>
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>
										<strong>Important :</strong> Le
										remplaçant doit aussi avoir un profil
										complet dans l'application. Les
										remplacements ne fonctionnent qu'entre
										ostéopathes du même cabinet ou ayant une
										autorisation spécifique.
									</AlertDescription>
								</Alert>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="patients" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5 text-purple-500" />
									Gestion des Patients
									<HelpButton content="Système complet de gestion des dossiers patients avec historique médical, rendez-vous et facturation intégrés." />
								</CardTitle>
								<CardDescription>
									Comment ajouter et gérer vos patients
									efficacement
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										Création d'une fiche patient
										<HelpButton content="Guide pour créer un nouveau dossier patient avec toutes les informations nécessaires." />
									</h3>
									<div className="space-y-2 pl-4">
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											L'email est{" "}
											<strong>facultatif</strong> - vous
											pouvez créer un patient sans adresse
											email
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											Remplissez au minimum le nom, prénom
											et les informations pertinentes
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											Les onglets pédiatriques
											apparaissent automatiquement pour
											les patients de moins de 18 ans
										</p>
									</div>
								</div>

								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										Partage des patients
										<HelpButton content="Règles de visibilité et d'accès aux dossiers patients selon votre organisation (cabinet, remplacement, etc.)." />
									</h3>
									<div className="space-y-2 pl-4">
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											Les patients sont rattachés soit à
											un ostéopathe personnel, soit à un
											cabinet
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											Si rattachés au cabinet, tous les
											ostéopathes du cabinet peuvent les
											voir
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											Les remplaçants peuvent accéder aux
											patients pendant leur période de
											remplacement
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="facturation" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5 text-amber-500" />
									Facturation
									<HelpButton content="Système de facturation conforme à la réglementation avec génération automatique de PDF et exports comptables." />
								</CardTitle>
								<CardDescription>
									Comprendre le système de facturation et les
									informations légales
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										Informations requises
										<HelpButton content="Données obligatoires pour émettre des factures conformes à la réglementation française des professionnels de santé." />
									</h3>
									<div className="space-y-2 pl-4">
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											<strong>Numéro RPPS :</strong>{" "}
											Obligatoire pour la facturation
											professionnelle
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											<strong>SIRET :</strong> Numéro
											d'identification de votre activité
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											<strong>Code APE :</strong> Par
											défaut 8690F pour les ostéopathes
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											<strong>Tampon :</strong> Image de
											votre tampon professionnel pour les
											factures
										</p>
									</div>
								</div>

								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										Génération PDF et exports
										<HelpButton content="Fonctionnalités d'export pour vos factures : PDF individuels, exports comptables mensuels ou annuels au format Excel." />
									</h3>
									<div className="space-y-2 pl-4">
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											<strong>PDF facture :</strong>{" "}
											Génération automatique avec tampon
											et informations légales
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											<strong>
												Export comptable :
											</strong>{" "}
											Fichier Excel avec récapitulatif
											mensuel ou annuel
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											<strong>
												Filtres avancés :
											</strong>{" "}
											Par période, cabinet, ostéopathe ou
											statut de paiement
										</p>
									</div>
								</div>

								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										Facturation en remplacement
										<HelpButton content="Spécificités de la facturation lors des remplacements : mentions légales automatiques et informations du titulaire." />
									</h3>
									<div className="space-y-2 pl-4">
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											Les factures sont émises au nom du
											titulaire (ses RPPS/SIRET)
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											Le remplaçant peut créer les
											factures mais elles portent
											l'identité du titulaire
										</p>
										<p className="text-sm text-muted-foreground flex items-center gap-2">
											<ArrowRight className="h-3 w-3" />
											Mention légale du remplacement
											automatiquement ajoutée
										</p>
									</div>
								</div>

								<Alert>
									<AlertTriangle className="h-4 w-4" />
									<AlertDescription>
										<strong>Rappel légal :</strong>{" "}
										Assurez-vous que vos informations RPPS
										et SIRET sont correctes. Ces
										informations sont utilisées pour la
										facturation officielle et doivent être
										conformes à votre statut professionnel.
									</AlertDescription>
								</Alert>
							</CardContent>
						</Card>
					</TabsContent>

				</Tabs>

				<Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
					<CardHeader>
						<CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
							Besoin d'aide supplémentaire ?
							<HelpButton content="Cette section récapitule les différentes façons d'obtenir de l'aide dans l'application et les ressources disponibles." />
						</CardTitle>
					</CardHeader>
					<CardContent className="text-blue-700 dark:text-blue-300">
						<p className="mb-4">
							Si vous avez des questions spécifiques ou rencontrez
							des difficultés, n'hésitez pas à consulter les
							différentes sections de paramètres ou à contacter le
							support.
						</p>
						
						<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
							<h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
								<Lock className="h-4 w-4" />
								Sécurité et déconnexion automatique
							</h4>
							<p className="text-sm text-blue-700 dark:text-blue-300">
								Pour votre sécurité, l'application vous déconnecte automatiquement après <strong>30 minutes d'inactivité</strong>. 
								Un avertissement apparaît 1 minute avant la déconnexion pour vous permettre de prolonger votre session si nécessaire.
							</p>
						</div>

						<div className="flex gap-4">
							<Badge
								variant="outline"
								className="text-blue-600 border-blue-300 flex items-center gap-1"
							>
								<Lightbulb className="h-3 w-3" />
								Astuce : Utilisez les boutons "?" dans
								l'interface pour des aides contextuelles
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default HelpPage;
