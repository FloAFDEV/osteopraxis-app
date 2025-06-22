
import { useState, useEffect } from "react";
import { UserCog } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileBillingForm } from "@/components/settings/ProfileBillingForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { BackButton } from "@/components/ui/back-button";

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
    return null;
  }

  if (loading) {
    return <FancyLoader message="Chargement de votre profil..." />;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <BackButton to="/settings" />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8 text-amber-500" />
            Profil & Facturation
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos informations professionnelles, données de facturation et tampon
          </p>
        </div>

        {osteopath ? (
          <ProfileBillingForm 
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
            <ProfileBillingForm 
              onSuccess={handleSuccess} 
              defaultValues={{
                name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ""
              }} 
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OsteopathSettingsPage;
