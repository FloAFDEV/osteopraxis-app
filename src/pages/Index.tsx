
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Activity, Info, Users, Calendar, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Index = () => {
  const stats = [
    { 
      value: "35", 
      label: "Patients actifs",
      icon: <Users className="h-5 w-5 text-blue-400" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20" 
    },
    { 
      value: "8", 
      label: "Prochain RDV à 14h30",
      icon: <Calendar className="h-5 w-5 text-purple-400" />,
      bgColor: "bg-purple-50 dark:bg-purple-900/20" 
    },
    { 
      value: "2", 
      label: "+6.1% sur 30 jours",
      icon: <TrendingUp className="h-5 w-5 text-green-400" />,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-500" 
    },
    { 
      value: "15", 
      label: "+75.0% depuis le 1er janvier",
      icon: <Clock className="h-5 w-5 text-purple-400" />,
      bgColor: "bg-purple-50 dark:bg-purple-900/20" 
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                PatientHub
              </h1>
            </div>
            <p className="text-muted-foreground">
              Bienvenue sur votre tableau de bord PatientHub pour ostéopathes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                Version Pro
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                Dernière mise à jour: 9 avril
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className={`overflow-hidden border-0 shadow-sm ${stat.bgColor} rounded-xl`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-4xl font-bold">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.textColor || 'text-gray-600 dark:text-gray-400'}`}>
                      {stat.label}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-sm">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-300 animate-fade-in animate-delay-100 rounded-xl">
          <Info className="h-4 w-4" />
          <AlertTitle>Note sur les données du dashboard</AlertTitle>
          <AlertDescription>
            Ce dashboard affiche actuellement une combinaison de vos données réelles et de données simulées pour démonstration. 
            Les statistiques présentées incluent à la fois vos patients existants dans la base de données et des données de démonstration 
            générées automatiquement.
          </AlertDescription>
        </Alert>
        
        <div className="relative mb-8 overflow-hidden rounded-xl shadow-lg transform hover:scale-[1.01] transition-all duration-500 animate-fade-in animate-delay-200">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 backdrop-blur-sm"></div>
          <img 
            src="https://images.unsplash.com/photo-1581091160550-2173dba999ef?auto=format&fit=crop&w=2000&q=80" 
            alt="Matériel d'ostéopathie"
            className="w-full h-48 object-cover object-center rounded-xl opacity-60 transition-transform duration-1000 hover:scale-105"
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
        
        <div className="animate-fade-in animate-delay-300">
          <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">Graphiques et visualisations</h2>
          <Dashboard />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
