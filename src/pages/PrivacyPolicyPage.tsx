
import React from "react";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Politique de Confidentialité</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                  <p>
                    La protection de vos données personnelles est notre priorité. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Collecte des Données</h2>
                  <p>
                    Nous collectons des informations que vous nous fournissez directement, comme vos coordonnées professionnelles et les données de vos patients. Ces données sont essentielles pour le fonctionnement de notre service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Utilisation des Données</h2>
                  <p>
                    Nous utilisons vos données uniquement pour fournir et améliorer nos services, notamment pour:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Gérer les dossiers patients et les rendez-vous</li>
                    <li>Vous permettre d'accéder à votre compte et à vos données</li>
                    <li>Améliorer et optimiser notre plateforme</li>
                    <li>Vous informer des mises à jour importantes</li>
                    <li>Se conformer aux obligations légales</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Protection des Données Médicales</h2>
                  <p>
                    En tant que service destiné aux professionnels de santé, nous sommes particulièrement vigilants quant à la protection des données médicales. Nous mettons en œuvre des mesures de sécurité strictes conformes aux normes du secteur et aux exigences légales.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Conservation des Données</h2>
                  <p>
                    Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services ou conformément aux exigences légales. Vous pouvez demander la suppression de vos données à tout moment, sous réserve des obligations légales de conservation.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Partage des Données</h2>
                  <p>
                    Nous ne partageons pas vos données avec des tiers, sauf dans les cas suivants:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Avec votre consentement explicite</li>
                    <li>Pour se conformer à une obligation légale</li>
                    <li>Avec nos prestataires de services qui nous aident à fournir notre service (sous contrat de confidentialité)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Vos Droits</h2>
                  <p>
                    Conformément au RGPD et autres législations applicables, vous disposez des droits suivants:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Droit d'accès à vos données</li>
                    <li>Droit de rectification</li>
                    <li>Droit à l'effacement ("droit à l'oubli")</li>
                    <li>Droit à la limitation du traitement</li>
                    <li>Droit à la portabilité des données</li>
                    <li>Droit d'opposition</li>
                  </ul>
                  <p className="mt-2">
                    Pour exercer ces droits, contactez-nous à dpo@example.com.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Sécurité des Données</h2>
                  <p>
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'accès non autorisé, la divulgation, l'altération et la destruction.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Modifications de la Politique</h2>
                  <p>
                    Nous pouvons modifier cette politique de confidentialité à tout moment. Toute modification sera publiée sur cette page et, si les modifications sont significatives, nous vous en informerons directement.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
                  <p>
                    Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à privacy@example.com.
                  </p>
                </section>

                <p className="text-sm text-gray-500 pt-6">
                  Dernière mise à jour: 8 avril 2025
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;
