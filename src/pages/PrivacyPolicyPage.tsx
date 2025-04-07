
import React from "react";
import { Layout } from "@/components/ui/layout";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Politique de Confidentialité
        </h1>

        <Separator className="my-6" />

        <div className="space-y-6 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              1. Collecte des Données Personnelles
            </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae. 
              Sed dui lorem, adipiscing in adipiscing et, interdum nec metus. Mauris ultricies, justo eu convallis placerat, felis enim.
              Nullam et orci eu lorem consequat tincidunt vivamus et sagittis libero.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              2. Utilisation des Données
            </h2>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <ul className="list-disc pl-8 pt-2 space-y-2">
              <li>Suivi médical et soins adaptés</li>
              <li>Administration de votre dossier médical</li>
              <li>Communication concernant vos rendez-vous et traitements</li>
              <li>Amélioration continue de nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              3. Partage des Données
            </h2>
            <p>
              Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est 
              bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.
              Praesent id metus massa, ut blandit odio. Proin quis tortor orci.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              4. Conservation des Données
            </h2>
            <p>
              Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus.
              Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in 
              faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              5. Vos Droits
            </h2>
            <p>
              Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, 
              nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat 
              massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
            </p>
            <ul className="list-disc pl-8 pt-2 space-y-2">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à l'effacement dans certaines circonstances</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité de vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              6. Contact
            </h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
              veuillez nous contacter à l'adresse suivante: privacy@example.com
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;
