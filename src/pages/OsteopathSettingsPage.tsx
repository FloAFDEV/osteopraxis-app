
import { useState, useEffect } from "react";
import { UserCog } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FancyLoader } from "@/components/ui/fancy-loader";

const OsteopathSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.professionalProfileId) {
        try {
          const profileData = await api.getProfessionalProfileById(user.professionalProfileId);
          setProfile(profileData || null);
        } catch (error) {
          console.error("Error fetching professional profile data:", error);
          toast.error("Impossible de charger les données du profil.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [user]);

  const handleSuccess = () => {
    toast.success("Profil mis à jour avec succès");
    navigate("/settings");
  };

  if (!user) {
    return null; // Will be handled by route protection
  }

  if (loading) {
    return <FancyLoader message="Chargement de votre profil..." />;
  }

  return <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8 text-amber-500" />
            Modifier mon profil professionnel
          </h1>
          <p className="text-muted-foreground mt-1">
            Ces informations sont utilisées pour vos factures et documents officiels
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          {profile ? <OsteopathProfileForm defaultValues={profile} osteopathId={profile.id} isEditing={true} onSuccess={handleSuccess} /> : <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Aucun profil professionnel trouvé. Veuillez en créer un.
              </p>
              <OsteopathProfileForm onSuccess={handleSuccess} defaultValues={{
            name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : ""
          }} />
            </div>}
        </div>
      </div>
    </Layout>;
};

export default OsteopathSettingsPage;
