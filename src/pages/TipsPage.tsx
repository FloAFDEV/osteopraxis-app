import { Layout } from "@/components/ui/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Users, Shield, Clock, FileText, Star } from "lucide-react";

const TipsPage = () => {
  const tips = [
    {
      category: "Gestion des patients",
      icon: Users,
      color: "bg-blue-500",
      items: [
        {
          title: "Organisez vos dossiers patients",
          description: "Utilisez des tags et catégories pour retrouver rapidement vos patients",
          level: "Débutant"
        },
        {
          title: "Photos et documents",
          description: "Ajoutez des photos de posture et scannez les ordonnances pour un suivi complet",
          level: "Intermédiaire"
        },
        {
          title: "Historique médical",
          description: "Complétez systématiquement l'anamnèse pour un diagnostic précis",
          level: "Expert"
        }
      ]
    },
    {
      category: "Planification",
      icon: Clock,
      color: "bg-green-500",
      items: [
        {
          title: "Créneaux optimisés",
          description: "Configurez vos disponibilités pour éviter les créneaux orphelins",
          level: "Débutant"
        },
        {
          title: "Rappels automatiques",
          description: "Activez les notifications pour réduire les absences",
          level: "Intermédiaire"
        },
        {
          title: "Planning partagé",
          description: "Synchronisez avec votre cabinet pour une coordination optimale",
          level: "Expert"
        }
      ]
    },
    {
      category: "Facturation",
      icon: FileText,
      color: "bg-amber-500",
      items: [
        {
          title: "Facturation immédiate",
          description: "Créez vos factures directement après chaque consultation",
          level: "Débutant"
        },
        {
          title: "Suivi des paiements",
          description: "Marquez les factures comme payées pour un suivi précis",
          level: "Intermédiaire"
        },
        {
          title: "Exports comptables",
          description: "Utilisez les exports Excel pour votre comptabilité",
          level: "Expert"
        }
      ]
    },
    {
      category: "Sécurité",
      icon: Shield,
      color: "bg-red-500",
      items: [
        {
          title: "Sauvegarde régulière",
          description: "Exportez vos données régulièrement vers une clé USB sécurisée",
          level: "Essentiel"
        },
        {
          title: "Mot de passe fort",
          description: "Utilisez un gestionnaire de mots de passe pour sécuriser votre compte",
          level: "Essentiel"
        },
        {
          title: "Confidentialité",
          description: "Activez le mode privé lors de consultations pour masquer les montants",
          level: "Expert"
        }
      ]
    },
    {
      category: "Collaboration",
      icon: Users,
      color: "bg-purple-500",
      items: [
        {
          title: "Partage sécurisé",
          description: "Utilisez les codes d'invitation pour ajouter des confrères à votre cabinet",
          level: "Intermédiaire"
        },
        {
          title: "Remplacements",
          description: "Configurez vos remplaçants pour assurer la continuité des soins",
          level: "Expert"
        },
        {
          title: "Export sélectif",
          description: "Partagez uniquement les données nécessaires avec vos confrères",
          level: "Expert"
        }
      ]
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Débutant":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "Intermédiaire":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "Expert":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "Essentiel":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  return (
    <Layout>
      <div className="flex items-start justify-center min-h-screen px-4 mt-16 sm:mt-20">
        <div className="max-w-6xl mx-auto space-y-8 w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-amber-500" />
              Conseils & Bonnes Pratiques
            </h1>
            <p className="text-muted-foreground mt-1">
              Optimisez votre utilisation de OstéoPraxis avec ces conseils d'experts
            </p>
          </div>

          <div className="grid gap-8">
            {tips.map((category, categoryIndex) => {
              const IconComponent = category.icon;
              return (
                <Card key={categoryIndex} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      {category.category}
                    </CardTitle>
                    <CardDescription>
                      Conseils pour optimiser votre {category.category.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {category.items.map((tip, tipIndex) => (
                        <div
                          key={tipIndex}
                          className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{tip.title}</h4>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getLevelColor(tip.level)}`}
                            >
                              {tip.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tip.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Conseil général */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Conseil d'expert
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 dark:text-blue-300">
              <p>
                La clé du succès avec OstéoPraxis réside dans la régularité : 
                prenez 5 minutes après chaque consultation pour compléter le dossier patient 
                et créer la facture. Cette habitude vous fera gagner des heures chaque semaine 
                et garantira un suivi optimal de vos patients.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TipsPage;