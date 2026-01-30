import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Scale,
  Shield,
  Server,
  AlertTriangle,
  Building2,
  Mail,
  Copyright,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const MentionsLegalesPage = () => {
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
            <Scale className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Mentions Légales</h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : janvier 2026
            </p>
          </div>

          {/* Section 1: Éditeur */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">1. Éditeur du site</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Nom du projet :</strong> Osteopraxis
              </p>
              <p>
                <strong>Porteur du projet :</strong> Florent Music
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Statut : Activité en cours de création
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  L'immatriculation légale sera effectuée lors du lancement
                  commercial de l'activité.
                </p>
              </div>
              <p>
                <strong>Localisation :</strong> Haute-Garonne (31), Occitanie,
                France
              </p>
            </div>
          </section>

          {/* Section 2: Contact */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">2. Contact</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Pour toute question relative au site ou à son contenu, vous
                pouvez nous contacter par email :
              </p>
              <p className="text-lg">
                <a
                  href="mailto:music.music1.music@gmail.com"
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                >
                  music.music1.music@gmail.com
                </a>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Aucun formulaire de contact n'est disponible pour le moment.
                L'email est le seul moyen de communication.
              </p>
            </div>
          </section>

          {/* Section 3: Nature du site */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">3. Nature du site</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Ce site a une vocation <strong>informative et de présentation</strong>.
                Il présente un projet de logiciel de gestion de cabinet
                d'ostéopathie actuellement en cours de développement.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Ce site ne propose actuellement :
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300 mt-2">
                  <li>Aucun paiement en ligne</li>
                  <li>Aucune commande ni abonnement</li>
                  <li>Aucune collecte active de données personnelles</li>
                  <li>Aucun cookie ni script de suivi (analytics)</li>
                </ul>
              </div>
              <p className="mt-4">
                Les fonctionnalités présentées sont susceptibles d'évoluer avant
                le lancement officiel du service.
              </p>
            </div>
          </section>

          {/* Section 4: Hébergement */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Server className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold">4. Hébergement</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Hébergeur :</strong> Vercel Inc.
              </p>
              <p>
                <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA
                91789, États-Unis
              </p>
              <p>
                <strong>Site web :</strong>{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  https://vercel.com
                </a>
              </p>
            </div>
          </section>

          {/* Section 5: Propriété intellectuelle */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Copyright className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold">
                5. Propriété intellectuelle
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                L'ensemble des contenus présents sur le site Osteopraxis
                (textes, images, logos, interfaces, code source) sont protégés
                par le droit d'auteur et demeurent la propriété exclusive de
                l'éditeur, sauf mention contraire.
              </p>
              <p>
                Toute reproduction, représentation, modification ou exploitation
                non autorisée, totale ou partielle, est strictement interdite et
                constitue une contrefaçon sanctionnée par le Code de la
                propriété intellectuelle.
              </p>
            </div>
          </section>

          {/* Section 6: Limitation de responsabilité */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold">
                6. Limitation de responsabilité
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                L'éditeur s'efforce de fournir des informations exactes et à
                jour. Toutefois, il ne peut garantir l'exhaustivité ni l'absence
                d'erreurs des contenus publiés.
              </p>
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  L'éditeur décline toute responsabilité :
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  <li>
                    En cas d'interruption temporaire du site pour maintenance ou
                    raisons techniques
                  </li>
                  <li>
                    Pour tout dommage résultant de l'utilisation ou de
                    l'impossibilité d'utiliser le site
                  </li>
                  <li>
                    Pour le contenu des sites tiers accessibles via des liens
                    hypertextes
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7: Droit applicable */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <Scale className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-semibold">7. Droit applicable</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Les présentes mentions légales sont régies par le{" "}
                <strong>droit français</strong>.
              </p>
              <p>
                En cas de litige, et après tentative de résolution amiable, les
                tribunaux français seront seuls compétents.
              </p>
            </div>
          </section>

          {/* Liens */}
          <div className="flex flex-wrap gap-4 justify-center pt-6 border-t">
            <Link
              to="/legal/cgu"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Conditions Générales d'Utilisation
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              to="/legal/politique-de-confidentialite"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Politique de confidentialité
            </Link>
          </div>

          {/* Footer légal */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>© 2026 Osteopraxis · Projet en cours de création · France</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegalesPage;
