
import { useState, useEffect } from "react";
import { UserCog } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OsteopathSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOsteopathData = async () => {
      if (user?.osteopathId) {
        try {
          const osteopathData = await api.getOsteopathById(user.osteopathId);
          setOsteopath(osteopathData || null);
        } catch (error) {
          console.error("Error fetching osteopath data:", error);
          toast.error("Impossible de charger les données du profil.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadOsteopathData();
  }, [user]);

  const handleSuccess = () => {
    toast.success("Profil mis à jour avec succès");
    navigate("/settings");
  };

  if (!user) {
    return null; // Will be handled by route protection
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            Modifier mon profil professionnel
          </h1>
          <p className="text-muted-foreground mt-1">
            Ces informations sont utilisées pour vos factures et documents officiels
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des informations...</p>
              </div>
            </div>
          ) : osteopath ? (
            <OsteopathProfileForm 
              defaultValues={osteopath}
              osteopathId={osteopath.id}
              isEditing={true}
              onSuccess={handleSuccess}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Aucun profil professionnel trouvé. Veuillez en créer un.
              </p>
              <OsteopathProfileForm 
                onSuccess={handleSuccess}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OsteopathSettingsPage;
