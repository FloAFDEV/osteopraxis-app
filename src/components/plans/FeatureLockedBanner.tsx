/**
 * Bannière affichée pour indiquer qu'une fonctionnalité est verrouillée
 */

import { Lock, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FeatureLockedBannerProps {
  featureName: string;
  description: string;
  className?: string;
}

export const FeatureLockedBanner = ({ featureName, description, className }: FeatureLockedBannerProps) => {
  const navigate = useNavigate();

  return (
    <Alert className={className}>
      <Lock className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">
        {featureName} - Plan Full requis
      </AlertTitle>
      <AlertDescription>
        <p className="mb-4">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/plan-selection')}
            className="flex-1"
          >
            Découvrir le plan Full
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Retour au dashboard
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
