import React, { useState } from "react";
import { Layout } from "@/components/ui/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Play,
	Users,
	Calendar,
	FileText,
	Settings,
	HelpCircle,
} from "lucide-react";

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState("getting-started");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Aide & Support</h1>
          <p className="text-muted-foreground mt-1">
            Trouvez des réponses à vos questions et apprenez à utiliser PatientHub
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Responsive tabs list */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 mb-6 h-auto p-1">
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

          <TabsContent value="getting-started" className="space-y-4">
            <h2 className="text-2xl font-semibold">Premiers pas</h2>
            <p>Bienvenue sur PatientHub ! Voici quelques conseils pour démarrer :</p>
            <ul className="list-disc list-inside">
              <li>Créez votre premier patient</li>
              <li>Ajoutez une séance à votre planning</li>
              <li>Explorez les paramètres pour personnaliser votre expérience</li>
            </ul>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <h2 className="text-2xl font-semibold">Gestion des patients</h2>
            <p>Apprenez à gérer efficacement vos patients :</p>
            <ul className="list-disc list-inside">
              <li>Ajouter, modifier et supprimer un patient</li>
              <li>Consulter l'historique des séances</li>
              <li>Gérer les informations médicales</li>
            </ul>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <h2 className="text-2xl font-semibold">Gestion des séances</h2>
            <p>Optimisez votre planning de séances :</p>
            <ul className="list-disc list-inside">
              <li>Ajouter, modifier et supprimer une séance</li>
              <li>Gérer les rappels de séances</li>
              <li>Visualiser votre planning hebdomadaire</li>
            </ul>
          </TabsContent>

          <TabsContent value="invoicing" className="space-y-4">
            <h2 className="text-2xl font-semibold">Facturation</h2>
            <p>Gérez facilement vos factures :</p>
            <ul className="list-disc list-inside">
              <li>Créer et envoyer une facture</li>
              <li>Suivre les paiements</li>
              <li>Exporter vos données comptables</li>
            </ul>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl font-semibold">Paramètres</h2>
            <p>Personnalisez PatientHub selon vos besoins :</p>
            <ul className="list-disc list-inside">
              <li>Modifier votre profil</li>
              <li>Gérer les paramètres de votre cabinet</li>
              <li>Configurer les notifications</li>
            </ul>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <h2 className="text-2xl font-semibold">FAQ</h2>
            <p>Réponses aux questions fréquemment posées :</p>
            <ul className="list-disc list-inside">
              <li>Comment créer un patient ?</li>
              <li>Comment ajouter une séance ?</li>
              <li>Comment exporter mes données comptables ?</li>
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HelpPage;
