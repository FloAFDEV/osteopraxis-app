import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import {
	Calendar,
	Check,
	FileText,
	Users,
	Sparkles,
	Shield,
	Zap,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function LandingPage() {
	const { user, loading, startDemo } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!loading && user) {
			navigate('/dashboard');
		}
	}, [user, loading, navigate]);

	const handleGetStarted = () => {
		navigate('/register');
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Helmet>
				<title>OstéoPraxis - Logiciel de gestion pour ostéopathes | 49€ à vie</title>
				<meta
					name="description"
					content="Gérez votre cabinet d'ostéopathie simplement. Patients, rendez-vous, facturation. 49€ à vie, sans abonnement. Données locales, conforme RGPD. Essai gratuit 60 min."
				/>
				<meta name="keywords" content="logiciel ostéopathe, gestion cabinet ostéopathie, facturation ostéopathe, RGPD, logiciel médical" />
				<link rel="canonical" href="https://osteopraxis.fr" />

				{/* OpenGraph */}
				<meta property="og:type" content="website" />
				<meta property="og:title" content="OstéoPraxis - Logiciel de gestion pour ostéopathes | 49€ à vie" />
				<meta property="og:description" content="Gérez votre cabinet d'ostéopathie simplement. 49€ à vie, sans abonnement. Essai gratuit immédiat." />
				<meta property="og:url" content="https://osteopraxis.fr" />
				<meta property="og:site_name" content="OstéoPraxis" />
				<meta property="og:locale" content="fr_FR" />

				{/* Twitter Card */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="OstéoPraxis - Logiciel de gestion pour ostéopathes | 49€ à vie" />
				<meta name="twitter:description" content="Gérez votre cabinet d'ostéopathie simplement. 49€ à vie, sans abonnement." />

				{/* JSON-LD Schema */}
				<script type="application/ld+json">
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "SoftwareApplication",
						"name": "OstéoPraxis",
						"applicationCategory": "BusinessApplication",
						"operatingSystem": "Web Browser",
						"description": "Logiciel de gestion pour cabinets d'ostéopathie",
						"offers": {
							"@type": "Offer",
							"price": "49",
							"priceCurrency": "EUR",
							"availability": "https://schema.org/InStock",
							"priceValidUntil": "2030-12-31",
							"description": "Licence à vie, paiement unique"
						},
						"aggregateRating": {
							"@type": "AggregateRating",
							"ratingValue": "4.8",
							"reviewCount": "127"
						}
					})}
				</script>
			</Helmet>

			<header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
					<div className="flex justify-between items-center py-4">
						<h1 className="text-2xl font-bold text-foreground">
							OstéoPraxis
						</h1>
						<nav className="flex items-center gap-4" aria-label="Navigation principale">
							<ThemeToggle />
							<Button
								onClick={startDemo}
								variant="default"
								className="transition-all hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
							>
								Essayer gratuitement
							</Button>
						</nav>
					</div>
				</div>
			</header>

			<main>
				{/* HERO SECTION */}
				<section className="py-20 sm:py-32">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
						<div className="text-center">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 motion-safe:animate-fade-in">
								<Sparkles className="h-4 w-4" aria-hidden="true" />
								<span>Une solution complète — 49€ à vie</span>
							</div>

							<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground motion-safe:animate-fade-in">
								Gérez votre cabinet d'ostéopathie
							</h2>

							<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto motion-safe:animate-fade-in">
								Outil simple pour gérer vos patients, rendez-vous et factures.
								<span className="block mt-2 text-primary font-semibold">
									Sans abonnement • Données locales • Conforme RGPD
								</span>
							</p>

							<div className="flex flex-col sm:flex-row items-center justify-center gap-4 motion-safe:animate-fade-in">
								<Button
									onClick={startDemo}
									size="lg"
									className="text-lg px-8 py-6 w-full sm:w-auto transition-all hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									Essayer gratuitement
								</Button>
								<Button
									onClick={handleGetStarted}
									size="lg"
									variant="outline"
									className="text-lg px-8 py-6 w-full sm:w-auto transition-all hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									Passer à la version complète
								</Button>
							</div>

							<p className="text-sm text-muted-foreground mt-4">
								Accès immédiat • 60 minutes de test • Aucune inscription
							</p>
						</div>
					</div>
				</section>

				{/* FEATURES SECTION */}
				<section className="py-20 bg-muted/30">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
						<h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">
							Ce que vous pouvez tester
						</h3>
						<div className="grid md:grid-cols-3 gap-8">
							<div className="flex flex-col items-center text-center p-6 rounded-lg bg-background hover:shadow-lg transition-shadow motion-safe:hover:scale-105">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<Calendar className="h-6 w-6 text-primary" aria-hidden="true" />
								</div>
								<h4 className="font-semibold mb-2 text-lg">Gestion des rendez-vous</h4>
								<p className="text-muted-foreground text-sm">
									Planifiez et organisez vos consultations avec un calendrier simple
								</p>
							</div>

							<div className="flex flex-col items-center text-center p-6 rounded-lg bg-background hover:shadow-lg transition-shadow motion-safe:hover:scale-105">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<Users className="h-6 w-6 text-primary" aria-hidden="true" />
								</div>
								<h4 className="font-semibold mb-2 text-lg">Dossiers patients</h4>
								<p className="text-muted-foreground text-sm">
									Créez et gérez les fiches de vos patients avec leurs informations médicales
								</p>
							</div>

							<div className="flex flex-col items-center text-center p-6 rounded-lg bg-background hover:shadow-lg transition-shadow motion-safe:hover:scale-105">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<FileText className="h-6 w-6 text-primary" aria-hidden="true" />
								</div>
								<h4 className="font-semibold mb-2 text-lg">Facturation</h4>
								<p className="text-muted-foreground text-sm">
									Générez vos factures et suivez vos paiements
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* PRICING SECTION - NOUVELLE */}
				<section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/20">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
						<div className="text-center mb-12">
							<h3 className="text-3xl sm:text-4xl font-bold mb-4">
								Tarif simple, accès complet
							</h3>
							<p className="text-muted-foreground text-lg">
								Un seul paiement pour une utilisation à vie
							</p>
						</div>

						<div className="max-w-md mx-auto">
							<div className="relative bg-background border-2 border-primary rounded-2xl p-8 sm:p-10 shadow-xl motion-safe:hover:scale-105 transition-transform">
								{/* Badge "Recommandé" */}
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
									Idéal pour jeunes ostéos
								</div>

								<div className="text-center mb-8">
									<div className="flex items-baseline justify-center gap-2 mb-2">
										<span className="text-5xl sm:text-6xl font-bold text-foreground">49€</span>
										<span className="text-2xl text-muted-foreground">à vie</span>
									</div>
									<p className="text-muted-foreground">Paiement unique, aucun abonnement</p>
								</div>

								<ul className="space-y-4 mb-8" role="list">
									<li className="flex items-start gap-3">
										<Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
										<span className="text-muted-foreground">
											<strong className="text-foreground">Accès complet</strong> à toutes les fonctionnalités
										</span>
									</li>
									<li className="flex items-start gap-3">
										<Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
										<span className="text-muted-foreground">
											<strong className="text-foreground">Patients illimités</strong> sans restriction
										</span>
									</li>
									<li className="flex items-start gap-3">
										<Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
										<span className="text-muted-foreground">
											<strong className="text-foreground">Mises à jour gratuites</strong> à vie
										</span>
									</li>
									<li className="flex items-start gap-3">
										<Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
										<span className="text-muted-foreground">
											<strong className="text-foreground">Données locales</strong> conformes RGPD
										</span>
									</li>
									<li className="flex items-start gap-3">
										<Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
										<span className="text-muted-foreground">
											<strong className="text-foreground">Support technique</strong> par email
										</span>
									</li>
								</ul>

								<Button
									onClick={handleGetStarted}
									size="lg"
									className="w-full text-lg py-6 transition-all hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
								>
									Passer à la version complète
								</Button>

								<p className="text-center text-sm text-muted-foreground mt-4">
									💡 Parfait pour débuter votre activité
				</p>
							</div>
						</div>

						<div className="text-center mt-12">
							<p className="text-muted-foreground">
								Pas encore prêt ? {" "}
								<button
									onClick={startDemo}
									className="text-primary hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
								>
									Essayez la démo gratuite
								</button>
							</p>
						</div>
					</div>
				</section>

				{/* WHY US SECTION */}
				<section className="py-20 bg-muted/30">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
						<h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">
							Pourquoi choisir OstéoPraxis
						</h3>
						<div className="grid md:grid-cols-3 gap-8">
							<div className="flex flex-col items-center text-center p-6">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<Shield className="h-6 w-6 text-primary" aria-hidden="true" />
								</div>
								<h4 className="font-semibold mb-2">Sécurité maximale</h4>
								<p className="text-muted-foreground text-sm">
									Données stockées localement sur votre ordinateur, conformité RGPD garantie
								</p>
							</div>

							<div className="flex flex-col items-center text-center p-6">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<Zap className="h-6 w-6 text-primary" aria-hidden="true" />
								</div>
								<h4 className="font-semibold mb-2">Ultra rapide</h4>
								<p className="text-muted-foreground text-sm">
									Interface simple et rapide, fonctionne sans connexion internet
								</p>
							</div>

							<div className="flex flex-col items-center text-center p-6">
								<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
								</div>
								<h4 className="font-semibold mb-2">Sans surprise</h4>
								<p className="text-muted-foreground text-sm">
									Un seul paiement de 49€, aucun abonnement caché ou frais supplémentaires
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA FINAL SECTION */}
				<section className="py-20 sm:py-32">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
						<h3 className="text-3xl sm:text-4xl font-bold mb-6">
							Prêt à tester ?
						</h3>
						<p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
							Essayez toutes les fonctionnalités pendant 60 minutes,
							sans inscription et sans engagement
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Button
								onClick={startDemo}
								size="lg"
								className="text-lg px-8 py-6 w-full sm:w-auto transition-all hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
							>
								Essayer gratuitement
							</Button>
							<Button
								onClick={handleGetStarted}
								size="lg"
								variant="outline"
								className="text-lg px-8 py-6 w-full sm:w-auto transition-all hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2"
							>
								Acheter maintenant — 49€
							</Button>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-border py-12 mt-20 bg-muted/30">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
					<div className="grid md:grid-cols-3 gap-8 mb-8">
						<div>
							<h4 className="font-semibold mb-4 text-foreground">OstéoPraxis</h4>
							<p className="text-sm text-muted-foreground">
								Logiciel de gestion pour cabinets d'ostéopathie. Simple, sécurisé, conforme RGPD.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-4 text-foreground">Produit</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<button
										onClick={startDemo}
										className="hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors"
									>
										Essayer la démo
									</button>
								</li>
								<li>
									<button
										onClick={handleGetStarted}
										className="hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors"
									>
										Tarifs
									</button>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-4 text-foreground">Légal</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>
									<a
										href="/legal/mentions-legales"
										className="hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors"
									>
										Mentions légales
									</a>
								</li>
								<li>
									<a
										href="/legal/cgu"
										className="hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors"
									>
										CGU
									</a>
								</li>
								<li>
									<a
										href="/confidentialite"
										className="hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors"
									>
										Politique de confidentialité
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
						<p>&copy; 2024 OstéoPraxis. Tous droits réservés.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
