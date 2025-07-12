import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Users, FileText, BarChart3 } from "lucide-react";
export default function DemoPage() {
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="text-xl font-bold">PatientHub</span>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Découvrez PatientHub en action</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explorez toutes les fonctionnalités de notre solution à travers cette démonstration interactive
          </p>
        </div>

        {/* Demo Sections */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <Calendar className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold">Gestion des rendez-vous</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Capture d'écran du calendrier</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Planifiez vos consultations avec un calendrier intuitif. Gérez les créneaux, 
                les récurrences et recevez des notifications automatiques.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <Users className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold">Dossiers patients</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Capture d'écran des dossiers</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Centralisez toutes les informations médicales de vos patients. 
                Historique des consultations, notes, examens cliniques.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <FileText className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold">Facturation</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Capture d'écran de la facturation</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Générez vos factures automatiquement après chaque consultation. 
                Suivi des paiements et export comptable inclus.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <BarChart3 className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold">Statistiques</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <div className="h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Capture d'écran des statistiques</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Analysez votre activité avec des tableaux de bord détaillés. 
                Chiffre d'affaires, nombre de consultations, évolution mensuelle.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à tester vous-même ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Créez votre compte gratuit et découvrez toutes ces fonctionnalités
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">Commencer l'essai gratuit</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Demander une démonstration</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>;
}