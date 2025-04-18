
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet-form";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { ProfessionalProfile } from "@/types";
import { Building } from "lucide-react";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { toast } from "sonner";

const NewCabinetPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.id) {
          toast.error("Utilisateur non authentifié");
          navigate('/login');
          return;
        }

        const profileData = await api.getProfessionalProfileByUserId(user.id);
        
        if (!profileData) {
          // Aucun profil trouvé, rediriger vers la page de création de profil
          toast.error("Vous devez d'abord créer un profil professionnel");
          navigate('/profile/setup');
          return;
        }
        
        setProfile(profileData);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  if (loading) {
    return <FancyLoader message="Chargement de votre profil..." />;
  }

  if (!profile) {
    return null; // Redirection déjà gérée dans useEffect
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-blue-500" />
            Créer un nouveau cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            Remplissez les informations de votre cabinet
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <CabinetForm 
            professionalProfileId={profile.id} 
            onSuccess={(cabinet) => {
              toast.success("Cabinet créé avec succès!");
              navigate('/cabinets');
            }}
            onCancel={() => navigate('/cabinets')}
          />
        </div>
      </div>
    </Layout>
  );
};

export default NewCabinetPage;
