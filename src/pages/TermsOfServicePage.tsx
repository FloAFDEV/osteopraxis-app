
import React from "react";
import { Layout } from "@/components/ui/layout";
import { Separator } from "@/components/ui/separator";

const TermsOfServicePage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Conditions d'Utilisation
        </h1>

        <Separator className="my-6" />

        <div className="space-y-6 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              1. Acceptation des Conditions
            </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam viverra euismod odio, gravida pellentesque urna varius vitae. 
              Sed dui lorem, adipiscing in adipiscing et, interdum nec metus. Mauris ultricies, justo eu convallis placerat, felis enim.
              Nullam et orci eu lorem consequat tincidunt vivamus et sagittis libero.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              2. Description des Services
            </h2>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              3. Obligations des Utilisateurs
            </h2>
            <p>
              Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est 
              bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere.
              Praesent id metus massa, ut blandit odio. Proin quis tortor orci.
            </p>
            <ul className="list-disc pl-8 pt-2 space-y-2">
              <li>Fournir des informations exactes et à jour</li>
              <li>Respecter les rendez-vous programmés</li>
              <li>Utiliser les services conformément aux présentes conditions</li>
              <li>Ne pas utiliser les services à des fins frauduleuses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              4. Propriété Intellectuelle
            </h2>
            <p>
              Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut, mollis sed, nonummy id, metus.
              Nullam accumsan lorem in dui. Cras ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in 
              faucibus orci luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              5. Limitation de Responsabilité
            </h2>
            <p>
              Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, 
              nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat 
              massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              6. Modification des Conditions
            </h2>
            <p>
              In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. 
              Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, 
              porttitor eu, consequat vitae, eleifend ac, enim.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              7. Loi Applicable
            </h2>
            <p>
              Les présentes conditions sont régies et interprétées conformément aux lois françaises, sans donner effet à aucun 
              principe de conflit de lois. Tout litige découlant de ces conditions sera soumis à la juridiction exclusive des 
              tribunaux compétents de Paris, France.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              8. Contact
            </h2>
            <p>
              Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à l'adresse suivante: 
              terms@example.com
            </p>
          </section>
        </div>

        <Separator className="my-8" />
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Dernière mise à jour: 7 avril 2025</p>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfServicePage;
