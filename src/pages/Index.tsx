import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { SmartSkeleton } from "@/components/ui/skeleton-loaders";
import { useOptimization } from "@/contexts/OptimizationContext";

const Index = () => {
  const { loading } = useOptimization();

  return (
    <Layout>
      <div className="space-y-8">
        <div className="animate-fade-in animate-delay-300">
          {loading.initializing ? (
            <SmartSkeleton type="dashboard" />
          ) : (
            <Dashboard />
          )}
        </div>
      </div>
    </Layout>
  );
};
export default Index;