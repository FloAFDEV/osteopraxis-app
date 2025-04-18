
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet-form";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalProfile } from "@/types";

const NewCabinetPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);

  useEffect(() => {
    const checkProfessionalProfile = async () => {
      if (!user) {
        setError("Vous devez être connecté pour créer un cabinet.");
        setLoading(false);
        return;
      }

      try {
        // Si l'utilisateur a déjà un professionalProfileId défini
        if (user.professionalProfileId) {
          const profile = await api.getProfessionalProfileById(user.professionalProfileId);
          if (profile) {
            setProfessionalProfile(profile);
            setLoading(false);
            return;
          }
        }

        // Sinon, essayer de récupérer par userId
        const profile = await api.getProfessionalProfileByUserId(user.id);
        if (profile) {
          setProfessionalProfile(profile);
        } else {
          setError("Vous devez d'abord créer un profil professionnel avant de créer un cabinet.");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du profil professionnel:", err);
        setError("Erreur lors de la récupération du profil professionnel.");
      } finally {
        setLoading(false);
      }
    };

    checkProfessionalProfile();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement...</span>
        </div>
      </Layout>
    );
  }

  if (error || !professionalProfile) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto py-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Impossible de créer un cabinet</h2>
          <p className="mb-6 text-muted-foreground">{error || "Profil professionnel non trouvé."}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/professional-profile")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Créer mon profil professionnel
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-green-500" />
            Nouveau Cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez un nouveau cabinet en remplissant le formulaire ci-dessous.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <CabinetForm
            professionalProfileId={professionalProfile.id}
            onSuccess={() => {
              navigate("/cabinets");
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default NewCabinetPage;
