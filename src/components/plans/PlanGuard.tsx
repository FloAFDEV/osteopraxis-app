/**
 * 🛡️ PlanGuard - Composant de protection d'accès selon le plan d'abonnement
 * 
 * Bloque l'accès aux fonctionnalités selon le plan de l'ostéopathe:
 * - Light: patients uniquement
 * - Full: patients + rendez-vous + facturation + planning
 * - Pro: Full + gestion d'équipe + analytics avancées
 */

import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Osteopath } from '@/types';

interface PlanGuardProps {
  children: ReactNode;
  feature: 'appointments' | 'invoices' | 'schedule' | 'team' | 'analytics';
}

const FEATURE_REQUIREMENTS = {
  appointments: ['full', 'pro'],
  invoices: ['full', 'pro'],
  schedule: ['full', 'pro'],
  team: ['pro'],
  analytics: ['pro']
} as const;

const FEATURE_NAMES = {
  appointments: 'Gestion des rendez-vous',
  invoices: 'Facturation',
  schedule: 'Planning hebdomadaire',
  team: 'Gestion d\'équipe',
  analytics: 'Analytics avancées'
} as const;

const PLAN_NAMES = {
  light: 'Light',
  full: 'Full',
  pro: 'Pro'
} as const;

export function PlanGuard({ children, feature }: PlanGuardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const loadOsteopath = async () => {
      if (!user?.osteopathId) {
        setIsLoading(false);
        return;
      }

      try {
        const osteopathData = await api.getOsteopathById(user.osteopathId);
        setOsteopath(osteopathData);
      } catch (error) {
        console.error('Erreur chargement ostéopathe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOsteopath();
  }, [user]);

  useEffect(() => {
    // Compter les tentatives d'accès pour afficher un message personnalisé
    const key = `upgrade-attempts-${feature}`;
    const count = parseInt(localStorage.getItem(key) || '0');
    setAttempts(count + 1);
    localStorage.setItem(key, (count + 1).toString());
  }, [feature]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a le plan requis
  const requiredPlans = FEATURE_REQUIREMENTS[feature];
  const currentPlan = osteopath?.plan || 'light';
  const hasAccess = requiredPlans.includes(currentPlan as any);

  if (!hasAccess) {
    // Bloquer l'accès et afficher bannière d'upgrade
    const suggestedPlan = feature === 'team' || feature === 'analytics' ? 'Pro' : 'Full';
    const pricing = suggestedPlan === 'Pro' ? '49€/mois' : '19€/mois';

    // Toast de blocage
    toast.error(`Fonctionnalité réservée au plan ${suggestedPlan}`, {
      description: `Passez au plan ${suggestedPlan} pour débloquer ${FEATURE_NAMES[feature]}`,
      duration: 5000,
    });

    return (
      <div className="container mx-auto py-10 px-4">
        <Alert className="border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 max-w-2xl mx-auto">
          <Crown className="h-6 w-6 text-amber-600" />
          <AlertTitle className="text-xl font-bold mb-2">
            Débloquez {FEATURE_NAMES[feature]} avec le plan {suggestedPlan}
          </AlertTitle>
          <AlertDescription className="space-y-4">
            {attempts >= 3 && (
              <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg">
                <p className="text-sm text-amber-900 font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Vous avez essayé {attempts} fois - Passez au plan {suggestedPlan} pour gagner du temps !
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Vous êtes actuellement sur le plan <strong className="text-foreground">{PLAN_NAMES[currentPlan]}</strong>.
              </p>
              <p className="text-muted-foreground">
                Pour accéder à <strong className="text-foreground">{FEATURE_NAMES[feature]}</strong>, 
                passez au plan <strong className="text-amber-700">{suggestedPlan}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Crown className="h-4 w-4 mr-2" />
                Voir les tarifs ({pricing})
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Retour
              </Button>
            </div>

            <div className="text-xs text-muted-foreground pt-2">
              💡 Le plan {suggestedPlan} inclut également de nombreuses autres fonctionnalités premium
            </div>
          </AlertDescription>
        </Alert>

        {/* Affichage visuel de verrouillage */}
        <div className="max-w-2xl mx-auto mt-8 p-8 border-2 border-dashed border-muted rounded-lg bg-muted/20 flex flex-col items-center justify-center text-center space-y-4">
          <Lock className="h-16 w-16 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            Contenu verrouillé
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Cette fonctionnalité est disponible dans le plan {suggestedPlan}. 
            Mettez à niveau votre abonnement pour y accéder.
          </p>
        </div>
      </div>
    );
  }

  // Accès autorisé
  return <>{children}</>;
}
