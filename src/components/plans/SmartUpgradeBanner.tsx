/**
 * Bannière d'upgrade professionnelle
 * 
 * Affiche une recommandation de plan basée sur:
 * - L'analyse d'utilisation
 * - Le plan actuel de l'utilisateur
 * - Les besoins métier identifiés
 */

import { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Clock, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartUpgradeBannerProps {
  feature: 'appointments' | 'invoices' | 'schedule' | 'team' | 'analytics';
  currentPlan?: 'light' | 'full' | 'pro';
}

const FEATURE_METADATA = {
  appointments: {
    title: 'Gestion des rendez-vous',
    benefit: 'Optimisez la planification et réduisez les rendez-vous manqués',
    timeGain: '5 heures par semaine',
    compliance: 'Historique conforme aux exigences de traçabilité',
  },
  invoices: {
    title: 'Facturation automatisée',
    benefit: 'Génération instantanée de notes d\'honoraires conformes',
    timeGain: '3 heures par semaine',
    compliance: 'Conformité fiscale et traçabilité comptable garanties',
  },
  schedule: {
    title: 'Planning hebdomadaire',
    benefit: 'Vue d\'ensemble pour optimiser vos créneaux de consultation',
    timeGain: '2 heures par semaine',
    compliance: 'Synchronisation sécurisée de vos disponibilités',
  },
  team: {
    title: 'Gestion d\'équipe collaborative',
    benefit: 'Coordination multi-praticiens et partage sécurisé des dossiers',
    timeGain: '8 heures par semaine',
    compliance: 'Gestion des droits d\'accès conforme au RGPD',
  },
  analytics: {
    title: 'Analyses décisionnelles',
    benefit: 'Indicateurs de performance pour piloter votre activité',
    timeGain: '4 heures par semaine',
    compliance: 'Tableaux de bord conformes aux exigences professionnelles',
  },
};

const PLAN_INFO = {
  full: {
    price: '19',
    name: 'Full',
    description: 'Gestion complète du cabinet',
  },
  pro: {
    price: '49',
    name: 'Pro',
    description: 'Collaboration et analytics avancées',
  },
};

export function SmartUpgradeBanner({ feature, currentPlan = 'light' }: SmartUpgradeBannerProps) {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const featureInfo = FEATURE_METADATA[feature];
  const suggestedPlan = feature === 'team' || feature === 'analytics' ? 'pro' : 'full';
  const planInfo = PLAN_INFO[suggestedPlan];

  useEffect(() => {
    const key = `upgrade-attempts-${feature}`;
    const count = parseInt(localStorage.getItem(key) || '0');
    setAttempts(count);
  }, [feature]);

  const showUrgency = attempts >= 3;

  return (
    <Alert className="border-2 max-w-2xl mx-auto my-6 bg-card">
      <Info className="h-5 w-5 text-primary" />
      <AlertTitle className="text-lg font-semibold mb-3">
        Fonctionnalité disponible en plan {planInfo.name}
      </AlertTitle>
      
      <AlertDescription className="space-y-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              {featureInfo.title}
            </h4>
            <p className="text-sm text-muted-foreground">
              {featureInfo.benefit}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Gain de productivité</p>
                <p className="text-sm font-semibold text-primary">{featureInfo.timeGain}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
              <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Conformité</p>
                <p className="text-xs text-muted-foreground">{featureInfo.compliance}</p>
              </div>
            </div>
          </div>
        </div>

        {showUrgency && (
          <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-start gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-sm font-semibold text-foreground">
                Analyse d'utilisation
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Vous avez tenté d'accéder à cette fonctionnalité {attempts} fois. 
              L'adoption du plan {planInfo.name} permettrait d'optimiser significativement 
              la gestion quotidienne de votre cabinet.
            </p>
          </div>
        )}

        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Plan {planInfo.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {planInfo.description}
              </p>
            </div>
            <Badge variant="secondary" className="text-base font-bold">
              {planInfo.price}€/mois
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/pricing')}
              className="flex-1"
              size="lg"
            >
              Comparer les plans
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Retour
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Garantie de remboursement sous 30 jours • Sans engagement de durée
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
