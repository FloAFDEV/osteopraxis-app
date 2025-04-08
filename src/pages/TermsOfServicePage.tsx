
import React from "react";
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfServicePage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Conditions Générales d'Utilisation</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                  <p>
                    Bienvenue sur notre plateforme de gestion pour ostéopathes. En utilisant ce service, vous acceptez de respecter les présentes conditions générales d'utilisation. Veuillez les lire attentivement.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Description du Service</h2>
                  <p>
                    Notre plateforme offre aux ostéopathes des outils pour gérer leurs patients, rendez-vous, et dossiers médicaux de manière sécurisée et conforme aux réglementations en vigueur.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Conditions d'Accès et d'Utilisation</h2>
                  <p>
                    Pour utiliser ce service, vous devez être un professionnel de santé qualifié et disposer d'un compte valide. Vous êtes responsable de maintenir la confidentialité de vos identifiants et de toutes les activités effectuées avec votre compte.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Protection des Données</h2>
                  <p>
                    Nous nous engageons à protéger les données personnelles et médicales conformément au Règlement Général sur la Protection des Données (RGPD) et autres législations applicables. Pour plus de détails, veuillez consulter notre Politique de Confidentialité.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Droits de Propriété Intellectuelle</h2>
                  <p>
                    Tous les droits de propriété intellectuelle relatifs à notre plateforme et son contenu sont réservés. Vous ne pouvez pas reproduire, distribuer, modifier ou créer des œuvres dérivées sans notre autorisation écrite préalable.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Responsabilités</h2>
                  <p>
                    En tant qu'utilisateur, vous êtes responsable de l'exactitude et de la légalité des informations que vous saisissez dans le système. Nous déclinons toute responsabilité concernant les erreurs médicales ou les diagnostics incorrects.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Modifications du Service</h2>
                  <p>
                    Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment, avec ou sans préavis. Nous nous efforcerons de vous informer des changements importants.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Résiliation</h2>
                  <p>
                    Nous nous réservons le droit de suspendre ou de résilier votre accès à notre service si nous déterminons, à notre seule discrétion, que vous avez violé ces conditions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Loi Applicable</h2>
                  <p>
                    Ces conditions sont régies et interprétées conformément aux lois en vigueur, sans égard aux principes de conflit de lois.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
                  <p>
                    Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à support@example.com.
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

export default TermsOfServicePage;
