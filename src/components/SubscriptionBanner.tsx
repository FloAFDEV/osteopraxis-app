
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

interface SubscriptionBannerProps {
  action?: 'create_patient' | 'create_cabinet' | 'access_invoices' | 'access_advanced_stats' | 'export_data';
  feature?: string;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ 
  action, 
  feature 
}) => {
  const navigate = useNavigate();
  const { subscription_tier, features, max_patients, max_cabinets } = useSubscriptionLimits();

  if (subscription_tier !== 'Gratuit') {
    return null;
  }

  const getLimitMessage = () => {
    switch (action) {
      case 'create_patient':
        return `Vous avez atteint la limite de ${max_patients} patients du plan gratuit.`;
      case 'create_cabinet':
        return `Vous avez atteint la limite de ${max_cabinets} cabinet du plan gratuit.`;
      case 'access_invoices':
        return 'La facturation n\'est pas disponible dans le plan gratuit.';
      case 'access_advanced_stats':
        return 'Les statistiques avancées ne sont pas disponibles dans le plan gratuit.';
      case 'export_data':
        return 'L\'export de données n\'est pas disponible dans le plan gratuit.';
      default:
        return feature ? 
          `${feature} n'est pas disponible dans le plan gratuit.` :
          'Cette fonctionnalité nécessite un abonnement payant.';
    }
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800">
          {getLimitMessage()}
        </span>
        <Button 
          size="sm" 
          onClick={() => navigate('/pricing')}
          className="ml-4 flex items-center gap-2"
        >
          <Crown className="h-4 w-4" />
          Passer au premium
        </Button>
      </AlertDescription>
    </Alert>
  );
};
