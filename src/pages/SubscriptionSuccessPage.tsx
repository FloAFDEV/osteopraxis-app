
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/ui/layout';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription } = useSubscription();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Refresh subscription status after successful payment
      setTimeout(() => {
        refreshSubscription();
      }, 2000);
      
      toast.success('Abonnement activé avec succès !');
    }
  }, [sessionId, refreshSubscription]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">
                Abonnement activé !
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Félicitations ! Votre abonnement a été activé avec succès. 
                Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Prochaines étapes :</h3>
                <ul className="text-left space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Explorez votre tableau de bord mis à jour</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Créez vos premiers patients et cabinets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Configurez la facturation</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2"
                >
                  Aller au tableau de bord
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/pricing')}
                >
                  Voir les détails de mon plan
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                Vous recevrez un email de confirmation avec les détails de votre abonnement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionSuccessPage;
