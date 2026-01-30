import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Shield,
  Database,
  Lock,
  UserCheck,
  Mail,
  Scale,
  Eye,
  FileText,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const PrivacyPolicyPage = () => {
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
            <Shield className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              Politique de Confidentialité
            </h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : janvier 2026
            </p>
          </div>

          {/* Introduction */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Introduction</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Osteopraxis accorde une importance particulière à la protection
                de vos données personnelles. Cette politique vous informe sur la
                manière dont nous traitons vos informations, conformément au
                Règlement Général sur la Protection des Données (RGPD) et à la
                loi Informatique et Libertés.
              </p>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mt-4">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Ce site ne collecte actuellement aucune donnée personnelle
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Aucun formulaire, aucun cookie, aucun outil d'analyse
                  (analytics) n'est utilisé sur ce site.
                </p>
              </div>
            </div>
          </section>

          {/* Responsable du traitement */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">
                1. Responsable du traitement
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong>Projet Osteopraxis</strong>
              </p>
              <p>Porteur du projet : Florent Music</p>
              <p>Localisation : Haute-Garonne (31), France</p>
              <p>
                Email :{" "}
                <a
                  href="mailto:music.music1.music@gmail.com"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  music.music1.music@gmail.com
                </a>
              </p>
              <p className="text-sm mt-2">
                Statut : Activité en cours de création (non immatriculée)
              </p>
            </div>
          </section>

          {/* Données collectées */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Database className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold">2. Données collectées</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Phase actuelle : aucune collecte de données
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Dans sa version actuelle de pré-lancement, ce site ne collecte
                  aucune donnée personnelle :
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300 mt-2">
                  <li>Aucun formulaire de contact ou d'inscription</li>
                  <li>Aucun cookie déposé sur votre navigateur</li>
                  <li>
                    Aucun outil d'analyse de trafic (Google Analytics, Matomo,
                    etc.)
                  </li>
                  <li>Aucun script de suivi tiers</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                  Données techniques minimales
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Seules les données techniques nécessaires au fonctionnement
                  d'Internet peuvent transiter (adresse IP pour la connexion au
                  serveur), mais elles ne sont ni enregistrées ni exploitées par
                  Osteopraxis.
                </p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Eye className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold">3. Cookies</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">
                  Ce site n'utilise aucun cookie
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Aucun cookie publicitaire, analytique ou de suivi n'est déposé
                  sur votre appareil. Aucune bannière de consentement n'est donc
                  nécessaire.
                </p>
              </div>
              <p className="text-sm">
                Cette politique sera mise à jour si des cookies venaient à être
                utilisés lors du lancement commercial du service.
              </p>
            </div>
          </section>

          {/* Vos droits */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">4. Vos droits</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Conformément au RGPD, vous disposez des droits suivants sur vos
                données personnelles :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>
                  <strong>Droit d'accès</strong> : obtenir une copie de vos
                  données
                </li>
                <li>
                  <strong>Droit de rectification</strong> : corriger des données
                  inexactes
                </li>
                <li>
                  <strong>Droit à l'effacement</strong> : demander la
                  suppression de vos données
                </li>
                <li>
                  <strong>Droit à la limitation</strong> : restreindre le
                  traitement
                </li>
                <li>
                  <strong>Droit à la portabilité</strong> : recevoir vos données
                  dans un format structuré
                </li>
                <li>
                  <strong>Droit d'opposition</strong> : vous opposer au
                  traitement
                </li>
              </ul>
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mt-4">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Note :</strong> Étant donné qu'aucune donnée n'est
                  actuellement collectée, ces droits n'ont pas d'objet à ce
                  stade. Ils seront pleinement applicables lors du lancement du
                  service.
                </p>
              </div>
            </div>
          </section>

          {/* Sécurité */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <Lock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-semibold">5. Sécurité des données</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Le site utilise une connexion sécurisée (HTTPS) pour protéger
                les échanges entre votre navigateur et notre serveur.
              </p>
              <p>
                Lors du lancement commercial, des mesures de sécurité
                supplémentaires seront mises en place pour protéger les données
                des utilisateurs, conformément aux meilleures pratiques et aux
                exigences du RGPD.
              </p>
            </div>
          </section>

          {/* Réclamation CNIL */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold">6. Réclamation</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                En cas de litige concernant le traitement de vos données
                personnelles, vous pouvez introduire une réclamation auprès de
                la CNIL :
              </p>
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  Commission Nationale de l'Informatique et des Libertés
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  3 Place de Fontenoy, TSA 80715
                  <br />
                  75334 Paris Cedex 07
                </p>
                <p className="mt-2">
                  <a
                    href="https://www.cnil.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">7. Contact</h2>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Pour toute question concernant cette politique de
                confidentialité ou vos données personnelles :
              </p>
              <p className="text-lg">
                <a
                  href="mailto:music.music1.music@gmail.com"
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                >
                  music.music1.music@gmail.com
                </a>
              </p>
              <p className="text-sm">
                Nous nous engageons à répondre dans un délai d'un mois.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">
              8. Modifications de cette politique
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Cette politique de confidentialité peut être mise à jour pour
                refléter les évolutions légales ou fonctionnelles du service.
              </p>
              <p>
                La date de dernière modification est indiquée en haut de ce
                document. Nous vous invitons à la consulter régulièrement.
              </p>
            </div>
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
              to="/legal/cgu"
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Conditions Générales d'Utilisation
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>© 2026 Osteopraxis · Conforme RGPD · France</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
