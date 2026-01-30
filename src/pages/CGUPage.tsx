import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Shield,
  AlertTriangle,
  Scale,
  RefreshCw,
  Globe,
  Ban,
  Copyright,
  Construction,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const CGUPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="space-y-8">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : janvier 2026
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm">
              <Construction className="h-4 w-4" />
              Version pré-lancement
            </div>
          </div>

          {/* Préambule */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Préambule</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent
                l'accès et l'utilisation du site Osteopraxis.
              </p>
              <p>
                En accédant à ce site, vous acceptez sans réserve les présentes
                CGU.
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Ce site est actuellement en phase de pré-lancement
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Aucun service opérationnel n'est fourni et aucune
                  fonctionnalité de gestion n'est accessible aux utilisateurs à
                  ce stade.
                </p>
              </div>
            </div>
          </section>

          {/* Section 1: Présentation du service */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">
                1. Présentation du service
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Osteopraxis est un projet de logiciel de gestion de cabinet
                d'ostéopathie, actuellement{" "}
                <strong>en phase de développement</strong>.
              </p>
              <p>Le site a pour objet :</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>De présenter le projet et ses fonctionnalités prévues</li>
                <li>
                  De permettre aux visiteurs intéressés de prendre contact par
                  email
                </li>
                <li>D'informer sur l'avancement du projet</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Accès au site */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">2. Accès au site</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                L'accès au site est gratuit et ouvert à tout visiteur disposant
                d'un accès Internet.
              </p>
              <p>
                L'éditeur se réserve le droit de suspendre, modifier ou
                interrompre l'accès au site à tout moment, notamment pour des
                raisons de maintenance ou d'évolution du projet, sans préavis ni
                indemnité.
              </p>
            </div>
          </section>

          {/* Section 3: Absence de transaction commerciale - IMPORTANT */}
          <section className="bg-card rounded-lg border p-6 border-emerald-300 dark:border-emerald-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Ban className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">
                3. Absence de transaction commerciale
              </h2>
              <span className="px-2 py-1 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded">
                IMPORTANT
              </span>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <p className="font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                  Aucun paiement n'est possible sur ce site
                </p>
                <p className="text-emerald-700 dark:text-emerald-300">
                  Le site ne propose actuellement :
                </p>
                <ul className="list-disc list-inside space-y-1 text-emerald-700 dark:text-emerald-300 mt-2">
                  <li>Aucun paiement en ligne</li>
                  <li>Aucune commande</li>
                  <li>Aucun abonnement</li>
                  <li>Aucun encaissement</li>
                </ul>
              </div>
              <p>
                Les tarifs éventuellement affichés sur le site sont donnés à
                titre indicatif et ne constituent pas une offre contractuelle.
                Ils sont susceptibles d'évoluer avant le lancement commercial.
              </p>
              <p className="font-medium">
                Aucun engagement financier ne peut être contracté via ce site à
                ce stade.
              </p>
            </div>
          </section>

          {/* Section 4: Service en développement */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Construction className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold">
                4. Service en développement
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Les fonctionnalités, interfaces et contenus présentés sur le
                site sont susceptibles d'évoluer significativement avant le
                lancement officiel.
              </p>
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="text-slate-700 dark:text-slate-300">
                  Les captures d'écran, descriptions et démonstrations ont une
                  valeur illustrative et ne constituent pas un engagement sur le
                  produit final.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Comportement de l'utilisateur */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold">
                5. Comportement de l'utilisateur
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>L'utilisateur s'engage à :</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Utiliser le site conformément à sa destination</li>
                <li>Ne pas tenter de nuire au bon fonctionnement du site</li>
                <li>
                  Ne pas collecter d'informations sur les autres utilisateurs
                </li>
                <li>Respecter les droits de propriété intellectuelle</li>
              </ul>
              <p className="mt-4">
                Tout comportement contraire pourra entraîner le blocage de
                l'accès au site.
              </p>
            </div>
          </section>

          {/* Section 6: Propriété intellectuelle */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <Copyright className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-semibold">
                6. Propriété intellectuelle
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                L'ensemble des éléments du site (textes, images, logos,
                interfaces, code) sont protégés par le droit de la propriété
                intellectuelle.
              </p>
              <p>
                Toute reproduction ou utilisation non autorisée est interdite.
              </p>
            </div>
          </section>

          {/* Section 7: Limitation de responsabilité */}
          <section className="bg-card rounded-lg border p-6 border-amber-300 dark:border-amber-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold">
                7. Limitation de responsabilité
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>Le site est fourni "en l'état". L'éditeur ne garantit pas :</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>La disponibilité permanente du site</li>
                <li>L'absence d'erreurs ou de bugs</li>
                <li>
                  L'adéquation du futur service aux besoins spécifiques de
                  l'utilisateur
                </li>
              </ul>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                <p className="text-amber-800 dark:text-amber-200">
                  L'éditeur ne pourra être tenu responsable des dommages directs
                  ou indirects résultant de l'utilisation ou de l'impossibilité
                  d'utiliser le site.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: Protection des données */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">
                8. Protection des données
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Le traitement des données personnelles est régi par notre{" "}
                <Link
                  to="/legal/politique-de-confidentialite"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Politique de Confidentialité
                </Link>
                , accessible sur le site.
              </p>
              <p>
                À noter : ce site ne collecte actuellement aucune donnée
                personnelle (aucun formulaire, aucun cookie, aucun analytics).
              </p>
            </div>
          </section>

          {/* Section 9: Modification des CGU */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">
                9. Modification des CGU
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                L'éditeur se réserve le droit de modifier les présentes CGU à
                tout moment.
              </p>
              <p>
                Les modifications entrent en vigueur dès leur publication sur le
                site. Nous vous invitons à consulter cette page régulièrement.
              </p>
            </div>
          </section>

          {/* Section 10: Droit applicable */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold">
                10. Droit applicable et juridiction
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Les présentes CGU sont régies par le{" "}
                <strong>droit français</strong>.
              </p>
              <p>
                En cas de litige, une solution amiable sera recherchée avant
                toute action judiciaire. À défaut, les tribunaux français seront
                seuls compétents.
              </p>
            </div>
          </section>

          {/* Acceptation */}
          <section className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-700 p-6 text-center">
            <p className="text-indigo-800 dark:text-indigo-200 font-medium">
              En utilisant ce site, vous acceptez les présentes Conditions
              Générales d'Utilisation.
            </p>
          </section>

          {/* Liens */}
          <div className="flex flex-wrap gap-4 justify-center pt-6 border-t">
            <Link
              to="/legal/mentions-legales"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Mentions Légales
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              to="/legal/politique-de-confidentialite"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Politique de confidentialité
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>© 2026 Osteopraxis · Projet en cours de création · France</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGUPage;
