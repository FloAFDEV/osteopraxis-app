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
		title: "Tableaux de bord",
		description:
			"Analysez votre activité avec des statistiques détaillées et des graphiques intuitifs.",
	},
	{
		icon: Clock,
		title: "Gain de temps",
		description:
			"Automatisez vos tâches administratives et concentrez-vous sur vos patients.",
	},
	{
		icon: Shield,
		title: "Sécurité RGPD",
		description:
			"Vos données et celles de vos patients sont protégées selon les normes européennes.",
	},
];

const testimonials = [
	{
		name: "Franck Blanchet D.E",
		role: "Ostéopathe à Paris",
		content:
			"Cette solution a révolutionné ma pratique. Je gagne 2h par jour sur l'administratif !",
		rating: 5,
		avatar: "SM",
	},
	{
		name: "Florent PEREZ D.E",
		role: "Cabinet multi-praticiens Lyon",
		content:
			"Parfait pour gérer notre cabinet à plusieurs. L'interface est intuitive et moderne.",
		rating: 5,
		avatar: "JPD",
	},
	{
		name: "Julia Rozier D.E",
		role: "Ostéopathe libérale",
		content:
			"Le rapport qualité-prix est excellent. Je recommande vivement !",
		rating: 5,
		avatar: "ML",
	},
];

const faqs = [
	{
		question: "Comment commencer avec PatientHub ?",
		answer: "Il suffit de créer votre compte gratuit, configurer votre profil d'ostéopathe et commencer à ajouter vos patients. Notre interface intuitive vous guide pas à pas.",
	},
	{
		question: "Mes données sont-elles sécurisées ?",
		answer: "Absolument. Nous utilisons un chiffrement de niveau bancaire et sommes conformes au RGPD. Vos données sont hébergées sur des serveurs européens sécurisés.",
	},
	{
		question: "Puis-je importer mes données existantes ?",
		answer: "Cette fonctionnalité est actuellement en cours de développement et sera bientôt disponible. Vous pourrez alors importer facilement vos données depuis d'autres logiciels ou fichiers Excel/CSV.",
	},
	{
		question: "Y a-t-il une période d'essai ?",
		answer: "Oui, vous pouvez tester gratuitement toutes les fonctionnalités pendant 14 jours, sans engagement.",
	},
	{
		question: "Le support client est-il inclus ?",
		answer: "Bien sûr ! Notre équipe de support francophone est disponible par email et chat pour vous accompagner.",
	},
];

export default function LandingPage() {
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { user, loading } = useAuth();
	const navigate = useNavigate();

	// Redirection avec useNavigate au lieu de window.location.href
	useEffect(() => {
		if (user && !loading) {
			// Rediriger les admins vers leur dashboard spécifique
			if (user.role === "ADMIN") {
				navigate("/admin/dashboard");
			} else {
				navigate("/dashboard");
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
							<Link
								to="/login"
								className="text-muted-foreground hover:text-foreground transition-colors text-base whitespace-nowrap"
							>
								Connexion
							</Link>
							<ThemeToggle />
							<Button
								asChild
								size="sm"
								className="whitespace-nowrap"
							>
								<Link to="/register">Essai gratuit</Link>
							</Button>
						</nav>

						{/* Tablet Navigation */}
						<nav className="hidden md:flex lg:hidden items-center space-x-4">
							<ThemeToggle />
							<Button
								asChild
								size="sm"
								className="whitespace-nowrap"
							>
								<Link to="/register">Essai gratuit</Link>
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
									<Button asChild className="w-full">
										<Link
											to="/register"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											Essai gratuit
										</Link>
									</Button>
								</div>
							</nav>
						</div>
					)}
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-blue-100 to-white dark:from-slate-950 dark:to-slate-900">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
					<div className="max-w-5xl mx-auto text-center">
						<Badge
							variant="outline"
							className="mb-6 sm:mb-8 bg-white/60 border-blue-300 text-blue-800 dark:bg-slate-800/60 dark:border-blue-600 dark:text-blue-300 text-sm sm:text-base"
						>
							<Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
							Solution complète pour ostéopathes
						</Badge>

						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-slate-900 dark:text-white leading-tight">
							<span className="text-foreground">Patient</span>
							<span className="ml-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
								Hub
							</span>
						</h1>

						<p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
							La plateforme tout-en-un pour gérer votre cabinet :
							dossiers patients, rendez-vous, facturation et
							statistiques en un seul endroit.
						</p>

						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
							<Button
								size="lg"
								className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
								asChild
							>
								<Link to="/register">
									Commencer gratuitement
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
								asChild
							>
								<Link to="/demo">Voir la démo</Link>
							</Button>
						</div>

						<div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-4">
							<span className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
								Essai gratuit 14 jours
							</span>
							<span className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
								Sans engagement
							</span>
							<span className="flex items-center gap-2">
								<span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
								Support francophone
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
									alt="Interface de calendrier PatientHub"
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
									Planifiez et gérez vos consultations avec
									une interface élégante. Synchronisation
									automatique, rappels intelligents et vue
									d'ensemble de votre planning en temps réel.
								</p>
								<div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
									<div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-background border border-border/50">
										<div className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></div>
										<span className="text-xs sm:text-sm font-medium">
											Synchronisation multi-appareils
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
											Partage sécurisé des données
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

			{/* Pricing Section */}
			<section
				id="pricing"
				className="py-20 bg-gradient-to-b from-background to-muted/30"
			>
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Des tarifs transparents
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Choisissez l'offre qui correspond à vos besoins.
							Évolutif selon votre croissance.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
						{/* Plan Gratuit */}
						<Card className="relative border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardContent className="p-6">
								<h3 className="text-2xl font-bold mb-2">
									Gratuit
								</h3>
								<p className="text-muted-foreground mb-4">
									Pour découvrir
								</p>
								<div className="mb-6">
									<span className="text-4xl font-bold">
										0€
									</span>
									<span className="text-muted-foreground">
										/mois
									</span>
								</div>
								<ul className="space-y-3 mb-6">
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Jusqu'à 50 patients</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>1 cabinet</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>1 praticien</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Gestion des RDV</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Dossier médical basique</span>
									</li>
								</ul>
								<Button className="w-full" asChild>
									<Link to="/register">Commencer</Link>
								</Button>
							</CardContent>
						</Card>

						{/* Plan Essentiel */}
						<Card className="relative border-border/50 hover:border-primary/30 transition-all duration-300">
							<CardContent className="p-6">
								<h3 className="text-2xl font-bold mb-2">
									Essentiel
								</h3>
								<p className="text-muted-foreground mb-4">
									Pour les praticiens indépendants
								</p>
								<div className="mb-6">
									<span className="text-4xl font-bold">
										9€
									</span>
									<span className="text-muted-foreground">
										/mois
									</span>
								</div>
								<ul className="space-y-3 mb-6">
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Jusqu'à 500 patients</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>1 cabinet</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>1 praticien</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Facturation</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Export comptable PDF</span>
									</li>
								</ul>
								<Button className="w-full" asChild>
									<Link to="/register">Essai gratuit</Link>
								</Button>
							</CardContent>
						</Card>

						{/* Plan Pro */}
						<Card className="relative border-primary scale-105 shadow-lg shadow-primary/20">
							<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
								<Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md">
									Populaire
								</Badge>
							</div>
							<CardContent className="p-6">
								<h3 className="text-2xl font-bold mb-2">Pro</h3>
								<p className="text-muted-foreground mb-4">
									Le plus populaire
								</p>
								<div className="mb-6">
									<span className="text-4xl font-bold">
										16€
									</span>
									<span className="text-muted-foreground">
										/mois
									</span>
								</div>
								<ul className="space-y-3 mb-6">
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Jusqu'à 1000 patients</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>2 cabinets</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>2 praticiens</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Statistiques avancées</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Support prioritaire</span>
									</li>
								</ul>
								<Button className="w-full" asChild>
									<Link to="/register">Essai gratuit</Link>
								</Button>
							</CardContent>
						</Card>

						{/* Plan Premium */}
						<Card className="relative border-border/50 hover:border-primary/30 transition-all duration-300">
							<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
								<Badge
									variant="secondary"
									className="bg-accent/20 text-accent border-accent/30"
								>
									Entreprise
								</Badge>
							</div>
							<CardContent className="p-6">
								<h3 className="text-2xl font-bold mb-2">
									Premium
								</h3>
								<p className="text-muted-foreground mb-4">
									Pour les gros cabinets
								</p>
								<div className="mb-6">
									<span className="text-4xl font-bold">
										34€
									</span>
									<span className="text-muted-foreground">
										/mois
									</span>
								</div>
								<ul className="space-y-3 mb-6">
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Jusqu'à 3000 patients</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>5 cabinets</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Praticiens illimités</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Partage multi-praticiens</span>
									</li>
									<li className="flex items-center gap-2">
										<Check className="h-4 w-4 text-primary" />
										<span>Accès API</span>
									</li>
								</ul>
								<Button className="w-full" asChild>
									<Link to="/register">Essai gratuit</Link>
								</Button>
							</CardContent>
						</Card>
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
							Tout ce que vous devez savoir sur PatientHub
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
						Rejoignez des centaines de professionnels de santé qui
						ont déjà choisi{" "}
						<span className="font-semibold text-blue-600 dark:text-blue-400">
							PatientHub
						</span>
					</p>
					<Button
						size="lg"
						variant="secondary"
						asChild
						className="text-lg px-8"
					>
						<Link to="/register">Commencer maintenant</Link>
					</Button>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
						Essai gratuit 14 jours • Configuration en 5 minutes
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
						<p>&copy; 2024 PatientHub. Tous droits réservés.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
