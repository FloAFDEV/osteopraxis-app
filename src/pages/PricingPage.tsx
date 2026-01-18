import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, X } from "lucide-react";
import { Layout } from "@/components/ui/layout";

const PricingPage = () => {
  const navigate = useNavigate();

  const features = [
    { name: "Patients illimités", included: true },
    { name: "Rendez-vous illimités", included: true },
    { name: "Facturation illimitée", included: true },
    { name: "Planning intelligent", included: true },
    { name: "Export PDF", included: true },
    { name: "Stockage sécurisé (HDS)", included: true },
    { name: "Support prioritaire", included: true },
    { name: "Mises à jour incluses", included: true },
  ];

  const demoLimits = [
    { name: "Durée", demo: "30 min", pro: "Illimitée" },
    { name: "Patients", demo: "3 max", pro: "Illimités" },
    { name: "RDV", demo: "2 max", pro: "Illimités" },
    { name: "Factures", demo: "1 max", pro: "Illimitées" },
    { name: "Sauvegarde", demo: "❌", pro: "✅" },
    { name: "Export PDF", demo: "❌", pro: "✅" },
  ];

  const faqs = [
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, vous pouvez annuler votre abonnement à tout moment, sans frais ni engagement. Vous conservez l'accès jusqu'à la fin de votre période de facturation."
    },
    {
      q: "Mes données sont-elles sécurisées ?",
      a: "Oui, toutes vos données sont stockées localement sur votre ordinateur avec un chiffrement AES-256-GCM. Elles ne quittent jamais votre machine, conformité HDS garantie."
    },
    {
      q: "Y a-t-il une période d'essai ?",
      a: "Oui, vous pouvez tester gratuitement pendant 30 minutes avec la démo. Accès immédiat, aucune inscription requise."
    },
    {
      q: "Comment fonctionne le paiement ?",
      a: "Le paiement est sécurisé via Stripe. Vous payez 49€/mois par prélèvement automatique. Vous recevez une facture chaque mois."
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Une offre simple et transparente</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un seul plan, toutes les fonctionnalités. Pas de surprises, pas de frais cachés.
            </p>
          </div>

          {/* Plan unique */}
          <div className="max-w-2xl mx-auto mb-16">
            <Card className="relative border-2 border-purple-500 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Cabinet Pro
                </div>
              </div>

              <CardHeader className="text-center pt-12">
                <div className="mb-4">
                  <div className="text-6xl font-bold">49€</div>
                  <div className="text-2xl text-muted-foreground">/mois</div>
                </div>
                <p className="text-lg text-muted-foreground">
                  Tout ce dont vous avez besoin pour gérer votre cabinet
                </p>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Features list */}
                <div className="space-y-3">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-base">{feature.name}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                  onClick={() => navigate('/payment')}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Commencer maintenant
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Sans engagement • Annulable à tout moment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison table */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Démo vs Cabinet Pro</h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Fonctionnalité</th>
                      <th className="text-center p-4 font-semibold">Démo</th>
                      <th className="text-center p-4 font-semibold bg-purple-50 dark:bg-purple-900/20">Cabinet Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoLimits.map((item, index) => (
                      <tr key={item.name} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="p-4">{item.name}</td>
                        <td className="p-4 text-center text-muted-foreground">{item.demo}</td>
                        <td className="p-4 text-center font-medium bg-purple-50 dark:bg-purple-900/20">{item.pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Questions fréquentes</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.q}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
