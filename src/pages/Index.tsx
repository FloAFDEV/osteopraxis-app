import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { SmartSkeleton } from "@/components/ui/skeleton-loaders";
import { useOptimization } from "@/contexts/OptimizationContext";
import { useAuth } from "@/contexts/AuthContext";
import LandingPage from "./LandingPage";

const Index = () => {
  const { loading } = useOptimization();
  const { user, isAuthenticated } = useAuth();

  // Si l'utilisateur est connecté (y compris démo), afficher le dashboard
  if (isAuthenticated && user) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="animate-fade-in animate-delay-300">
            <Dashboard />
          </div>
        </div>
      </Layout>
    );
  }

  // Sinon, afficher la landing page
  return <LandingPage />;
};
export default Index;