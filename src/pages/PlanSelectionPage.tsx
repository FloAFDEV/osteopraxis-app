/**
 * Page de sélection du plan tarifaire
 * Affichée lors de l'inscription ou accessible depuis les paramètres
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PlanSelectionCard } from '@/components/plans/PlanSelectionCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PlanSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'light' | 'full' | 'pro' | null>(null);

  const handlePlanSelection = async (plan: 'light' | 'full' | 'pro') => {
    if (!user?.id) {
      toast.error('Utilisateur non authentifié');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    try {
      const { error } = await supabase
        .from('Osteopath')
        .update({ plan })
        .or(`authId.eq.${user.id},userId.eq.${user.id}`);

      if (error) throw error;

      toast.success(`Plan ${plan === 'light' ? 'Light' : plan === 'full' ? 'Full' : 'Pro'} activé avec succès !`);
      
      // Rediriger vers le dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('Erreur changement de plan:', error);
      toast.error('Erreur lors du changement de plan');
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      planType: 'light' as const,
      title: 'Light',
      description: 'Parfait pour démarrer avec la gestion essentielle de vos patients',
      price: 'Gratuit',
      priceDetail: 'toujours',
      features: [
        { name: 'Gestion illimitée des patients', included: true },
        { name: 'Fiches détaillées avec anamnèse complète', included: true },
        { name: 'Export PDF des fiches patients', included: true },
        { name: 'Import CSV de patients', included: true },
        { name: 'Stockage local sécurisé HDS', included: true },
        { name: 'Gestion des rendez-vous et planning', included: false },
        { name: 'Facturation et devis', included: false },
        { name: 'Gestion multi-cabinets', included: false },
      ],
    },
    {
      planType: 'full' as const,
      title: 'Full',
      description: 'Tout ce dont vous avez besoin pour gérer votre pratique professionnelle',
      price: '19€',
      priceDetail: '/mois',
      features: [
        { name: 'Toutes les fonctionnalités Light', included: true },
        { name: 'Agenda intégré avec rappels automatiques', included: true },
        { name: 'Facturation professionnelle avec TVA', included: true },
        { name: 'Planning hebdomadaire intelligent', included: true },
        { name: 'Statistiques et tableaux de bord', included: true },
        { name: 'Gestion multi-cabinets', included: true },
        { name: 'Support prioritaire', included: true },
        { name: 'Gestion d\'équipe (à venir)', included: false },
      ],
      isPopular: true,
    },
    {
      planType: 'pro' as const,
      title: 'Pro',
      description: 'Pour les équipes et cabinets avec plusieurs praticiens',
      price: '49€',
      priceDetail: '/mois',
      features: [
        { name: 'Toutes les fonctionnalités Full', included: true },
        { name: 'Gestion d\'équipe avec permissions', included: true },
        { name: 'Remplacements entre ostéopathes', included: true },
        { name: 'Synchronisation multi-praticiens', included: true },
        { name: 'Analytics avancées', included: true },
        { name: 'API personnalisée', included: true },
        { name: 'Support premium 24/7', included: true },
        { name: 'Formation incluse', included: true },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Choisissez votre plan - PatientHub</title>
        <meta name="description" content="Sélectionnez le plan qui correspond le mieux à vos besoins professionnels" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">
                Choisissez le plan qui vous correspond
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Commencez gratuitement avec le plan Light, ou accédez immédiatement à toutes les fonctionnalités
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {plans.map((plan) => (
                <PlanSelectionCard
                  key={plan.planType}
                  {...plan}
                  onSelect={() => handlePlanSelection(plan.planType)}
                  loading={loading && selectedPlan === plan.planType}
                />
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>🔒 Stockage local sécurisé conforme HDS inclus dans tous les plans</p>
              <p className="mt-2">Vous pouvez changer de plan à tout moment depuis vos paramètres</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
