
import React, { useState } from "react";
import { Layout } from "@/components/ui/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Play,
	Users,
	Calendar,
	FileText,
	Settings,
	HelpCircle,
	ArrowUp,
	Phone,
	Mail,
	MessageCircle,
	Shield,
	Lock,
	Database,
} from "lucide-react";

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState("getting-started");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqData = {
    general: [
      {
        question: "Comment créer mon premier patient ?",
        answer: "Rendez-vous dans la section 'Patients', cliquez sur 'Nouveau patient' et remplissez les informations dans les différents onglets : Général (nom, prénom, date de naissance), Contact (téléphone, email, adresse), Médical (antécédents, traitements), etc."
      },
      {
        question: "Comment ajouter une séance à mon planning ?",
        answer: "Allez dans 'Planning', cliquez sur 'Nouvelle séance' ou directement sur un créneau horaire, sélectionnez le patient, définissez la durée et ajoutez des notes si nécessaire."
      },
      {
        question: "Puis-je synchroniser mon planning avec Google Calendar ?",
        answer: "Oui, dans Paramètres > Intégrations, vous pouvez configurer la synchronisation avec Google Calendar en ajoutant vos clés API Google. Cela permet d'importer vos rendez-vous Doctolib automatiquement."
      },
      {
        question: "Comment sauvegarder mes données ?",
        answer: "Vos données sont automatiquement sauvegardées dans le cloud. Vous pouvez également exporter vos factures au format PDF ou Excel depuis la section Facturation."
      }
    ],
    patients: [
      {
        question: "Comment rechercher un patient rapidement ?",
        answer: "Utilisez la barre de recherche dans la liste des patients. Vous pouvez rechercher par nom, prénom, téléphone ou email. Utilisez aussi les filtres alphabétiques et par cabinet."
      },
      {
        question: "Puis-je modifier les informations d'un patient après création ?",
        answer: "Oui, cliquez sur le patient dans la liste, puis sur 'Modifier' pour accéder à tous ses champs modifiables dans les différents onglets."
      },
      {
        question: "Comment supprimer un patient ?",
        answer: "Dans la fiche patient, utilisez le menu d'actions rapides (3 points) et sélectionnez 'Supprimer'. Attention : cette action est irréversible et supprimera aussi l'historique des séances."
      },
      {
        question: "Comment gérer les patients mineurs ?",
        answer: "Dans l'onglet Pédiatrie du formulaire patient, vous pouvez renseigner les informations spécifiques : développement psychomoteur, réflexes, accompagnant, etc."
      }
    ],
    appointments: [
      {
        question: "Comment modifier une séance ?",
        answer: "Cliquez sur la séance dans le planning, puis sur 'Modifier'. Vous pouvez changer l'heure, la durée, le patient ou ajouter des notes."
      },
      {
        question: "Comment annuler une séance ?",
        answer: "Dans la séance, changez le statut vers 'Annulé'. La séance restera visible dans l'historique mais ne sera plus comptabilisée."
      },
      {
        question: "Puis-je créer des séances récurrentes ?",
        answer: "Actuellement, chaque séance doit être créée individuellement. Utilisez la fonction 'Dupliquer' pour gagner du temps avec des patients réguliers."
      },
      {
        question: "Comment voir l'historique des séances d'un patient ?",
        answer: "Dans la fiche patient, onglet 'Historique des séances', vous trouverez toutes les séances passées avec dates, notes et statuts."
      }
    ],
    invoicing: [
      {
        question: "Comment créer une facture ?",
        answer: "Allez dans 'Facturation', cliquez sur 'Nouvelle facture', sélectionnez le patient, saisissez le montant et les détails. Vous pouvez l'associer à une séance existante."
      },
      {
        question: "Comment exporter mes données comptables ?",
        answer: "Dans la section Facturation, utilisez les boutons 'Export comptable' (Excel) ou 'Télécharger PDF'. Vous pouvez filtrer par période pour vos déclarations."
      },
      {
        question: "Comment suivre les paiements ?",
        answer: "Dans chaque facture, vous pouvez marquer le statut : 'En attente', 'Payé', 'En retard'. Un tableau de bord vous donne une vue d'ensemble des impayés."
      },
      {
        question: "Puis-je personnaliser mes factures ?",
        answer: "Oui, dans Paramètres > Cabinet, vous pouvez ajouter votre logo, tampon, et modifier les informations de facturation (SIRET, adresse, etc.)."
      }
    ],
    technical: [
      {
        question: "PatientHub fonctionne-t-il hors ligne ?",
        answer: "PatientHub nécessite une connexion internet pour synchroniser vos données. Cependant, certaines fonctionnalités de consultation restent disponibles temporairement hors ligne."
      },
      {
        question: "Sur quels appareils puis-je utiliser PatientHub ?",
        answer: "PatientHub est accessible depuis tout navigateur web moderne : ordinateur, tablette, smartphone. L'interface s'adapte automatiquement à votre écran."
      },
      {
        question: "Comment récupérer mon mot de passe ?",
        answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié' et suivez les instructions envoyées par email."
      },
      {
        question: "Puis-je avoir plusieurs cabinets ?",
        answer: "Oui, vous pouvez créer et gérer plusieurs cabinets, partager l'accès avec des confrères et organiser vos patients par cabinet."
      }
    ]
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 relative">
        {/* Bouton retour en haut - fixe */}
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 p-0 shadow-lg"
          size="sm"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Aide & Support</h1>
          <p className="text-muted-foreground mt-1">
            Trouvez des réponses à vos questions et apprenez à utiliser PatientHub
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Responsive tabs list */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 h-auto p-1">
            <TabsTrigger 
              value="getting-started" 
              className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Play className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Démarrer</span>
              <span className="sm:hidden">Start</span>
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Patients</span>
              <span className="sm:hidden">Pat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Séances</span>
              <span className="sm:hidden">RDV</span>
            </TabsTrigger>
            <TabsTrigger 
              value="invoicing" 
              className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Facturation</span>
              <span className="sm:hidden">Fact</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Paramètres</span>
              <span className="sm:hidden">Param</span>
            </TabsTrigger>
            <TabsTrigger 
              value="faq" 
              className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <HelpCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">FAQ</span>
              <span className="sm:hidden">?</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  Premiers pas avec PatientHub
                </CardTitle>
                <CardDescription>
                  Guide rapide pour commencer à utiliser PatientHub efficacement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">1. Configuration initiale</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Complétez votre profil ostéopathe dans Paramètres</li>
                      <li>Créez votre premier cabinet avec logo et informations</li>
                      <li>Configurez vos préférences de facturation</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">2. Ajout de patients</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Créez vos premiers patients avec informations complètes</li>
                      <li>Utilisez tous les onglets pour une fiche détaillée</li>
                      <li>Organisez vos patients par cabinet si nécessaire</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">3. Gestion du planning</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Planifiez vos premières séances</li>
                      <li>Explorez les vues semaine/mois</li>
                      <li>Configurez Google Calendar si souhaité</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">4. Facturation</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Créez votre première facture</li>
                      <li>Testez l'export PDF et Excel</li>
                      <li>Configurez vos tarifs habituels</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des patients</CardTitle>
                <CardDescription>
                  Tout ce qu'il faut savoir sur la gestion de vos patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqData.patients.map((item, index) => (
                    <AccordionItem key={index} value={`patients-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des séances</CardTitle>
                <CardDescription>
                  Optimisez votre planning et gérez vos rendez-vous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqData.appointments.map((item, index) => (
                    <AccordionItem key={index} value={`appointments-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoicing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Facturation et comptabilité</CardTitle>
                <CardDescription>
                  Gérez vos factures et exports comptables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqData.invoicing.map((item, index) => (
                    <AccordionItem key={index} value={`invoicing-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres et configuration</CardTitle>
                <CardDescription>
                  Personnalisez PatientHub selon vos besoins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      Sécurité et confidentialité
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      PatientHub respecte le RGPD et garantit la sécurité de vos données médicales.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Chiffrement des données en transit et au repos</li>
                      <li>Hébergement sécurisé en Europe</li>
                      <li>Accès restreint et authentification forte</li>
                      <li>Sauvegardes automatiques quotidiennes</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                      Intégration Google Calendar
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Vos clés API Google sont stockées de manière sécurisée et chiffrée.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Clés stockées séparément pour chaque ostéopathe</li>
                      <li>Chiffrement AES-256 des secrets</li>
                      <li>Aucun partage entre utilisateurs</li>
                      <li>Révocation possible à tout moment</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-600" />
                      Protection des données
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Conformité RGPD et respect de la vie privée de vos patients.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Pseudonymisation des données sensibles</li>
                      <li>Droit à l'oubli respecté</li>
                      <li>Consentement patient tracé</li>
                      <li>Export de données sur demande</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Questions fréquemment posées</CardTitle>
                <CardDescription>
                  Trouvez rapidement une réponse à votre question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="general" className="text-xs sm:text-sm">Général</TabsTrigger>
                    <TabsTrigger value="patients" className="text-xs sm:text-sm">Patients</TabsTrigger>
                    <TabsTrigger value="appointments" className="text-xs sm:text-sm">Séances</TabsTrigger>
                    <TabsTrigger value="technical" className="text-xs sm:text-sm">technique</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="mt-4">
                    <Accordion type="single" collapsible className="w-full">
                      {faqData.general.map((item, index) => (
                        <AccordionItem key={index} value={`general-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                  
                  <TabsContent value="patients" className="mt-4">
                    <Accordion type="single" collapsible className="w-full">
                      {faqData.patients.map((item, index) => (
                        <AccordionItem key={index} value={`faq-patients-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                  
                  <TabsContent value="appointments" className="mt-4">
                    <Accordion type="single" collapsible className="w-full">
                      {faqData.appointments.map((item, index) => (
                        <AccordionItem key={index} value={`faq-appointments-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                  
                  <TabsContent value="technical" className="mt-4">
                    <Accordion type="single" collapsible className="w-full">
                      {faqData.technical.map((item, index) => (
                        <AccordionItem key={index} value={`technical-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Section Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Besoin d'aide supplémentaire ?</CardTitle>
                <CardDescription>
                  Notre équipe est là pour vous accompagner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">support@patienthub.fr</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Téléphone</div>
                      <div className="text-sm text-muted-foreground">01 23 45 67 89</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MessageCircle className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Chat</div>
                      <div className="text-sm text-muted-foreground">Lun-Ven 9h-18h</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HelpPage;
