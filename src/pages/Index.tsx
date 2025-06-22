import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Activity, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
const Index = () => {
  return <Layout>
      <div className="space-y-8">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700">
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
            <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              Dernière mise à jour: 6 avril 2025
            </div>
          </div>
        </div>
        
        <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-300 animate-fade-in animate-delay-100">
          <Info className="h-4 w-4" />
          <AlertTitle>Note sur les données du dashboard</AlertTitle>
          <AlertDescription>
            Ce dashboard affiche actuellement une combinaison de vos données réelles et de données simulées pour démonstration. 
            Les statistiques présentées incluent à la fois vos patients existants dans la base de données et des données de démonstration 
            générées automatiquement.
          </AlertDescription>
        </Alert>
        
        <div className="relative mb-8 overflow-hidden rounded-xl shadow-lg transform hover:scale-[1.01] transition-all duration-500 animate-fade-in animate-delay-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-500/20 to-blue-500/20 backdrop-blur-sm"></div>
          
          
        </div>
        
        <div className="animate-fade-in animate-delay-300">
          <Dashboard />
        </div>
      </div>
    </Layout>;
};
export default Index;