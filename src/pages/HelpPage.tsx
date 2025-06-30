
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
          <h1 className="text-2xl sm:text-3xl font-bold">Aide & Support</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Trouvez des réponses à vos questions et apprenez à utiliser PatientHub
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Responsive tabs list */}
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6 h-auto p-1">
            <TabsTrigger 
              value="getting-started" 
              className="text-xs px-1 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-1"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Démarrer</span>
              <span className="sm:hidden text-xs">Start</span>
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="text-xs px-1 py-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-1"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Patients</span>
              <span className="sm:hidden text-xs">Pat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="text-xs px-1 py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-1"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Séances</span>
              <span className="sm:hidden text-xs">RDV</span>
            </TabsTrigger>
            <TabsTrigger 
              value="invoicing" 
              className="text-xs px-1 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-1"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Facturation</span>
              <span className="sm:hidden text-xs">Fact</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-xs px-1 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-1"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Paramètres</span>
              <span className="sm:hidden text-xs">Param</span>
            </TabsTrigger>
            <TabsTrigger 
              value="faq" 
              className="text-xs px-1 py-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-1"
            >
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">FAQ</span>
              <span className="sm:hidden text-xs">?</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Premiers pas</h2>
            <p className="text-sm sm:text-base">Bienvenue sur PatientHub ! Voici quelques conseils pour démarrer :</p>
            <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
              <li>Créez votre premier patient</li>
              <li>Ajoutez une séance à votre planning</li>
              <li>Explorez les paramètres pour personnaliser votre expérience</li>
            </ul>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Gestion des patients</h2>
            <p className="text-sm sm:text-base">Apprenez à gérer efficacement vos patients :</p>
            <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
              <li>Ajouter, modifier et supprimer un patient</li>
              <li>Consulter l'historique des séances</li>
              <li>Gérer les informations médicales</li>
            </ul>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Gestion des séances</h2>
            <p className="text-sm sm:text-base">Optimisez votre planning de séances :</p>
            <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
              <li>Ajouter, modifier et supprimer une séance</li>
              <li>Gérer les rappels de séances</li>
              <li>Visualiser votre planning hebdomadaire</li>
            </ul>
          </TabsContent>

          <TabsContent value="invoicing" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Facturation</h2>
            <p className="text-sm sm:text-base">Gérez facilement vos factures :</p>
            <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
              <li>Créer et envoyer une facture</li>
              <li>Suivre les paiements</li>
              <li>Exporter vos données comptables</li>
            </ul>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Paramètres</h2>
            <p className="text-sm sm:text-base">Personnalisez PatientHub selon vos besoins :</p>
            <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
              <li>Modifier votre profil</li>
              <li>Gérer les paramètres de votre cabinet</li>
              <li>Configurer les notifications</li>
            </ul>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">FAQ</h2>
            <p className="text-sm sm:text-base">Réponses aux questions fréquemment posées :</p>
            <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
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
