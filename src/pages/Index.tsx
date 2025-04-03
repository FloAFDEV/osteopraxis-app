
import { Link } from "react-router-dom";
import { Calendar, Users, Clock, ArrowRight } from "lucide-react";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Rendez-vous Zen
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  Simplifiez la gestion de vos rendez-vous et accompagnez vos patients dans leur parcours de soin.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button size="lg" asChild>
                  <Link to="/appointments/new">
                    Nouveau rendez-vous
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/appointments">
                    Voir l&apos;agenda
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative mx-auto animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl rounded-full" />
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Zen wellness"
                className="relative mx-auto rounded-xl overflow-hidden max-w-full shadow-lg"
                width={550}
                height={310}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter">
              Ce que nous proposons
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Une solution complète pour la gestion de votre cabinet.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover-scale">
              <CardHeader className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Gestion des rendez-vous</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-muted-foreground">
                  Planifiez, modifiez et suivez vos rendez-vous facilement. Notre système vous permet de gérer efficacement votre emploi du temps.
                </p>
                <Link to="/appointments" className="flex items-center gap-1 mt-4 text-primary">
                  En savoir plus <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            <Card className="hover-scale">
              <CardHeader className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Dossiers patients</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-muted-foreground">
                  Accédez à un historique complet des patients, leurs informations personnelles, antécédents médicaux et traitements en cours.
                </p>
                <Link to="/patients" className="flex items-center gap-1 mt-4 text-primary">
                  En savoir plus <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            <Card className="hover-scale">
              <CardHeader className="p-6 text-center">
                <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
                <CardTitle>Planning optimisé</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-muted-foreground">
                  Visualisez votre planning quotidien, hebdomadaire ou mensuel. Notre interface intuitive vous aide à optimiser votre temps.
                </p>
                <Link to="/schedule" className="flex items-center gap-1 mt-4 text-primary">
                  En savoir plus <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="bg-accent/5 rounded-xl p-8 md:p-12">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Prêt à commencer ?</h2>
              <p className="text-muted-foreground">
                Rejoignez des milliers de professionnels qui optimisent déjà leur pratique quotidienne.
              </p>
            </div>
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link to="/appointments/new">
                  Créer un rendez-vous
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
