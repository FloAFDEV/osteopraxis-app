
import { useState, useEffect } from "react";
import { UserCog } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileBillingForm } from "@/components/settings/ProfileBillingForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { BackButton } from "@/components/ui/back-button";

const OsteopathSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState(null);
  const [cabinetLogo, setCabinetLogo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadOsteopathData = async () => {
      if (user?.osteopathId) {
        try {
          const osteopathData = await api.getOsteopathById(user.osteopathId);
          setOsteopath(osteopathData || null);
          
          // Récupérer le logo du cabinet s'il existe
          if (user?.id) {
            const cabinets = await api.getCabinetsByUserId(user.id);
            if (cabinets && cabinets.length > 0 && cabinets[0].logoUrl) {
              setCabinetLogo(cabinets[0].logoUrl);
            }
          }
        } catch (error) {
          console.error("Error fetching osteopath data:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données du profil.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadOsteopathData();
  }, [user, toast]);

  const handleSuccess = () => {
    toast({
      title: "Succès",
      description: "Profil mis à jour avec succès",
      variant: "default",
    });
    // Pas de redirection automatique - rester sur la page
  };

  const handleBackToSettings = () => {
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
          <div className="flex items-center gap-4">
            <UserCog className="h-8 w-8 text-amber-500" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                Profil & Facturation
              </h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos informations professionnelles, données de facturation et tampon
              </p>
            </div>
            {cabinetLogo && (
              <div className="flex-shrink-0">
                <img 
                  src={cabinetLogo} 
                  alt="Logo du cabinet" 
                  className="h-16 w-16 object-contain rounded-lg border bg-white p-2"
                />
              </div>
            )}
          </div>
        </div>

        {/* Toujours afficher le formulaire, qu'il y ait un profil existant ou non */}
        <div className="space-y-4">
          <ProfileBillingForm 
            defaultValues={osteopath || {
              name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ""
            }}
            osteopathId={osteopath?.id} 
            isEditing={!!osteopath} 
            onSuccess={handleSuccess} 
          />
          <div className="flex justify-end">
            <button 
              onClick={handleBackToSettings}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Retour aux paramètres
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OsteopathSettingsPage;
