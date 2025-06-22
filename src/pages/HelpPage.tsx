
import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Users, 
  UserCheck, 
  FileText, 
  Calendar, 
  HelpCircle,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

const HelpPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <BackButton to="/dashboard" />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-blue-500" />
            Guide d'utilisation
          </h1>
          <p className="text-muted-foreground mt-1">
            Découvrez comment utiliser efficacement votre application de gestion
          </p>
        </div>

        <Tabs defaultValue="cabinets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cabinets">Cabinets</TabsTrigger>
            <TabsTrigger value="remplacements">Remplacements</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="facturation">Facturation</TabsTrigger>
          </TabsList>

          <TabsContent value="cabinets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  Gestion des Cabinets
                </CardTitle>
                <CardDescription>
                  Comment créer et gérer vos cabinets avec plusieurs ostéopathes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Scénario 1: Cabinet avec plusieurs ostéopathes
                  </h3>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">1</Badge>
                      <div>
                        <p className="font-medium">Premier ostéopathe</p>
                        <p className="text-sm text-muted-foreground">
                          Crée le cabinet avec toutes les informations (nom, adresse, etc.)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">2</Badge>
                      <div>
                        <p className="font-medium">Autres ostéopathes</p>
                        <p className="text-sm text-muted-foreground">
                          S'associent au cabinet via "Paramètres" → "Collaborations" → "Associations Cabinet"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">3</Badge>
                      <div>
                        <p className="font-medium">Partage des patients</p>
                        <p className="text-sm text-muted-foreground">
                          Tous les ostéopathes du cabinet peuvent voir et gérer les patients du cabinet
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important :</strong> Seul le créateur du cabinet peut modifier les informations du cabinet (nom, adresse, etc.). 
                    Les autres ostéopathes peuvent seulement s'associer ou se dissocier.
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Scénario 2: Ostéopathe en exercice libéral seul
                  </h3>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">1</Badge>
                      <div>
                        <p className="font-medium">Création simple</p>
                        <p className="text-sm text-muted-foreground">
                          Créez votre cabinet personnel avec vos informations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">2</Badge>
                      <div>
                        <p className="font-medium">Gestion autonome</p>
                        <p className="text-sm text-muted-foreground">
                          Vous gérez seul vos patients et votre facturation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remplacements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  Système de Remplacements
                </CardTitle>
                <CardDescription>
                  Comment configurer et gérer vos remplacements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Configuration d'un remplacement
                  </h3>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">1</Badge>
                      <div>
                        <p className="font-medium">Ostéopathe titulaire</p>
                        <p className="text-sm text-muted-foreground">
                          Va dans "Paramètres" → "Collaborations" → "Gestion des Remplacements"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">2</Badge>
                      <div>
                        <p className="font-medium">Ajouter un remplaçant</p>
                        <p className="text-sm text-muted-foreground">
                          Sélectionne l'ostéopathe remplaçant (collègue du même cabinet ou autre ostéopathe autorisé)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">3</Badge>
                      <div>
                        <p className="font-medium">Définir la période</p>
                        <p className="text-sm text-muted-foreground">
                          Optionnel : dates de début et fin, notes explicatives
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Pendant le remplacement
                  </h3>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">✓</Badge>
                      <div>
                        <p className="font-medium">Accès aux patients</p>
                        <p className="text-sm text-muted-foreground">
                          Le remplaçant peut voir et consulter les patients du titulaire
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">✓</Badge>
                      <div>
                        <p className="font-medium">Facturation</p>
                        <p className="text-sm text-muted-foreground">
                          Le remplaçant crée des factures au nom du titulaire (avec ses informations RPPS/SIRET)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">✓</Badge>
                      <div>
                        <p className="font-medium">Rendez-vous</p>
                        <p className="text-sm text-muted-foreground">
                          Le remplaçant peut créer et gérer les rendez-vous
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important :</strong> Le remplaçant doit aussi avoir un profil complet dans l'application. 
                    Les remplacements ne fonctionnent qu'entre ostéopathes du même cabinet ou ayant une autorisation spécifique.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Gestion des Patients
                </CardTitle>
                <CardDescription>
                  Comment ajouter et gérer vos patients efficacement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Création d'une fiche patient</h3>
                  <div className="space-y-2 pl-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      L'email est <strong>facultatif</strong> - vous pouvez créer un patient sans adresse email
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Remplissez au minimum le nom, prénom et les informations pertinentes
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Les onglets pédiatriques apparaissent automatiquement pour les patients de moins de 18 ans
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Partage des patients</h3>
                  <div className="space-y-2 pl-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Les patients sont rattachés soit à un ostéopathe personnel, soit à un cabinet
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Si rattachés au cabinet, tous les ostéopathes du cabinet peuvent les voir
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Les remplaçants peuvent accéder aux patients pendant leur période de remplacement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facturation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Facturation
                </CardTitle>
                <CardDescription>
                  Comprendre le système de facturation et les informations légales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Informations requises</h3>
                  <div className="space-y-2 pl-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <strong>Numéro RPPS :</strong> Obligatoire pour la facturation professionnelle
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <strong>SIRET :</strong> Numéro d'identification de votre activité
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <strong>Code APE :</strong> Par défaut 8690F pour les ostéopathes
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <strong>Tampon :</strong> Image de votre tampon professionnel pour les factures
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Facturation en remplacement</h3>
                  <div className="space-y-2 pl-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Les factures sont émises au nom du titulaire (ses RPPS/SIRET)
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Le remplaçant peut créer les factures mais elles portent l'identité du titulaire
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Mention légale du remplacement automatiquement ajoutée
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Rappel légal :</strong> Assurez-vous que vos informations RPPS et SIRET sont correctes. 
                    Ces informations sont utilisées pour la facturation officielle et doivent être conformes à votre statut professionnel.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Besoin d'aide supplémentaire ?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <p className="mb-4">
              Si vous avez des questions spécifiques ou rencontrez des difficultés, n'hésitez pas à consulter 
              les différentes sections de paramètres ou à contacter le support.
            </p>
            <div className="flex gap-4">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                💡 Astuce : Utilisez les boutons "?" dans l'interface pour des aides contextuelles
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HelpPage;
