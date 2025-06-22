
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Activity } from "lucide-react";

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
        </div>
        
        <div className="animate-fade-in animate-delay-300">
          <Dashboard />
        </div>
      </div>
    </Layout>;
};

export default Index;
