import { Layout } from "@/components/ui/layout";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Activity } from "lucide-react";
const Index = () => {
  return <Layout>
      <div className="space-y-8">
        
        
        <div className="animate-fade-in animate-delay-300">
          <Dashboard />
        </div>
      </div>
    </Layout>;
};
export default Index;