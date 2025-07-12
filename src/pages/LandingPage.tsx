import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Clock, 
  Shield,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Heart,
  Stethoscope
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import dashboardHero from "@/assets/dashboard-hero.jpg";
import medicalTeam from "@/assets/medical-team.jpg";
import calendarFeature from "@/assets/calendar-feature.jpg";

const features = [
  {
    icon: Calendar,
    title: "Gestion des rendez-vous",
    description: "Planifiez et gérez vos consultations en toute simplicité avec notre calendrier intégré."
  },
  {
    icon: Users,
    title: "Dossiers patients",
    description: "Centralisez toutes les informations médicales de vos patients en un seul endroit sécurisé."
  },
  {
    icon: FileText,
    title: "Facturation automatisée",
    description: "Générez vos factures automatiquement et suivez vos paiements en temps réel."
  },
  {
    icon: BarChart3,
    title: "Tableaux de bord",
    description: "Analysez votre activité avec des statistiques détaillées et des graphiques intuitifs."
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "Automatisez vos tâches administratives et concentrez-vous sur vos patients."
  },
  {
    icon: Shield,
    title: "Sécurité RGPD",
    description: "Vos données et celles de vos patients sont protégées selon les normes européennes."
  }
];

const testimonials = [
  {
    name: "Dr. Sophie Martin",
    role: "Ostéopathe à Paris",
    content: "Cette solution a révolutionné ma pratique. Je gagne 2h par jour sur l'administratif !",
    rating: 5,
    avatar: "SM"
  },
  {
    name: "Jean-Pierre Dubois",
    role: "Cabinet multi-praticiens Lyon",
    content: "Parfait pour gérer notre cabinet à plusieurs. L'interface est intuitive et moderne.",
    rating: 5,
    avatar: "JPD"
  },
  {
    name: "Dr. Marie Lefevre",
    role: "Ostéopathe libérale",
    content: "Le rapport qualité-prix est excellent. Je recommande vivement !",
    rating: 5,
    avatar: "ML"
  }
];

const faqs = [
  {
    question: "Comment commencer avec PatientHub ?",
    answer: "Il suffit de créer votre compte gratuit, configurer votre profil d'ostéopathe et commencer à ajouter vos patients. Notre interface intuitive vous guide pas à pas."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Absolument. Nous utilisons un chiffrement de niveau bancaire et sommes conformes au RGPD. Vos données sont hébergées sur des serveurs européens sécurisés."
  },
  {
    question: "Puis-je importer mes données existantes ?",
    answer: "Oui, nous proposons des outils d'import pour migrer facilement vos données depuis d'autres logiciels ou fichiers Excel."
  },
  {
    question: "Y a-t-il une période d'essai ?",
    answer: "Oui, vous pouvez tester gratuitement toutes les fonctionnalités pendant 14 jours, sans engagement."
  },
  {
    question: "Le support client est-il inclus ?",
    answer: "Bien sûr ! Notre équipe de support francophone est disponible par email et chat pour vous accompagner."
  }
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirection avec useNavigate au lieu de window.location.href
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PatientHub
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Tarifs
              </a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Témoignages
              </a>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Connexion
              </Link>
              <Button asChild>
                <Link to="/register">Essai gratuit</Link>
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border/40 py-4">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Fonctionnalités
                </a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tarifs
                </a>
                <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                  Témoignages
                </a>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Connexion
                </Link>
                <Button asChild className="w-fit">
                  <Link to="/register">Essai gratuit</Link>
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left">
              <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
                <Stethoscope className="w-3 h-3 mr-1" />
                Solution tout-en-un pour professionnels de santé
              </Badge>
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-500 dark:via-purple-500 dark:to-purple-500">
                  PatientHub
                </h1>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
                Gérez vos patients avec simplicité
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Dossiers patients, rendez-vous, facturation, statistiques... Tout ce dont vous avez besoin 
                pour développer votre pratique et gagner du temps au quotidien.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25" asChild>
                  <Link to="/register">Commencer gratuitement</Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 border-primary/30 hover:bg-primary/5" asChild>
                  <Link to="/demo">Voir la démo</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                ✨ Essai gratuit 14 jours • Sans engagement • Support francophone
              </p>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20">
                <img 
                  src={dashboardHero} 
                  alt="Interface PatientHub - Tableau de bord"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium">En ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une solution complète conçue pour les professionnels de santé modernes
            </p>
          </div>
          
          {/* Feature Grid with Images */}
          <div className="grid lg:grid-cols-2 gap-16 mb-16">
            {/* Calendar Feature */}
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/2">
                <img 
                  src={calendarFeature} 
                  alt="Calendrier PatientHub"
                  className="rounded-xl shadow-lg shadow-primary/10"
                />
              </div>
              <div className="lg:w-1/2">
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-3">Calendrier intelligent</h3>
                <p className="text-muted-foreground mb-4">
                  Planifiez et gérez vos consultations avec un calendrier moderne et intuitif. 
                  Synchronisation automatique et rappels inclus.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Synchronisation multi-appareils</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Rappels automatiques SMS/Email</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Team Feature */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8">
              <div className="lg:w-1/2">
                <img 
                  src={medicalTeam} 
                  alt="Équipe médicale PatientHub"
                  className="rounded-xl shadow-lg shadow-primary/10"
                />
              </div>
              <div className="lg:w-1/2">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-3">Collaboration d'équipe</h3>
                <p className="text-muted-foreground mb-4">
                  Travaillez en équipe avec vos collègues. Partagez les dossiers patients 
                  et collaborez efficacement.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Gestion multi-praticiens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">Partage sécurisé des données</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 hover:border-primary/30">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Des tarifs transparents
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choisissez l'offre qui correspond à vos besoins. Évolutif selon votre croissance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Plan Gratuit */}
            <Card className="relative border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">Gratuit</h3>
                <p className="text-muted-foreground mb-4">Pour découvrir</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">0€</span>
                  <span className="text-muted-foreground">/mois</span>
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
                <h3 className="text-2xl font-bold mb-2">Essentiel</h3>
                <p className="text-muted-foreground mb-4">Pour les praticiens indépendants</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">9€</span>
                  <span className="text-muted-foreground">/mois</span>
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
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md">Populaire</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-muted-foreground mb-4">Le plus populaire</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">16€</span>
                  <span className="text-muted-foreground">/mois</span>
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
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">Enterprise</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <p className="text-muted-foreground mb-4">Pour les gros cabinets</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">34€</span>
                  <span className="text-muted-foreground">/mois</span>
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
      <section id="testimonials" className="py-20 bg-gradient-to-b from-muted/30 to-background">
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
              <Card key={index} className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
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
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Prêt à transformer votre pratique ?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de professionnels de santé qui ont déjà choisi PatientHub
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <Link to="/register">Commencer maintenant</Link>
          </Button>
          <p className="text-primary-foreground/80 mt-4">
            Essai gratuit 14 jours • Configuration en 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary to-accent rounded-lg flex items-center justify-center shadow-md">
                  <Heart className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">PatientHub</span>
              </div>
              <p className="text-muted-foreground">
                La solution complète pour gérer vos patients et votre pratique médicale.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Tarifs</a></li>
                <li><Link to="/demo" className="hover:text-foreground transition-colors">Démo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Centre d'aide</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">CGU</Link></li>
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