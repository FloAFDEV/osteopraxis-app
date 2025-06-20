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
            <CardTitle className="text-3xl font-bold">Politique de Confidentialité – AFDEV</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                  <p>
                    La protection de vos données personnelles est une priorité pour AFDEV. Cette politique de confidentialité décrit comment nous collectons, utilisons et sécurisons vos informations dans le cadre de l'utilisation de notre plateforme destinée aux professionnels de santé.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Collecte des Données</h2>
                  <p>
                    AFDEV collecte les données que vous nous fournissez directement, telles que vos informations professionnelles ainsi que les données relatives à vos patients. Ces données sont nécessaires au bon fonctionnement du service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Utilisation des Données</h2>
                  <p>
                    Les données sont utilisées uniquement dans le cadre des finalités suivantes :
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Gestion des dossiers patients et des rendez-vous</li>
                    <li>Accès sécurisé à votre compte et vos données</li>
                    <li>Amélioration continue de la plateforme</li>
                    <li>Envoi d’informations importantes relatives au service</li>
                    <li>Respect des obligations légales et réglementaires</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Protection des Données Médicales</h2>
                  <p>
                    AFDEV applique des mesures techniques et organisationnelles rigoureuses afin d’assurer la confidentialité et la sécurité des données de santé, conformément au RGPD et aux exigences du secteur médical.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Conservation des Données</h2>
                  <p>
                    Les données sont conservées uniquement pendant la durée nécessaire à la fourniture du service ou pour répondre aux obligations légales. Vous pouvez à tout moment demander leur suppression, sauf si une obligation légale impose leur conservation.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Partage des Données</h2>
                  <p>
                    AFDEV ne partage pas vos données personnelles ou professionnelles avec des tiers, sauf :
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>En cas de consentement explicite de votre part</li>
                    <li>Pour répondre à une obligation légale</li>
                    <li>Avec des prestataires sous contrat pour assurer des services techniques (hébergement, sauvegarde, etc.), soumis à des clauses de confidentialité strictes</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Vos Droits</h2>
                  <p>
                    Conformément au RGPD, vous disposez des droits suivants :
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Droit d’accès à vos données</li>
                    <li>Droit de rectification</li>
                    <li>Droit à l’effacement (droit à l’oubli)</li>
                    <li>Droit à la limitation du traitement</li>
                    <li>Droit à la portabilité</li>
                    <li>Droit d’opposition</li>
                  </ul>
                  <p className="mt-2">
                    Pour exercer ces droits, contactez notre délégué à la protection des données à l’adresse : <a href="mailto:dpo@afdev.fr" className="underline">dpo@afdev.fr</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Sécurité des Données</h2>
                  <p>
                    AFDEV applique des mesures de sécurité robustes afin de prévenir tout accès non autorisé, perte, altération ou divulgation de vos données. Cela inclut notamment le chiffrement, les contrôles d’accès et les sauvegardes régulières.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Modifications de la Politique</h2>
                  <p>
                    Cette politique de confidentialité peut être mise à jour pour refléter les évolutions légales ou fonctionnelles. En cas de changement important, AFDEV vous en informera via la plateforme ou par e-mail.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
                  <p>
                    Pour toute question relative à cette politique ou à vos données, contactez-nous à l’adresse suivante : <a href="mailto:privacy@afdev.fr" className="underline">privacy@afdev.fr</a>.
                  </p>
                </section>

                <p className="text-sm text-gray-500 pt-6">
                  Dernière mise à jour : 8 avril 2025
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
