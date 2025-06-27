
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { Layout } from '@/components/ui/layout';

const PricingPage = () => {
  const { user } = useAuth();
  const { subscription_tier } = useSubscription();
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'gratuit',
      name: 'Gratuit',
      description: 'Parfait pour débuter',
      icon: <Zap className="h-6 w-6" />,
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxPatients: 5,
      maxCabinets: 1,
      features: [
        'Jusqu\'à 5 patients',
        '1 cabinet',
        'Gestion des rendez-vous',
        'Fiches patients de base',
        'Support email'
      ],
      limitations: [
        'Pas de facturation',
        'Pas de statistiques avancées',
        'Pas d\'export de données'
      ],
      current: subscription_tier === 'Gratuit',
      popular: false,
    },
    {
      id: 'professionnel',
      name: 'Professionnel',
      description: 'Pour les ostéopathes établis',
      icon: <Crown className="h-6 w-6" />,
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      maxPatients: 100,
      maxCabinets: 3,
      features: [
        'Jusqu\'à 100 patients',
        '3 cabinets',
        'Gestion des rendez-vous avancée',
        'Facturation complète',
        'Statistiques avancées',
        'Export des données',
        'Support prioritaire'
      ],
      current: subscription_tier === 'Professionnel',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Pour les cabinets multi-praticiens',
      icon: <Star className="h-6 w-6" />,
      monthlyPrice: 59.99,
      yearlyPrice: 599.99,
      maxPatients: 500,
      maxCabinets: 10,
      features: [
        'Jusqu\'à 500 patients',
        '10 cabinets',
        'Multi-ostéopathes',
        'Gestion avancée des remplacements',
        'Toutes les fonctionnalités Pro',
        'API d\'intégration',
        'Support dédié 24/7'
      ],
      current: subscription_tier === 'Premium',
      popular: false,
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }

    if (planId === 'gratuit') {
      toast.info('Vous êtes déjà sur le plan gratuit');
      return;
    }

    try {
      setLoading(planId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          planId,
          billingCycle: isYearly ? 'yearly' : 'monthly'
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erreur lors de la création du checkout');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erreur lors de l\'ouverture du portail client');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Choisissez votre plan</h1>
          <p className="text-xl text-gray-600 mb-6">
            Sélectionnez le plan qui correspond le mieux à vos besoins
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={!isYearly ? 'font-semibold' : 'text-gray-500'}>
              Mensuel
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={isYearly ? 'font-semibold' : 'text-gray-500'}>
              Annuel
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                2 mois gratuits
              </Badge>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const monthlyEquivalent = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''} ${plan.current ? 'border-green-500' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Plus populaire
                  </Badge>
                )}
                {plan.current && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                    Plan actuel
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      {price === 0 ? 'Gratuit' : `${monthlyEquivalent.toFixed(2)}€`}
                    </div>
                    {price > 0 && (
                      <div className="text-sm text-gray-500">
                        {isYearly ? `${price}€ par an` : 'par mois'}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Inclus :</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">Limitations :</h4>
                        <ul className="space-y-1">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="text-sm text-red-600">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-4">
                      {plan.current ? (
                        <div className="space-y-2">
                          <Button className="w-full" disabled>
                            Plan actuel
                          </Button>
                          {plan.id !== 'gratuit' && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={handleManageSubscription}
                            >
                              Gérer l'abonnement
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={loading === plan.id}
                        >
                          {loading === plan.id ? 'Chargement...' : 
                           plan.id === 'gratuit' ? 'Plan actuel' : 'Choisir ce plan'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Des questions sur nos plans ? Contactez-nous pour plus d'informations.
          </p>
          <Button variant="outline">
            Contacter le support
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
