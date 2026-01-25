import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Shield,
	User,
	Microscope,
	Lock,
	CheckCircle2,
	AlertTriangle,
	FileText,
	Download,
	Clock,
	Eye,
	XCircle,
} from "lucide-react";
import { Layout } from "@/components/ui/layout";

/**
 * 🎭 Page de visualisation des parcours utilisateurs
 * Analyse sécurité et UX pour chaque persona
 */
const UserJourneyVisualizationPage = () => {
	return (
		<Layout>
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
						<Shield className="w-10 h-10 text-primary" />
						Parcours Utilisateurs & Sécurité
					</h1>
					<p className="text-muted-foreground">
						Analyse complète des 3 personas et protections
						anti-triche
					</p>
				</div>

				{/* Score Global */}
				<Card className="mb-8 border-primary">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Score Global de Sécurité</span>
							<Badge
								variant="default"
								className="text-2xl px-4 py-2"
							>
								78/100
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
							<div className="text-center">
								<div className="text-3xl font-bold text-green-600">
									90
								</div>
								<div className="text-sm text-muted-foreground">
									Contrôle accès
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-green-600">
									85
								</div>
								<div className="text-sm text-muted-foreground">
									Protection docs
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-green-600">
									95
								</div>
								<div className="text-sm text-muted-foreground">
									Séparation démo/prod
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-green-600">
									80
								</div>
								<div className="text-sm text-muted-foreground">
									Traçabilité
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-yellow-600">
									60
								</div>
								<div className="text-sm text-muted-foreground">
									UX/Clarté
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Vulnérabilités Critiques */}
				<Alert variant="default" className="mb-8 border-yellow-500">
					<AlertTriangle className="h-5 w-5 text-yellow-600" />
					<AlertDescription>
						<div className="font-semibold mb-2">
							2 Vulnérabilités Identifiées
						</div>
						<ul className="list-disc list-inside space-y-1 text-sm">
							<li>
								⚠️ MOYEN - Générateur de devis PDF manquant (pas
								de watermark)
							</li>
							<li>
								⚠️ MOYEN - Parcours visiteur non documenté
								visuellement
							</li>
						</ul>
					</AlertDescription>
				</Alert>

				{/* Tabs par Persona */}
				<Tabs defaultValue="visitor" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger
							value="visitor"
							className="flex items-center gap-2"
						>
							<User className="w-4 h-4" />
							Visiteur
						</TabsTrigger>
						<TabsTrigger
							value="demo"
							className="flex items-center gap-2"
						>
							<Microscope className="w-4 h-4" />
							Mode Démo
						</TabsTrigger>
						<TabsTrigger
							value="authenticated"
							className="flex items-center gap-2"
						>
							<Lock className="w-4 h-4" />
							Authentifié
						</TabsTrigger>
					</TabsList>

					{/* PERSONA 1: VISITEUR */}
					<TabsContent value="visitor" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="w-6 h-6" />
									Visiteur Non Authentifié
								</CardTitle>
								<CardDescription>
									Utilisateur découvrant l'application sans
									compte
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Parcours */}
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<Eye className="w-4 h-4" />
										Parcours Actuel
									</h3>
									<div className="bg-muted p-4 rounded-lg font-mono text-sm">
										<div className="space-y-2">
											<div>📍 Visite / → LandingPage</div>
											<div className="ml-4">
												├─► /register → Inscription
											</div>
											<div className="ml-4">
												├─► /login → Connexion
											</div>
											<div className="ml-4">
												└─► /demo → Mode démo
											</div>
										</div>
									</div>
								</div>

								{/* Pages Accessibles */}
								<div>
									<h3 className="font-semibold mb-3">
										Pages Accessibles (Publiques)
									</h3>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
										{[
											"/",
											"/login",
											"/register",
											"/demo",
											"/pricing",
											"/contact",
											"/confidentialite",
											"/cgu",
										].map((route) => (
											<Badge
												key={route}
												variant="outline"
												className="justify-center"
											>
												{route}
											</Badge>
										))}
									</div>
								</div>

								{/* Protections */}
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<Shield className="w-4 h-4 text-green-600" />
										Protections en Place
									</h3>
									<div className="space-y-2">
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
											<div>
												<div className="font-medium">
													Aucune donnée accessible
												</div>
												<div className="text-sm text-muted-foreground">
													Toutes routes métier
													protégées par ProtectedRoute
												</div>
											</div>
										</div>
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
											<div>
												<div className="font-medium">
													Redirection automatique
												</div>
												<div className="text-sm text-muted-foreground">
													Si connecté: / → /dashboard
												</div>
											</div>
										</div>
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
											<div>
												<div className="font-medium">
													Pas de localStorage médical
												</div>
												<div className="text-sm text-muted-foreground">
													Aucune donnée HDS accessible
													avant authentification
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Verdict */}
								<Alert>
									<CheckCircle2 className="h-5 w-5 text-green-600" />
									<AlertDescription>
										<span className="font-semibold text-green-600">
											✅ SÉCURISÉ
										</span>{" "}
										- Aucune fuite de données possible pour
										visiteur non authentifié. Toutes les
										routes protégées fonctionnent
										correctement.
									</AlertDescription>
								</Alert>
							</CardContent>
						</Card>
					</TabsContent>

					{/* PERSONA 2: MODE DÉMO */}
					<TabsContent value="demo" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Microscope className="w-6 h-6" />
									Visiteur en Mode Démo
								</CardTitle>
								<CardDescription>
									Utilisateur testant l'application avec
									données fictives
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Parcours */}
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<Eye className="w-4 h-4" />
										Parcours Actuel
									</h3>
									<div className="bg-muted p-4 rounded-lg font-mono text-sm">
										<div className="space-y-2">
											<div>
												📍 Clic "Démo" →
												InteractiveDemoPage
											</div>
											<div className="ml-4">
												↓ Bouton "Commencer"
											</div>
											<div className="ml-4">
												↓ createLocalDemoSession()
											</div>
											<div className="ml-4">
												↓ seedDemoData() → 20 patients,
												50 RDV, 30 factures
											</div>
											<div className="ml-4">
												↓ Redirection /dashboard
											</div>
											<div className="ml-4">
												✓ DemoBanner affiché + Timer
												session
											</div>
										</div>
									</div>
								</div>

								{/* Données Accessibles */}
								<div>
									<h3 className="font-semibold mb-3">
										Données Accessibles (FICTIVES)
									</h3>
									<div className="grid grid-cols-2 gap-3">
										<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
											<Badge variant="secondary">
												20
											</Badge>
											<span className="text-sm">
												Patients fictifs
											</span>
										</div>
										<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
											<Badge variant="secondary">
												50
											</Badge>
											<span className="text-sm">
												Consultations
											</span>
										</div>
										<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
											<Badge variant="secondary">
												30
											</Badge>
											<span className="text-sm">
												Factures
											</span>
										</div>
										<div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
											<Clock className="w-4 h-4" />
											<span className="text-sm">
												Planning fictif
											</span>
										</div>
									</div>
								</div>

								{/* Protections Anti-Triche */}
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<Shield className="w-4 h-4 text-red-600" />
										Protections "Anti-Triche"
									</h3>

									<div className="space-y-4">
										{/* Factures PDF */}
										<Card className="border-green-500">
											<CardHeader className="pb-3">
												<CardTitle className="text-base flex items-center justify-between">
													<span className="flex items-center gap-2">
														<FileText className="w-4 h-4" />
														Factures PDF
													</span>
													<Badge
														variant="default"
														className="bg-green-600"
													>
														✅ PROTÉGÉ
													</Badge>
												</CardTitle>
											</CardHeader>
											<CardContent className="text-sm space-y-2">
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														Watermark rouge "[!]
														MODE DEMO - DONNEES
														FICTIVES"
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														Triple filigrane (3
														positions par page)
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														QR Code sécurisé + Hash
														SHA-256
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														Audit trail:{" "}
														<code>
															is_demo_export: true
														</code>
													</div>
												</div>
												<div className="text-sm text-muted-foreground mt-2">
													📁
													src/utils/export-utils.ts:29-59
												</div>
											</CardContent>
										</Card>

										{/* Exports Excel */}
										<Card className="border-green-500">
											<CardHeader className="pb-3">
												<CardTitle className="text-base flex items-center justify-between">
													<span className="flex items-center gap-2">
														<Download className="w-4 h-4" />
														Exports Excel
													</span>
													<Badge
														variant="default"
														className="bg-green-600"
													>
														✅ PROTÉGÉ
													</Badge>
												</CardTitle>
											</CardHeader>
											<CardContent className="text-sm space-y-2">
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														Ligne d'avertissement
														rouge en en-tête
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														Feuille README
														obligatoire "[!] README
														- MODE DEMO"
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														Avertissements multiples
														+ restrictions
													</div>
												</div>
												<div className="text-sm text-muted-foreground mt-2">
													📁
													src/utils/export-utils.ts:116-201
												</div>
											</CardContent>
										</Card>

										{/* Devis PDF */}
										<Card className="border-yellow-500">
											<CardHeader className="pb-3">
												<CardTitle className="text-base flex items-center justify-between">
													<span className="flex items-center gap-2">
														<FileText className="w-4 h-4" />
														Devis PDF
													</span>
													<Badge variant="destructive">
														⚠️ MANQUANT
													</Badge>
												</CardTitle>
											</CardHeader>
											<CardContent className="text-sm space-y-2">
												<div className="flex items-start gap-2">
													<XCircle className="w-4 h-4 text-red-600 mt-0.5" />
													<div>
														Pas de générateur de
														devis détecté
													</div>
												</div>
												<div className="flex items-start gap-2">
													<XCircle className="w-4 h-4 text-red-600 mt-0.5" />
													<div>
														TODO: Implémenter
														watermark sur devis
													</div>
												</div>
												<Alert
													variant="destructive"
													className="mt-3"
												>
													<AlertTriangle className="h-4 w-4" />
													<AlertDescription className="text-sm">
														<strong>
															Action requise:
														</strong>{" "}
														Créer
														src/utils/quote-pdf-generator.ts
													</AlertDescription>
												</Alert>
											</CardContent>
										</Card>
									</div>
								</div>

								{/* Affichage Visuel */}
								<div>
									<h3 className="font-semibold mb-3">
										Affichage Visuel Mode Démo
									</h3>
									<div className="space-y-3">
										<Card className="border-blue-500">
											<CardContent className="pt-4">
												<div className="font-semibold mb-2">
													🧪 DemoBanner (Permanent)
												</div>
												<div className="text-sm space-y-1 text-muted-foreground">
													<div>
														📍 Position: En haut de
														toutes pages protégées
													</div>
													<div>
														⏱️ Temps restant: XX min
														XX sec
													</div>
													<div>
														📊 20 patients fictifs
														générés
													</div>
													<div>
														⚠️ Données fictives non
														valables
													</div>
													<div>
														[Bouton] Créer mon
														compte
													</div>
												</div>
												<div className="text-sm text-muted-foreground mt-2">
													📁
													src/components/DemoBanner.tsx
												</div>
											</CardContent>
										</Card>
									</div>
								</div>

								{/* Limitations */}
								<div>
									<h3 className="font-semibold mb-3">
										Limitations Fonctionnelles
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
											<div>
												LocalStorage temporaire (pas de
												PIN requis)
											</div>
										</div>
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
											<div>
												Session limitée: 30 minutes
											</div>
										</div>
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
											<div>
												Watermark obligatoire sur
												exports
											</div>
										</div>
										<div className="flex items-start gap-2">
											<XCircle className="w-4 h-4 text-red-600 mt-0.5" />
											<div>Collaboration désactivée</div>
										</div>
									</div>
								</div>

								{/* Verdict */}
								<Alert className="border-yellow-500">
									<AlertTriangle className="h-5 w-5 text-yellow-600" />
									<AlertDescription>
										<span className="font-semibold text-yellow-600">
											⚠️ 1 VULNÉRABILITÉ MOYENNE
										</span>{" "}
										- Devis PDF non protégés. Toutes les
										autres protections validées.
									</AlertDescription>
								</Alert>
							</CardContent>
						</Card>
					</TabsContent>

					{/* PERSONA 3: AUTHENTIFIÉ */}
					<TabsContent value="authenticated" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lock className="w-6 h-6" />
									Utilisateur Inscrit & Authentifié
								</CardTitle>
								<CardDescription>
									Praticien utilisant l'application avec
									données réelles
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Parcours */}
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<Eye className="w-4 h-4" />
										Parcours Actuel
									</h3>
									<div className="bg-muted p-4 rounded-lg font-mono text-sm">
										<div className="space-y-2">
											<div>
												📍 /login → Email + Password
											</div>
											<div className="ml-4">
												↓ Supabase Auth (JWT)
											</div>
											<div className="ml-4">
												↓ AuthContext.setUser()
											</div>
											<div className="ml-4">
												↓ ProtectedRoute validation
											</div>
											<div className="ml-4">
												↓ FailFastStorageGuard (vérifie
												PIN)
											</div>
											<div className="ml-4">
												✓ Dashboard + App complète
											</div>
										</div>
									</div>
								</div>

								{/* Stockage Sécurisé */}
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<Lock className="w-4 h-4 text-green-600" />
										Stockage Sécurisé (Local-First)
									</h3>
									<Card className="border-green-500">
										<CardContent className="pt-4 space-y-3">
											<div className="font-semibold">
												IndexedDB (hds-secure-db)
											</div>
											<div className="space-y-2 text-sm">
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														AES-256-GCM encryption
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														PBKDF2 key derivation
														(100 000 itérations)
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														PIN protection
														obligatoire (6 chiffres)
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
													<div>
														Auto-lock après 15 min
														inactivité
													</div>
												</div>
											</div>
											<div className="text-sm text-muted-foreground mt-2">
												📁
												src/services/storage/hds-secure-storage.ts
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Exports Professionnels */}
								<div>
									<h3 className="font-semibold mb-3 flex items-center gap-2">
										<Shield className="w-4 h-4 text-blue-600" />
										Exports Professionnels
									</h3>

									<div className="space-y-4">
										{/* Factures PDF */}
										<Card className="border-blue-500">
											<CardHeader className="pb-3">
												<CardTitle className="text-base flex items-center justify-between">
													<span className="flex items-center gap-2">
														<FileText className="w-4 h-4" />
														Factures PDF
													</span>
													<Badge
														variant="default"
														className="bg-blue-600"
													>
														✅ PROFESSIONNEL
													</Badge>
												</CardTitle>
											</CardHeader>
											<CardContent className="text-sm space-y-2">
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
													<div>
														Watermark discret
														"DOCUMENT CONFIDENTIEL"
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
													<div>
														Grille 3x2 en filigrane
														(opacité 25%)
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
													<div>
														Métadonnées: "Exporté
														par [Nom] le [Date]"
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
													<div>
														QR Code sécurisé +
														Signature numérique
														(SHA-256)
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
													<div>
														Audit trail complet en
														DB
													</div>
												</div>
												<div className="text-sm text-muted-foreground mt-2">
													📁
													src/utils/invoice-pdf-generator.ts:132-213
												</div>
											</CardContent>
										</Card>

										{/* Exports Excel */}
										<Card className="border-blue-500">
											<CardHeader className="pb-3">
												<CardTitle className="text-base flex items-center justify-between">
													<span className="flex items-center gap-2">
														<Download className="w-4 h-4" />
														Exports Excel
													</span>
													<Badge
														variant="default"
														className="bg-blue-600"
													>
														✅ PROFESSIONNEL
													</Badge>
												</CardTitle>
											</CardHeader>
											<CardContent className="text-sm space-y-2">
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
													<div>
														Ligne discrète en bas
														(gris clair)
													</div>
												</div>
												<div className="flex items-start gap-2">
													<CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
													<div>
														Traçabilité: Date + nom
														exportateur
													</div>
												</div>
												<div className="text-sm text-muted-foreground mt-2">
													📁
													src/utils/export-utils.ts:144-159
												</div>
											</CardContent>
										</Card>

										{/* Devis PDF */}
										<Card className="border-yellow-500">
											<CardHeader className="pb-3">
												<CardTitle className="text-base flex items-center justify-between">
													<span className="flex items-center gap-2">
														<FileText className="w-4 h-4" />
														Devis PDF
													</span>
													<Badge variant="destructive">
														⚠️ MANQUANT
													</Badge>
												</CardTitle>
											</CardHeader>
											<CardContent className="text-sm">
												<Alert variant="destructive">
													<AlertTriangle className="h-4 w-4" />
													<AlertDescription className="text-sm">
														Utilisateur authentifié
														pourrait générer devis
														sans watermark
														professionnel
													</AlertDescription>
												</Alert>
											</CardContent>
										</Card>
									</div>
								</div>

								{/* Contrôle Accès RLS */}
								<div>
									<h3 className="font-semibold mb-3">
										Contrôle d'Accès (RLS)
									</h3>
									<div className="space-y-2 text-sm">
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
											<div>
												<code className="text-sm bg-muted px-1 py-0.5 rounded">
													HDS_TOTAL_BLOCK_*
												</code>{" "}
												- Aucune donnée HDS en Supabase
											</div>
										</div>
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
											<div>
												Auth Supabase: Uniquement
												métadonnées (osteopath, cabinet)
											</div>
										</div>
										<div className="flex items-start gap-2">
											<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
											<div>
												Isolation utilisateur: Chaque
												user a son stockage local
											</div>
										</div>
									</div>
								</div>

								{/* Fonctionnalités */}
								<div>
									<h3 className="font-semibold mb-3">
										Fonctionnalités Complètes
									</h3>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
										{[
											"CRUD Patients",
											"Planning + RDV",
											"Facturation",
											"Statistiques",
											"Gestion Cabinet(s)",
											"Collaborations (Pro)",
											"Imports/Exports",
											"Conformité HDS",
											"Audit Trail",
										].map((feature) => (
											<Badge
												key={feature}
												variant="secondary"
												className="justify-center"
											>
												{feature}
											</Badge>
										))}
									</div>
								</div>

								{/* Verdict */}
								<Alert className="border-yellow-500">
									<AlertTriangle className="h-5 w-5 text-yellow-600" />
									<AlertDescription>
										<span className="font-semibold text-yellow-600">
											⚠️ 1 VULNÉRABILITÉ MOYENNE
										</span>{" "}
										- Devis PDF non protégés. Toutes les
										autres protections robustes et conformes
										HDS/RGPD.
									</AlertDescription>
								</Alert>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Matrice Sécurité */}
				<Card className="mt-8">
					<CardHeader>
						<CardTitle>
							📊 Matrice de Sécurité par Document
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="text-left p-2">
											Document
										</th>
										<th className="text-center p-2">
											Mode Démo
										</th>
										<th className="text-center p-2">
											Mode Authentifié
										</th>
										<th className="text-center p-2">
											Traçabilité
										</th>
										<th className="text-center p-2">
											Intégrité
										</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-b">
										<td className="p-2 font-medium">
											Facture PDF
										</td>
										<td className="text-center p-2">
											<Badge
												variant="default"
												className="bg-green-600"
											>
												✅ Watermark rouge
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge
												variant="default"
												className="bg-blue-600"
											>
												✅ Watermark discret
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge variant="default">
												✅ Audit trail
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge variant="default">
												✅ QR + SHA-256
											</Badge>
										</td>
									</tr>
									<tr className="border-b">
										<td className="p-2 font-medium">
											Export Excel
										</td>
										<td className="text-center p-2">
											<Badge
												variant="default"
												className="bg-green-600"
											>
												✅ Ligne + README
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge
												variant="default"
												className="bg-blue-600"
											>
												✅ Ligne discrète
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge variant="default">
												✅ Audit trail
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge variant="outline">
												⚠️ Pas de hash
											</Badge>
										</td>
									</tr>
									<tr className="border-b">
										<td className="p-2 font-medium">
											Devis PDF
										</td>
										<td className="text-center p-2">
											<Badge variant="destructive">
												⚠️ MANQUANT
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge variant="destructive">
												⚠️ MANQUANT
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge variant="outline">
												❌ Non impl.
											</Badge>
										</td>
										<td className="text-center p-2">
											<Badge variant="outline">
												❌ Non impl.
											</Badge>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* Plan d'Action */}
				<Card className="mt-8 border-primary">
					<CardHeader>
						<CardTitle>🎯 Plan d'Action Recommandé</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
							<Badge variant="destructive" className="mt-0.5">
								HAUTE
							</Badge>
							<div>
								<div className="font-semibold">
									Implémenter générateur Devis PDF sécurisé
								</div>
								<div className="text-sm text-muted-foreground mt-1">
									Créer src/utils/quote-pdf-generator.ts avec
									watermark démo + professionnel, audit trail
									et QR Code
								</div>
							</div>
						</div>

						<div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
							<Badge variant="outline" className="mt-0.5">
								MOYENNE
							</Badge>
							<div>
								<div className="font-semibold">
									Ajouter hash SHA-256 sur exports Excel
								</div>
								<div className="text-sm text-muted-foreground mt-1">
									Pour traçabilité intégrité, stocker dans
									audit trail
								</div>
							</div>
						</div>

						<div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
							<Badge variant="secondary" className="mt-0.5">
								BASSE
							</Badge>
							<div>
								<div className="font-semibold">
									Page explicative parcours utilisateur
								</div>
								<div className="text-sm text-muted-foreground mt-1">
									Créer /how-it-works avec diagramme visiteur
									→ démo → authentifié
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</Layout>
	);
};

export default UserJourneyVisualizationPage;
