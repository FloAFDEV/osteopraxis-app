import calendarFeature from "@/assets/calendar-feature.jpg";
import osteopathTreatment from "@/assets/osteopath-treatment.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import {
	BarChart3,
	Calendar,
	Check,
	ChevronDown,
	ChevronUp,
	Clock,
	FileText,
	Menu,
	Shield,
	Star,
	Stethoscope,
	Users,
	X,
	Play,
	Zap,
	TrendingUp,
	Database,
	Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const features = [
	{
		icon: Calendar,
		title: "Gestion des rendez-vous",
		description:
			"Planifiez et gérez vos consultations en toute simplicité avec notre calendrier intégré.",
	},
	{
		icon: Users,
		title: "Dossiers patients",
		description:
			"Centralisez toutes les informations médicales de vos patients en un seul endroit sécurisé.",
	},
	{
		icon: FileText,
		title: "Facturation automatisée",
		description:
			"Générez vos factures automatiquement et suivez vos paiements en temps réel.",
	},
	{
		icon: BarChart3,
		title: "Tableaux de bord avancés",
		description:
			"Analysez votre activité avec des statistiques détaillées, des graphiques intuitifs et des optimisations intelligentes.",
	},
	{
		icon: Clock,
		title: "Optimisation automatique",
		description:
			"Système d'optimisation intelligent qui améliore automatiquement les performances de votre cabinet.",
	},
	{
		icon: Shield,
		title: "Stockage Local Sécurisé",
		description:
			"Données sensibles stockées localement sur votre ordinateur. Conformité RGPD garantie avec chiffrement avancé.",
	},
];

const testimonials = [
	{
		name: "Franck Blanchet D.E",
		role: "Ostéopathe à Gratentour",
		content:
			"Cette solution a révolutionné ma pratique. Je gagne 2h par jour sur l'administratif !",
		rating: 5,
		avatar: "FB",
	},
	{
		name: "Anaïs Quintoli D.E",
		role: "Cabinet multi-praticiens Cépet",
		content:
			"Parfait pour gérer notre cabinet à plusieurs. L'interface est intuitive et moderne.",
		rating: 5,
		avatar: "AQ",
	},
	{
		name: "Julia Rozier D.E",
		role: "Ostéopathe à Bruguières",
		content:
			"Le rapport qualité-prix est excellent. Je recommande vivement !",
		rating: 5,
		avatar: "JR",
	},
];

const faqs = [
	{
		question: "Pourquoi 'Anti-Cloud' ? C'est quoi la différence ?",
		answer: "Les solutions cloud classiques stockent VOS données de santé (patients, consultations, dossiers médicaux) sur LEURS serveurs. Cela implique des coûts d'hébergement HDS (10k€+/an), des risques de fuite, et une complexité RGPD énorme. OstéoPraxis stocke tout localement sur VOTRE ordinateur avec chiffrement AES-256-GCM. Résultat : sécurité maximale, conformité RGPD automatique, et aucun frais d'hébergement.",
	},
	{
		question: "Mes données sont-elles vraiment en sécurité en local ?",
		answer: "OUI ! Le stockage local chiffré est PLUS sûr que le cloud. Vos données ne transitent jamais sur internet, impossible de les hacker à distance. Nous utilisons AES-256-GCM (niveau militaire) + PBKDF2 150,000 itérations. Même si quelqu'un vole votre ordinateur, vos données restent illisibles sans votre mot de passe. Aucune fuite possible comme avec les clouds (piratages, erreurs de config, employés malveillants...).",
	},
	{
		question: "Et si je change d'ordinateur ou perds mes données ?",
		answer: "Vous pouvez faire des sauvegardes chiffrées manuelles sur clé USB, disque externe, ou votre propre cloud personnel (Dropbox, Google Drive - mais VOS données restent chiffrées). L'export est simple (1 clic) et vous gardez 100% le contrôle. Contrairement au cloud où VOS données appartiennent au fournisseur.",
	},
	{
		question: "49€ une fois, c'est vraiment sans abonnement ?",
		answer: "OUI. Vous payez 49€, vous utilisez OstéoPraxis À VIE. Aucun abonnement caché, aucune facturation mensuelle, aucune augmentation de prix. Les concurrents cloud vous facturent 30€/mois (360€/an) parce qu'ils doivent payer l'hébergement HDS. Nous, on stocke localement = aucun coût serveur = on peut proposer un prix unique. Sur 5 ans, vous économisez 1,751€.",
	},
	{
		question: "C'est vraiment conforme RGPD sans effort ?",
		answer: "OUI. Le RGPD impose de minimiser les données en cloud, sécuriser les transferts, gérer les consentements, nommer un DPO pour le HDS... Avec OstéoPraxis : données locales = pas de transfert = pas de DPO = pas de registre complexe. Vous êtes naturellement conforme car VOS données ne quittent JAMAIS votre ordinateur. C'est le niveau de conformité le plus élevé possible.",
	},
	{
		question: "Puis-je essayer avant d'acheter ?",
		answer: "OUI ! Deux options : (1) Démo gratuite illimitée pour tester l'interface et les fonctionnalités (les factures PDF portent un filigrane 'DEMO'). (2) Achetez pour 49€ avec garantie 30 jours satisfait ou remboursé - si vous n'êtes pas satisfait, on vous rembourse intégralement sous 48h, aucune question posée.",
	},
	{
		question: "J'aurai quand même des mises à jour ?",
		answer: "OUI ! Toutes les mises à jour sont incluses à vie dans votre achat de 49€. Nouvelles fonctionnalités, corrections de bugs, améliorations de sécurité - tout est gratuit. Pas de frais cachés, pas d'upgrade payant. Le seul coût : 49€ une fois.",
	},
];

export default function LandingPage() {
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, loading } = useAuth();
	const navigate = useNavigate();

	// Redirection automatique vers le dashboard pour les utilisateurs connectés
	useEffect(() => {
		if (!loading && user) {
			// Vérifier si c'est un utilisateur démo
			const isDemoUser = user.email === 'demo@patienthub.com' || user.email?.startsWith('demo-');
			if (!isDemoUser) {
				// Utilisateur réel - rediriger vers le dashboard
				navigate('/dashboard');
			}
		}
	}, [user, loading, navigate]);


	// Ne pas afficher la landing page pendant le loading
	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header Marketing */}
			<header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
					<div className="flex justify-between items-center py-3 md:py-4 min-h-[60px]">
						<h1 className="text-xl sm:text-3xl font-extrabold tracking-tight flex-shrink-0">
							<span className="text-foreground">Patient</span>
							<span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
								Hub
							</span>
						</h1>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
						<a
							href="#features"
							className="text-muted-foreground hover:text-foreground transition-colors text-base whitespace-nowrap"
						>
							Fonctionnalités
						</a>
						<a
							href="#pricing"
							className="text-muted-foreground hover:text-foreground transition-colors text-base whitespace-nowrap"
						>
							Tarifs
						</a>
						<a
							href="#testimonials"
							className="text-muted-foreground hover:text-foreground transition-colors text-base whitespace-nowrap"
						>
							Témoignages
						</a>
						{user ? (
							<Button
								asChild
								variant="outline"
								size="sm"
								className="whitespace-nowrap"
							>
								<Link to="/dashboard">Dashboard</Link>
							</Button>
						) : (
							<Link
								to="/login"
								className="text-muted-foreground hover:text-foreground transition-colors text-base whitespace-nowrap"
							>
								Connexion
							</Link>
						)}
						<ThemeToggle />
						<Button
							asChild
							size="sm"
							className="whitespace-nowrap text-white"variant="primary"
						>
							<Link to="/demo">Essayer la démo</Link>
						</Button>
					</nav>

						{/* Tablet Navigation */}
						<nav className="hidden md:flex lg:hidden items-center space-x-4">
							<ThemeToggle />
							<Button
								asChild
								size="sm"
								className="whitespace-nowrap"variant="primary"
							>
								<Link to="/demo">Essayer la démo</Link>
							</Button>
							<button
								onClick={() =>
									setMobileMenuOpen(!mobileMenuOpen)
								}
								className="p-2 hover:bg-muted rounded-md transition-colors"
							>
								{mobileMenuOpen ? (
									<X className="h-5 w-5" />
								) : (
									<Menu className="h-5 w-5" />
								)}
							</button>
						</nav>

						{/* Mobile Menu Button */}
						<div className="md:hidden flex items-center space-x-2">
							<ThemeToggle />
							<button
								onClick={() =>
									setMobileMenuOpen(!mobileMenuOpen)
								}
								className="p-2 hover:bg-muted rounded-md transition-colors"
							>
								{mobileMenuOpen ? (
									<X className="h-5 w-5" />
								) : (
									<Menu className="h-5 w-5" />
								)}
							</button>
						</div>
					</div>

					{/* Mobile & Tablet Navigation Dropdown */}
					{mobileMenuOpen && (
						<div className="lg:hidden border-t border-border/40 py-4 bg-background/95 backdrop-blur">
							<nav className="flex flex-col space-y-3">
								<a
									href="#features"
									className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 rounded-md hover:bg-muted"
									onClick={() => setMobileMenuOpen(false)}
								>
									Fonctionnalités
								</a>
								<a
									href="#pricing"
									className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 rounded-md hover:bg-muted"
									onClick={() => setMobileMenuOpen(false)}
								>
									Tarifs
								</a>
								<a
									href="#testimonials"
									className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 rounded-md hover:bg-muted"
									onClick={() => setMobileMenuOpen(false)}
								>
									Témoignages
								</a>
								<Link
									to="/login"
									className="text-muted-foreground hover:text-foreground transition-colors py-2 px-2 rounded-md hover:bg-muted"
									onClick={() => setMobileMenuOpen(false)}
								>
									Connexion
								</Link>
								<div className="pt-2 md:hidden">
									<Button asChild className="w-full" variant="primary">
										<Link
											to="/demo"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											Essayer la démo
										</Link>
									</Button>
								</div>
							</nav>
						</div>
					)}
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
					<div className="max-w-5xl mx-auto text-center">
						{/* Badge Anti-Cloud */}
						<Badge
							variant="outline"
							className="mb-4 sm:mb-6 bg-red-50 border-red-300 text-red-800 dark:bg-red-950/50 dark:border-red-600 dark:text-red-300 text-sm sm:text-base font-semibold px-4 py-2"
						>
							<Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
							🚫 ANTI-CLOUD - VOS DONNÉES RESTENT CHEZ VOUS
						</Badge>

						{/* Titre principal */}
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-slate-900 dark:text-white leading-tight">
							<span className="text-foreground">Ostéo</span>
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
								Praxis
							</span>
						</h1>

						{/* Pricing headline */}
						<p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4 sm:mb-6">
							49€ une seule fois. Pas d'abonnement. Jamais.
						</p>

						{/* Value proposition */}
						<p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
							Pendant que les concurrents vous facturent <span className="text-red-600 font-bold line-through">360€/an</span> en abonnement cloud,
							vous payez <span className="text-green-600 font-bold">49€ à vie</span>.<br/>
							Données 100% locales, aucun cloud HDS.
						</p>

						{/* Anti-cloud explanation box */}
						<div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-500/30 rounded-xl p-6 mb-8 max-w-3xl mx-auto">
							<h3 className="font-bold text-lg mb-3 flex items-center justify-center gap-2">
								<Database className="h-5 w-5 text-green-600" />
								Pourquoi "Anti-Cloud" ?
							</h3>
							<ul className="text-left space-y-2 text-sm sm:text-base">
								<li className="flex items-start gap-2">
									<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
									<span>Vos données HDS ne quittent <strong>JAMAIS</strong> votre ordinateur</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
									<span>Pas besoin d'hébergement HDS certifié (économie 10k€+/an)</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
									<span>Conformité RGPD maximale sans effort</span>
								</li>
								<li className="flex items-start gap-2">
									<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
									<span>Chiffrement AES-256-GCM local (niveau militaire)</span>
								</li>
							</ul>
						</div>


						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
							<Button
								size="lg"
								className="text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
								asChild
							>
								<Link to="/register" className="flex items-center gap-2">
									Acheter maintenant - 49€
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2"
								asChild
							>
								<Link to="/demo" className="flex items-center gap-2">
									<Play className="h-4 w-4" />
									Essayer la démo gratuite
								</Link>
							</Button>
						</div>

						<div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-4">
							<span className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
								Garantie 30 jours satisfait ou remboursé
							</span>
							<span className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
								Sans engagement
							</span>
							<span className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
								Support francophone inclus
							</span>
						</div>

						{/* Features Icons */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 px-4">
							{[
								{
									icon: Calendar,
									label: "Rendez-vous",
									color: "text-blue-600",
								},
								{
									icon: Users,
									label: "Patients",
									color: "text-purple-600",
								},
								{
									icon: FileText,
									label: "Facturation",
									color: "text-pink-600",
								},
								{
									icon: BarChart3,
									label: "Statistiques",
									color: "text-indigo-600",
								},
							].map(({ icon: Icon, label, color }, i) => (
								<div
									key={i}
									className="flex flex-col items-center p-4 sm:p-6 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 hover:scale-105 transition-transform duration-300"
								>
									<Icon
										className={`h-6 w-6 sm:h-8 sm:w-8 mb-2 ${color}`}
									/>
									<span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
										{label}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				id="features"
				className="py-20 bg-gradient-to-b from-muted/30 to-background"
			>
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Tout ce dont vous avez besoin
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Une solution complète conçue pour les professionnels
							de santé modernes
						</p>
					</div>

					{/* Featured Highlights with Images */}
					<div className="space-y-16 sm:space-y-20 lg:space-y-24 mb-16">
						{/* Calendar Feature - Image Left */}
						<div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
							<div className="order-2 lg:order-1">
								<img
									src={calendarFeature}
									alt="Interface de calendrier OstéoPraxis"
									className="rounded-2xl shadow-2xl shadow-primary/20 w-full max-w-lg mx-auto"
								/>
							</div>
							<div className="order-1 lg:order-2 space-y-4 sm:space-y-6 px-4 lg:px-0">
								<div className="inline-flex items-center gap-2 sm:gap-3 bg-primary/10 rounded-full px-4 sm:px-6 py-2 sm:py-3">
									<Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
									<span className="text-primary font-semibold text-sm sm:text-base">
										Gestion Intelligente
									</span>
								</div>
								<h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
									Calendrier moderne et intuitif
								</h3>
							<p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
	Planifiez et gérez vos consultations avec une interface élégante. Synchronisation automatique, rappels intelligents et vue d'ensemble de votre planning en temps réel.
	Il est également possible d'importer vos rendez-vous Doctolib grâce à la synchronisation Google Calendar.
</p>

								<div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
									<div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background border border-border/50">
										<div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
										<span className="text-xs sm:text-sm font-medium">
											Stockage hybride sécurisé
										</span>
									</div>
									<div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background border border-border/50">
										<div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
										<span className="text-xs sm:text-sm font-medium">
											Rappels automatiques SMS/Email
											<br />
											<span className="text-xs text-muted-foreground">
												(En cours)
											</span>
										</span>
									</div>
									<div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background border border-border/50">
										<div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
										<span className="text-xs sm:text-sm font-medium">
											Import automatique Doctolib via
											Google Calendar
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Osteopath Treatment Feature - Image Right */}
						<div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
							<div className="space-y-4 sm:space-y-6 px-4 lg:px-0">
								{/* Badge */}
								<div className="inline-flex items-center gap-2 sm:gap-3 bg-primary/20 dark:bg-primary/30 rounded-full px-4 sm:px-6 py-2 sm:py-3">
									<Users className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
									<span className="text-primary font-semibold text-sm sm:text-base">
										Collaboration Pro
									</span>
								</div>

								{/* Titre */}
								<h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-slate-900 dark:text-white">
									Suivi professionnel des traitements
								</h3>

								{/* Texte */}
								<p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
									Documentez vos séances d'ostéopathie avec
									précision. Partagez les dossiers avec vos
									collègues et assurez un suivi optimal de vos
									patients.
								</p>

								{/* Bullet points */}
								<div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
									<div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background border border-border/50 hover:bg-muted/30 transition-colors">
										<div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
										<span className="text-xs sm:text-sm font-medium text-foreground">
											Gestion multi-praticiens
										</span>
									</div>
									<div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background border border-border/50 hover:bg-muted/30 transition-colors">
										<div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
										<span className="text-xs sm:text-sm font-medium text-foreground">
											Stockage local des données sensibles
										</span>
									</div>
								</div>
							</div>
							<div>
								<img
									src={osteopathTreatment}
									alt="Ostéopathe en consultation"
									className="rounded-2xl shadow-2xl shadow-primary/20 w-full max-w-lg mx-auto"
								/>
							</div>
						</div>
					</div>
					{/* Additional Features Grid */}
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
						{features.map((feature, index) => (
							<Card
								key={index}
								className="h-full hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border border-border/50 hover:border-primary/30"
							>
								<CardContent className="p-6">
									<feature.icon className="h-12 w-12 text-primary mb-4" />
									<h3 className="text-xl font-semibold mb-2 text-foreground">
										{feature.title}
									</h3>
									<p className="text-muted-foreground">
										{feature.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* System Optimization Section */}
			<section className="py-20 bg-gradient-to-b from-background to-muted/30">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge
							variant="outline"
							className="mb-6 bg-primary/10 border-primary/30 text-primary"
						>
							<Zap className="w-4 h-4 mr-2" />
							Optimisation Automatique
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Performance intelligente pour votre cabinet
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Notre système d'optimisation automatique améliore continuellement les performances 
							de votre application pour une expérience utilisateur fluide et rapide.
						</p>
					</div>


					{/* Performance Stats */}
					<div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-8 border border-primary/10">
						<div className="text-center mb-8">
							<h3 className="text-2xl font-bold mb-2">Performances mesurées</h3>
							<p className="text-muted-foreground">
								Résultats réels d'optimisation sur nos cabinets clients
							</p>
						</div>
						
						<div className="grid md:grid-cols-3 gap-8">
							<div className="text-center">
								<div className="text-3xl font-bold text-primary mb-2">85%</div>
								<div className="text-sm text-muted-foreground">
									Plus rapide après optimisation
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-primary mb-2">40%</div>
								<div className="text-sm text-muted-foreground">
									Réduction de l'usage mémoire
								</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-primary mb-2">99.9%</div>
								<div className="text-sm text-muted-foreground">
									Temps de disponibilité
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section
				id="pricing"
				className="py-20 bg-gradient-to-b from-background to-muted/30"
			>
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Un prix unique. Pas d'abonnement.
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Pendant que les autres vous facturent chaque mois, vous payez <strong className="text-green-600">une seule fois</strong>.
						</p>
					</div>

					{/* Comparison Table */}
					<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
						{/* Concurrents (Cloud) */}
						<Card className="relative border-red-200 dark:border-red-900/50">
							<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
								<Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300">
									Solutions Cloud Classiques
								</Badge>
							</div>
							<CardContent className="p-8">
								<div className="mb-6 text-center">
									<div className="text-5xl font-bold text-red-600 mb-2 line-through">
										360€
									</div>
									<div className="text-muted-foreground">par an</div>
									<div className="text-sm text-red-600 mt-2 font-semibold">
										= 1,800€ sur 5 ans
									</div>
								</div>

								<ul className="space-y-3">
									<li className="flex items-start gap-2">
										<X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
										<span className="text-sm">Vos données HDS dans leur cloud</span>
									</li>
									<li className="flex items-start gap-2">
										<X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
										<span className="text-sm">Hébergement HDS certifié (facturé à vous)</span>
									</li>
									<li className="flex items-start gap-2">
										<X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
										<span className="text-sm">Abonnement mensuel/annuel obligatoire</span>
									</li>
									<li className="flex items-start gap-2">
										<X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
										<span className="text-sm">Risque de fuite de données</span>
									</li>
									<li className="flex items-start gap-2">
										<X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
										<span className="text-sm">Complexité RGPD (DPO, registres...)</span>
									</li>
									<li className="flex items-start gap-2">
										<X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
										<span className="text-sm">Dépendance totale au fournisseur</span>
									</li>
								</ul>

								<div className="mt-6 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
									<p className="text-sm font-semibold text-red-800 dark:text-red-300">
										Prix qui augmente chaque année
									</p>
								</div>
							</CardContent>
						</Card>

						{/* OstéoPraxis (Anti-Cloud) */}
						<Card className="relative border-green-500 dark:border-green-700 scale-105 shadow-2xl shadow-green-500/20">
							<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
								<Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
									OstéoPraxis - Anti-Cloud
								</Badge>
							</div>
							<CardContent className="p-8">
								<div className="mb-6 text-center">
									<div className="text-6xl font-bold text-green-600 mb-2">
										49€
									</div>
									<div className="text-muted-foreground">une seule fois</div>
									<div className="text-sm text-green-600 mt-2 font-semibold">
										= 49€ pour toujours
									</div>
									<div className="mt-3 px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-full inline-block">
										<p className="text-lg font-bold text-green-700 dark:text-green-400">
											Économisez 1,751€ sur 5 ans
										</p>
									</div>
								</div>

								<ul className="space-y-3">
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
										<span className="text-sm font-medium">Vos données HDS 100% locales (jamais dans le cloud)</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
										<span className="text-sm font-medium">Chiffrement AES-256-GCM niveau militaire</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
										<span className="text-sm font-medium">Aucun hébergement HDS à payer</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
										<span className="text-sm font-medium">Conformité RGPD maximale par design</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
										<span className="text-sm font-medium">Toutes les fonctionnalités incluses</span>
									</li>
									<li className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
										<span className="text-sm font-medium">Indépendance totale - logiciel à vous</span>
									</li>
								</ul>

								<div className="mt-6 space-y-3">
									<Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6" asChild>
										<Link to="/register">
											<Shield className="mr-2 h-5 w-5" />
											Acheter maintenant - 49€
										</Link>
									</Button>
									<Button variant="outline" className="w-full" asChild>
										<Link to="/demo">Essayer la démo gratuite</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Garanties */}
					<div className="max-w-3xl mx-auto">
						<div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900 rounded-xl p-6">
							<div className="flex items-start gap-4">
								<Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
								<div>
									<h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
										Garantie 30 jours satisfait ou remboursé
									</h3>
									<p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
										Testez OstéoPraxis pendant 30 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement, sans question.
									</p>
									<ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
										<li className="flex items-center gap-2">
											<Check className="h-4 w-4 text-blue-600" />
											<span>Remboursement sous 48h</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-4 w-4 text-blue-600" />
											<span>Aucune justification demandée</span>
										</li>
										<li className="flex items-center gap-2">
											<Check className="h-4 w-4 text-blue-600" />
											<span>Vos données locales restent les vôtres</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section
				id="testimonials"
				className="py-20 bg-gradient-to-b from-muted/30 to-background"
			>
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Ils nous font confiance
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Découvrez ce que disent nos utilisateurs
						</p>
					</div>
					<div className="grid md:grid-cols-3 gap-8">
						{testimonials.map((testimonial, index) => (
							<Card
								key={index}
								className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
							>
								<CardContent className="p-6">
									<div className="flex items-center gap-1 mb-4">
										{[...Array(testimonial.rating)].map(
											(_, i) => (
												<Star
													key={i}
													className="h-4 w-4 fill-primary text-primary"
												/>
											)
										)}
									</div>
									<p className="text-muted-foreground mb-4 italic">
										"{testimonial.content}"
									</p>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center border border-primary/20">
											<span className="text-primary font-semibold text-sm">
												{testimonial.avatar}
											</span>
										</div>
										<div>
											<p className="font-semibold">
												{testimonial.name}
											</p>
											<p className="text-sm text-muted-foreground">
												{testimonial.role}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-20">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Questions fréquentes
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Tout ce que vous devez savoir sur notre approche anti-cloud
						</p>
					</div>
					<div className="max-w-3xl mx-auto">
						{faqs.map((faq, index) => (
							<Card key={index} className="mb-4">
								<CardContent className="p-0">
									<button
										onClick={() =>
											setOpenFaq(
												openFaq === index ? null : index
											)
										}
										className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
									>
										<span className="font-semibold">
											{faq.question}
										</span>
										{openFaq === index ? (
											<ChevronUp className="h-5 w-5 text-muted-foreground" />
										) : (
											<ChevronDown className="h-5 w-5 text-muted-foreground" />
										)}
									</button>
									{openFaq === index && (
										<div className="px-6 pb-6">
											<p className="text-muted-foreground">
												{faq.answer}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 relative lg:py-32 bg-gradient-to-br from-blue-100 to-white dark:from-slate-950 dark:to-slate-900">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
						Prêt à transformer votre pratique ?
					</h2>
					<p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
						Découvrez{" "}
						<span className="font-semibold text-blue-600 dark:text-blue-400">
							OstéoPraxis
						</span>{" "}
						avec notre démo interactive, puis créez votre compte
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							asChild
							className="text-lg px-8"
						>
							<Link to="/register">Créer mon compte</Link>
						</Button>
						<Button
							size="lg"
							variant="primary"
							asChild
							className="text-lg px-8"
						>
							<Link to="/demo" className="flex items-center gap-2">
								<Play className="h-4 w-4" />
								Essayer la démo
							</Link>
						</Button>
					</div>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
						Démo interactive gratuite • Configuration en 5 minutes
					</p>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-background border-t border-border/40 py-12">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid md:grid-cols-4 gap-8">
						<div>
							<h1 className="text-xl font-extrabold tracking-tight mb-4">
								<span className="text-foreground">Patient</span>
								<span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
									Hub
								</span>
							</h1>
							<p className="text-muted-foreground">
								La solution complète pour gérer vos patients et
								votre pratique ostéopathique.
							</p>
						</div>
						<div>
							<h3 className="font-semibold mb-4">Produit</h3>
							<ul className="space-y-2 text-muted-foreground">
								<li>
									<a
										href="#features"
										className="hover:text-foreground transition-colors"
									>
										Fonctionnalités
									</a>
								</li>
								<li>
									<a
										href="#pricing"
										className="hover:text-foreground transition-colors"
									>
										Tarifs
									</a>
								</li>
								<li>
									<Link
										to="/demo"
										className="hover:text-foreground transition-colors"
									>
										Démo
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-4">Support</h3>
							<ul className="space-y-2 text-muted-foreground">
								<li>
									<Link
										to="/help"
										className="hover:text-foreground transition-colors"
									>
										Centre d'aide
									</Link>
								</li>
								<li>
									<Link
										to="/contact"
										className="hover:text-foreground transition-colors"
									>
										Contact
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="font-semibold mb-4">Légal</h3>
							<ul className="space-y-2 text-muted-foreground">
								<li>
									<Link
										to="/privacy"
										className="hover:text-foreground transition-colors"
									>
										Confidentialité
									</Link>
								</li>
								<li>
									<Link
										to="/terms"
										className="hover:text-foreground transition-colors"
									>
										CGU
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
						<p>&copy; 2024 OstéoPraxis. Tous droits réservés.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
