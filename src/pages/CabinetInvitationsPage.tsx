
import { Layout } from "@/components/ui/layout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { CabinetInvitationManager } from "@/components/cabinet/CabinetInvitationManager";
import { BackButton } from "@/components/ui/back-button";
import { Building, Users } from "lucide-react";

const CabinetInvitationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCabinet = async () => {
      if (!id) return;
      
      try {
        const cabinetData = await api.getCabinetById(parseInt(id));
        setCabinet(cabinetData || null);
      } catch (error) {
        console.error("Erreur lors du chargement du cabinet:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCabinet();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!cabinet) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-muted-foreground">Cabinet non trouvé</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <BackButton to="/cabinets" />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-500" />
            Invitations - {cabinet.name}
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Gérez les invitations pour ce cabinet
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <CabinetInvitationManager 
            cabinetId={cabinet.id} 
            cabinetName={cabinet.name} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default CabinetInvitationsPage;
