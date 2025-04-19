
import { useState, useEffect } from "react";
import { Building } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { Cabinet } from "@/types";

const CabinetSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCabinetData = async () => {
      if (!user?.professionalProfileId) {
        navigate("/professional-profile");
        return;
      }
      
      try {
        // Get all cabinets for this professional
        const cabinets = await api.getCabinetsByProfessionalProfileId(user.professionalProfileId);
        
        // For now, we'll just use the first cabinet
        // In a future version, we could allow selection from multiple cabinets
        if (cabinets && cabinets.length > 0) {
          setCabinet(cabinets[0]);
        }
      } catch (error) {
        console.error("Error fetching cabinet data:", error);
        toast.error("Impossible de charger les données du cabinet.");
      } finally {
        setLoading(false);
      }
    };
    loadCabinetData();
  }, [user, navigate]);

  const handleSuccess = () => {
    toast.success("Cabinet mis à jour avec succès");
    navigate("/settings");
  };

  if (!user) {
    return null; // Will be handled by route protection
  }

  if (loading) {
    return <FancyLoader message="Chargement des données du cabinet..." />;
  }

  return <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            {cabinet ? "Modifier mon cabinet" : "Créer mon cabinet"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Ces informations sont utilisées pour vos factures et communications professionnelles
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          {cabinet ? (
            <CabinetForm
              defaultValues={cabinet}
              cabinetId={cabinet.id}
              professionalProfileId={user.professionalProfileId!}
              isEditing={true}
              onSuccess={handleSuccess}
            />
          ) : (
            user.professionalProfileId ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Aucun cabinet trouvé. Veuillez en créer un.
                </p>
                <CabinetForm
                  professionalProfileId={user.professionalProfileId}
                  onSuccess={handleSuccess}
                />
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Vous devez d'abord créer un profil professionnel avant de pouvoir ajouter un cabinet.
                </p>
                <Button onClick={() => navigate("/professional-profile")}>
                  Créer mon profil professionnel
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>;
};

export default CabinetSettingsPage;
