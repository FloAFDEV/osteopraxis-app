/**
 * 🎯 SmartUpgradeBanner - Bannière d'upgrade intelligente
 * 
 * Affiche une bannière personnalisée selon:
 * - Le nombre de tentatives d'accès à la fonctionnalité
 * - Le plan actuel de l'utilisateur
 * - La fonctionnalité bloquée
 */

import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartUpgradeBannerProps {
  feature: 'appointments' | 'invoices' | 'schedule' | 'team' | 'analytics';
  currentPlan?: 'light' | 'full' | 'pro';
}

const FEATURE_MESSAGES = {
  appointments: {
    title: 'Gestion des rendez-vous',
    benefit: 'Planifiez et gérez tous vos rendez-vous en un clic',
    timeGain: '5h/semaine',
  },
  invoices: {
    title: 'Facturation automatique',
    benefit: 'Créez vos notes d\'honoraires en 30 secondes',
    timeGain: '3h/semaine',
  },
  schedule: {
    title: 'Planning hebdomadaire',
    benefit: 'Visualisez votre semaine et optimisez vos créneaux',
    timeGain: '2h/semaine',
  },
  team: {
    title: 'Gestion d\'équipe collaborative',
    benefit: 'Coordonnez votre équipe et partagez les patients',
    timeGain: '8h/semaine',
  },
  analytics: {
    title: 'Analytics avancées',
    benefit: 'Analysez votre activité et optimisez vos revenus',
    timeGain: '4h/semaine',
  },
};

const PLAN_PRICES = {
  full: '19',
  pro: '49',
};

export function SmartUpgradeBanner({ feature, currentPlan = 'light' }: SmartUpgradeBannerProps) {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const featureInfo = FEATURE_MESSAGES[feature];
  const suggestedPlan = feature === 'team' || feature === 'analytics' ? 'pro' : 'full';
  const price = PLAN_PRICES[suggestedPlan];

  useEffect(() => {
    const key = `upgrade-attempts-${feature}`;
    const count = parseInt(localStorage.getItem(key) || '0');
    setAttempts(count);
  }, [feature]);

  const urgencyLevel = attempts >= 5 ? 'high' : attempts >= 3 ? 'medium' : 'low';

  return (
    <Alert 
      className={`
        border-2 max-w-2xl mx-auto my-6
        ${urgencyLevel === 'high' ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-red-50' : ''}
        ${urgencyLevel === 'medium' ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50' : ''}
        ${urgencyLevel === 'low' ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50' : ''}
      `}
    >
      <Crown className="h-6 w-6 text-amber-600" />
      <AlertTitle className="text-xl font-bold mb-3">
        {urgencyLevel === 'high' && <span className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          Vous perdez du temps ! ({attempts} tentatives)
        </span>}
        {urgencyLevel === 'medium' && <span className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-600" />
          Débloquez {featureInfo.title}
        </span>}
        {urgencyLevel === 'low' && <span className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Découvrez {featureInfo.title}
        </span>}
      </AlertTitle>
      
      <AlertDescription className="space-y-4">
        {urgencyLevel === 'high' && (
          <div className="p-4 bg-orange-100 border-2 border-orange-400 rounded-lg">
            <p className="font-bold text-orange-900 mb-2">
              ⚡ Vous avez essayé {attempts} fois d'accéder à cette fonctionnalité !
            </p>
            <p className="text-sm text-orange-800">
              En passant au plan {suggestedPlan.toUpperCase()}, vous économiseriez <strong>{featureInfo.timeGain}</strong> et <strong>€{parseInt(price) * 2}/mois</strong> en productivité !
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-muted-foreground">
            <strong className="text-foreground">{featureInfo.benefit}</strong>
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Temps économisé : <strong>{featureInfo.timeGain}</strong>
          </p>
        </div>

        {attempts >= 3 && (
          <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg">
            <p className="text-sm font-semibold text-amber-900">
              💡 Offre spéciale : Passez au plan {suggestedPlan.toUpperCase()} dès maintenant et bénéficiez de 30 jours d'essai gratuits !
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button 
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold"
            size="lg"
          >
            <Crown className="h-4 w-4 mr-2" />
            Passer au plan {suggestedPlan.toUpperCase()} ({price}€/mois)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Plus tard
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          ✨ Garantie satisfait ou remboursé 30 jours
        </p>
      </AlertDescription>
    </Alert>
  );
}
