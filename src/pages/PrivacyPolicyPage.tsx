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
                    <li>Envoi d'informations importantes relatives au service</li>
                    <li>Respect des obligations légales et réglementaires</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Protection des Données Médicales</h2>
                  <p>
                    AFDEV applique des mesures techniques et organisationnelles rigoureuses afin d'assurer la confidentialité et la sécurité des données de santé, conformément au RGPD, au Code de la santé publique français et aux exigences HDS (Hébergement de Données de Santé).
                  </p>
                  <p className="mt-2">
                    Les données de santé sont stockées localement sur votre appareil avec chiffrement AES-256, garantissant leur protection maximale conformément à l'article L.1111-8 du Code de la santé publique.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Conservation des Données</h2>
                  <p>
                    Les données sont conservées uniquement pendant la durée nécessaire à la fourniture du service ou pour répondre aux obligations légales. Vous pouvez à tout moment demander leur suppression, sauf si une obligation légale impose leur conservation.
                  </p>
                  <p className="mt-2">
                    Conformément à l'article R.4127-77 du Code de la santé publique, les dossiers médicaux peuvent être conservés pendant au moins 20 ans après le dernier contact avec le patient.
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
                    Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Droit d'accès à vos données (Art. 15 RGPD)</li>
                    <li>Droit de rectification (Art. 16 RGPD)</li>
                    <li>Droit à l'effacement - droit à l'oubli (Art. 17 RGPD)</li>
                    <li>Droit à la limitation du traitement (Art. 18 RGPD)</li>
                    <li>Droit à la portabilité des données (Art. 20 RGPD)</li>
                    <li>Droit d'opposition (Art. 21 RGPD)</li>
                    <li>Droit de déposer une réclamation auprès de la CNIL</li>
                  </ul>
                  <p className="mt-2">
                    Pour exercer ces droits, contactez notre délégué à la protection des données à l'adresse : <a href="mailto:dpo@afdev.fr" className="underline">dpo@afdev.fr</a>.
                  </p>
                  <p className="mt-2 text-sm">
                    En cas de non-réponse ou de réponse insatisfaisante sous 30 jours, vous pouvez saisir la CNIL : <a href="https://www.cnil.fr/" className="underline">www.cnil.fr</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Sécurité des Données</h2>
                  <p>
                    AFDEV applique des mesures de sécurité robustes afin de prévenir tout accès non autorisé, perte, altération ou divulgation de vos données. Cela inclut notamment le chiffrement AES-256-GCM, les contrôles d'accès stricts et les sauvegardes sécurisées.
                  </p>
                  <p className="mt-2">
                    Notre architecture de stockage hybride garantit que les données sensibles restent exclusivement sur votre appareil local, conformément aux plus hauts standards de sécurité HDS.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Transferts Internationaux</h2>
                  <p>
                    Les données de santé ne font l'objet d'aucun transfert en dehors de l'Union Européenne. Elles sont stockées exclusivement de manière locale et chiffrée sur votre appareil.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Modifications de la Politique</h2>
                  <p>
                    Cette politique de confidentialité peut être mise à jour pour refléter les évolutions légales ou fonctionnelles. En cas de changement important, AFDEV vous en informera via la plateforme ou par e-mail avec un préavis de 30 jours minimum.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. Contact et DPO</h2>
                  <p>
                    Pour toute question relative à cette politique ou à vos données, contactez :
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Notre service client : <a href="mailto:privacy@afdev.fr" className="underline">privacy@afdev.fr</a></li>
                    <li>Notre délégué à la protection des données : <a href="mailto:dpo@afdev.fr" className="underline">dpo@afdev.fr</a></li>
                  </ul>
                  <p className="mt-2 text-sm">
                    AFDEV - Société par actions simplifiée<br />
                    SIRET : [À compléter lors de la mise en production]<br />
                    Déclaration CNIL : [À compléter lors de la mise en production]
                  </p>
                </section>

                <p className="text-sm text-gray-500 pt-6">
                  Dernière mise à jour : 10 septembre 2025<br />
                  Version 2.0 - Conforme RGPD et Code de la santé publique français
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