import { Layout } from "@/components/ui/layout";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, Shield, Server, AlertTriangle } from "lucide-react";
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
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Section 1: Éditeur */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">1. Éditeur du logiciel</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Nom du logiciel :</strong> OstéoPraxis</p>
              <p><strong>Éditeur :</strong> OstéoPraxis SAS (en cours d'immatriculation)</p>
              <p><strong>Contact :</strong> contact@osteopraxis.fr</p>
              <p><strong>Pays :</strong> France</p>
            </div>
          </section>

          {/* Section 2: Nature du service */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">2. Nature du service</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                OstéoPraxis est un <strong>logiciel local de gestion</strong> destiné aux professionnels de santé,
                fonctionnant <strong>exclusivement sur l'appareil de l'utilisateur</strong>.
              </p>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mt-4">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Aucune donnée médicale ou personnelle n'est stockée sur des serveurs distants.
                </p>
              </div>
              <p>
                Toutes les données métier (patients, dossiers, factures) sont stockées localement
                dans la base de données IndexedDB de votre navigateur.
              </p>
            </div>
          </section>

          {/* Section 3: Hébergement */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">3. Hébergement</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Aucune donnée métier</strong> (patients, dossiers médicaux, factures, rendez-vous)
                n'est hébergée par l'éditeur.
              </p>
              <p>
                <strong>Supabase</strong> est utilisé uniquement comme :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Service d'authentification (email / mot de passe)</li>
                <li>Gestion des comptes utilisateurs</li>
              </ul>
              <p className="mt-4">
                Supabase <strong>n'a aucun accès aux données métier</strong> qui restent exclusivement
                sur l'appareil de l'utilisateur.
              </p>
            </div>
          </section>

          {/* Section 4: Responsabilité */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold">4. Responsabilité</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  L'utilisateur est seul responsable :
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                  <li>De ses données</li>
                  <li>De leur sauvegarde régulière</li>
                  <li>De leur conformité aux obligations légales et réglementaires</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="font-medium text-red-800 dark:text-red-200 mb-2">
                  L'éditeur ne peut être tenu responsable :
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                  <li>D'une perte de données locale (crash, suppression accidentelle)</li>
                  <li>D'une suppression volontaire ou accidentelle par l'utilisateur</li>
                  <li>D'un problème matériel (ordinateur, navigateur, système d'exploitation)</li>
                  <li>D'une utilisation non conforme aux recommandations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Propriété intellectuelle */}
          <section className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">5. Propriété intellectuelle</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                L'ensemble des éléments constituant le logiciel OstéoPraxis (code source, design,
                textes, images, logos) sont la propriété exclusive de l'éditeur et sont protégés
                par les lois françaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification ou exploitation non autorisée
                est strictement interdite.
              </p>
            </div>
          </section>

          {/* Section 6: Droit applicable */}
          <section className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">6. Droit applicable</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Les présentes mentions légales sont régies par le <strong>droit français</strong>.
              </p>
              <p>
                En cas de litige, et après tentative de résolution amiable, les tribunaux français
                seront seuls compétents.
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
              to="/privacy"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Politique de confidentialité
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              to="/contact"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegalesPage;
