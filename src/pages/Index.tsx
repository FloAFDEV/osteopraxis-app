import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Activity } from "lucide-react";
const Index = () => {
  return <Layout>
      <div className="space-y-8">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 animate-fade-in">
          <div>
            
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