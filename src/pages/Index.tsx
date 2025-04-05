
import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre tableau de bord PatientHub
          </p>
        </div>
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;
