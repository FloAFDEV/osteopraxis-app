
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Building2, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { Cabinet, ProfessionalProfile } from "@/types";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const EditCabinetPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [professionalData, setProfessionalData] = useState<ProfessionalProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const cabinetData = await api.getCabinetById(parseInt(id));
        if (!cabinetData) {
          throw new Error("Cabinet non trouvé");
        }
        setCabinet(cabinetData);

        // Récupérer les données du professionnel pour les infos de facturation
        if (cabinetData.professionalProfileId) {
          const profileInfo = await api.getProfessionalProfileById(cabinetData.professionalProfileId);
          if (profileInfo) {
            setProfessionalData(profileInfo);
          }
        }
      } catch (error) {
        console.error("Error fetching cabinet:", error);
        toast.error("Impossible de charger les données du cabinet. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </Layout>;
  }

  if (!cabinet) {
    return <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h3 className="text-xl font-medium">Cabinet non trouvé</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Le cabinet que vous recherchez n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/cabinets">
              Retour aux cabinets
            </Link>
          </Button>
        </div>
      </Layout>;
  }

  return <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2" 
            onClick={() => navigate("/cabinets")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux cabinets
          </Button>
          
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-green-500" />
            Modifier le Cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifiez les détails du cabinet en utilisant le formulaire ci-dessous.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <CabinetForm 
            defaultValues={cabinet}
            cabinetId={cabinet.id}
            professionalProfileId={cabinet.professionalProfileId}
            onSuccess={() => {
              toast.success("Cabinet mis à jour avec succès");
              navigate("/cabinets");
            }}
          />
        </div>
      </div>
    </Layout>;
};

export default EditCabinetPage;
