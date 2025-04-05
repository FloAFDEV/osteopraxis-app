
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Activity } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-gradient">
                PatientHub
              </h1>
            </div>
            <p className="text-muted-foreground">
              Bienvenue sur votre tableau de bord PatientHub pour ostéopathes
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              Version Pro
            </div>
            <div className="px-3 py-1 rounded-full bg-accent/10 text-accent">
              Dernière mise à jour: 5 avril
            </div>
          </div>
        </div>
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;
