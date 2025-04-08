
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Activity, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                PatientHub
              </h1>
            </div>
            <p className="text-muted-foreground">
              Bienvenue sur votre tableau de bord PatientHub pour ostéopathes
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              Version Pro
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
              Dernière mise à jour: 6 avril
            </div>
          </div>
        </div>
        
        <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-300">
          <Info className="h-4 w-4" />
          <AlertTitle>Note sur les données du dashboard</AlertTitle>
          <AlertDescription>
            Ce dashboard affiche actuellement une combinaison de vos données réelles et de données simulées pour démonstration. 
            Les statistiques présentées incluent à la fois vos patients existants dans la base de données et des données de démonstration 
            générées automatiquement.
          </AlertDescription>
        </Alert>
        
        <div className="relative mb-8 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm"></div>
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80" 
            alt="Matériel d'ostéopathie"
            className="w-full h-48 object-cover object-center rounded-xl opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h2 className="text-2xl font-bold text-white drop-shadow-md mb-2">
                Simplifiez la gestion de votre cabinet
              </h2>
              <p className="text-white/90 max-w-lg mx-auto drop-shadow-md">
                Concentrez-vous sur vos patients pendant que PatientHub s'occupe de tout le reste
              </p>
            </div>
          </div>
        </div>
        
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;
