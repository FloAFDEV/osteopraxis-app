
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Building2, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { Cabinet } from "@/types";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isCabinetOwnedByCurrentOsteopath } from "@/services";

const EditCabinetPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [osteopathData, setOsteopathData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Vérifier que le cabinet appartient à l'ostéopathe connecté
        const cabinetId = parseInt(id);
        const isCabinetOwned = await isCabinetOwnedByCurrentOsteopath(cabinetId);
        
        if (!isCabinetOwned) {
          console.error(`TENTATIVE D'ACCÈS NON AUTORISÉ: Tentative d'édition du cabinet ${id} qui n'appartient pas à l'ostéopathe connecté`);
          toast.error("Vous n'avez pas accès à ce cabinet");
          navigate("/cabinets");
          return;
        }
        
        const cabinetData = await api.getCabinetById(cabinetId);
        if (!cabinetData) {
          throw new Error("Cabinet non trouvé");
        }
        setCabinet(cabinetData);

        // Récupérer les données de l'ostéopathe pour les infos de facturation
        if (cabinetData.osteopathId) {
          const osteopathInfo = await api.getOsteopathById(cabinetData.osteopathId);
          if (osteopathInfo) {
            setOsteopathData(osteopathInfo);
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
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground text-lg">Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!cabinet) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Cabinet non trouvé</h3>
              <p className="text-muted-foreground">
                Le cabinet que vous recherchez n&apos;existe pas ou a été supprimé.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/cabinets">
                Retour aux cabinets
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header compact */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/cabinets")}
                className="flex items-center space-x-2 hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Modifier le Cabinet
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {cabinet.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire dans une carte moderne */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              {cabinet && (
                <CabinetForm 
                  defaultValues={{
                    name: cabinet.name,
                    address: cabinet.address,
                    phone: cabinet.phone || undefined,
                    email: cabinet.email || undefined,
                    imageUrl: cabinet.imageUrl || undefined,
                    logoUrl: cabinet.logoUrl || undefined,
                    osteopathId: cabinet.osteopathId,
                    siret: osteopathData?.siret || undefined,
                    rppsNumber: osteopathData?.rpps_number || undefined,
                    apeCode: osteopathData?.ape_code || "8690F",
                    stampUrl: osteopathData?.stampUrl || undefined
                  }} 
                  cabinetId={cabinet.id} 
                  isEditing={true} 
                  osteopathId={cabinet.osteopathId} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditCabinetPage;
