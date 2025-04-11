
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { UserCog } from "lucide-react";

const OsteopathProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState(null);

  useEffect(() => {
    const loadOsteopathData = async () => {
      if (user) {
        try {
          const osteopathData = await api.getOsteopathByUserId(user.id);
          setOsteopath(osteopathData || null);
        } catch (error) {
          console.error("Error fetching osteopath data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadOsteopathData();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user already has an osteopath profile and not in edit mode, redirect to settings
  if (user.osteopathId && !loading && osteopath) {
    return <Navigate to="/settings" />;
  }

  const handleSuccess = () => {
    // Redirect to cabinet creation page after profile completion
    window.location.href = "/cabinets/new";
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            Compléter votre profil professionnel
          </h1>
          <p className="text-muted-foreground mt-1">
            Ces informations sont nécessaires pour configurer votre cabinet et générer des factures conformes.
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
          ) : (
            <OsteopathProfileForm 
              defaultValues={osteopath || undefined}
              osteopathId={osteopath?.id}
              isEditing={!!osteopath}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OsteopathProfilePage;
