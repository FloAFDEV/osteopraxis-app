import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { Lock, Shield, CreditCard } from "lucide-react";
import { toast } from "sonner";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);

    // Simuler paiement Stripe réussi (mode test see-through)
    // En production : redirection vers Stripe Checkout
    setTimeout(() => {
      // Générer un faux session ID Stripe
      const stripeSessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;

      // Stocker en localStorage
      localStorage.setItem('stripe_session_id', stripeSessionId);

      toast.success("Paiement validé !");

      // Rediriger vers création de compte
      navigate('/register-post-payment');
    }, 2000);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Créez votre compte Cabinet Pro</h1>
            <p className="text-lg text-muted-foreground">
              Dernière étape avant de profiter de toutes les fonctionnalités
            </p>
          </div>

          {/* Order Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Récapitulatif de commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <div className="font-medium">Cabinet Pro</div>
                    <div className="text-sm text-muted-foreground">
                      Abonnement mensuel • Sans engagement
                    </div>
                  </div>
                  <div className="text-2xl font-bold">49€/mois</div>
                </div>

                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>49€/mois</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Le premier prélèvement aura lieu aujourd'hui. Vous pouvez annuler à tout moment.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment CTA */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement sécurisé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Mode test :</strong> Le paiement est simulé. En production, vous serez redirigé vers Stripe Checkout pour un paiement sécurisé.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full text-lg py-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Payer 49€/mois
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Votre paiement est sécurisé et chiffré
              </div>
            </CardContent>
          </Card>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Paiement sécurisé Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Données chiffrées</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;
