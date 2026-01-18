import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, TrendingUp, Database, Activity } from "lucide-react";
import { toast } from "sonner";
import { ROICalculator } from "@/components/plans/ROICalculator";

const PricingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: "Gratuit",
      price: 0,
      description: "Pour débuter",
      features: [
        "Jusqu'à 50 patients",
        "1 cabinet",
        "1 praticien",
        "Gestion des RDV",
        "Dossier médical basique",
        "Optimisation automatique"
      ],
      icon: Zap,
      badge: null,
      disabled: false
    },
    {
      name: "Essentiel",
      price: 9,
      description: "Pour les praticiens indépendants",
      features: [
        "Jusqu'à 500 patients",
        "1 cabinet",
        "1 praticien",
        "Tout Gratuit +",
        "Facturation",
        "Export comptable PDF",
        "Optimisations avancées"
      ],
      icon: Star,
      badge: null,
      disabled: false
    },
    {
      name: "Pro",
      price: 16,
      description: "Le plus populaire",
      features: [
        "Jusqu'à 1000 patients",
        "2 cabinets",
        "2 praticiens",
        "Tout Essentiel +",
        "Statistiques avancées",
        "Support prioritaire",
        "Monitoring proactif"
      ],
      icon: Crown,
      badge: "Populaire",
      disabled: false
    },
    {
      name: "Premium",
      price: 34,
      description: "Pour les gros cabinets",
      features: [
        "Jusqu'à 3000 patients",
        "5 cabinets",
        "Praticiens illimités",
        "Tout Pro +",
        "Partage multi-praticiens",
        "Accès API",
        "Interface admin complète"
      ],
      icon: Crown,
      badge: "Enterprise",
      disabled: false
    }
  ];

  const addOns = [
    { name: "+500 patients", price: 4 },
    { name: "+1 cabinet", price: 5 },
    { name: "+1 praticien", price: 6 }
  ];

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (planName === "Gratuit") {
      toast.info("Vous êtes déjà sur le plan gratuit");
      return;
    }

    setLoading(planName);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planName }
      });

      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error("Erreur lors de la création du checkout");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tarifs transparents</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. Vous pouvez changer à tout moment.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card key={plan.name} className={`relative ${plan.badge === "Populaire" ? "border-primary scale-105" : ""}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant={plan.badge === "Populaire" ? "default" : "secondary"}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {plan.price}€
                    <span className="text-sm text-muted-foreground">/mois</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.badge === "Populaire" ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={loading === plan.name || plan.disabled}
                  >
                    {loading === plan.name ? "Chargement..." : 
                     plan.price === 0 ? "Plan actuel" : "S'abonner"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Add-ons */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Options supplémentaires</h2>
          <Card>
            <CardHeader>
              <CardTitle>Extensions disponibles</CardTitle>
              <CardDescription>
                Dépassez les limites de votre plan avec ces options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {addOns.map((addon) => (
                  <div key={addon.name} className="flex justify-between items-center p-3 border rounded-lg">
                    <span>{addon.name}</span>
                    <span className="font-semibold">{addon.price}€/mois</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI Calculator Section */}
        <div className="max-w-5xl mx-auto my-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Calculez votre retour sur investissement</h2>
            <p className="text-muted-foreground">
              Découvrez combien vous pourriez économiser et gagner avec OstéoPraxis
            </p>
          </div>
          <ROICalculator />
        </div>

        {/* Performance Features */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Fonctionnalités d'optimisation incluses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Optimisation temps réel</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ajustements automatiques des performances pour une expérience fluide
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Nettoyage automatique</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Maintenance préventive et optimisation de la base de données
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Monitoring proactif</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Surveillance continue avec alertes et recommandations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>Essai gratuit de 14 jours • Aucun engagement • Support inclus</p>
          <p className="mt-2">
            Des questions ? <Button variant="link" onClick={() => navigate('/contact')} className="p-0">Contactez-nous</Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;