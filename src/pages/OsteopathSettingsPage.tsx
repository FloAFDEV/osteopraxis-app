import { useState, useEffect } from "react";
import { UserCog } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileBillingForm } from "@/components/settings/ProfileBillingForm";
import { GoogleCalendarIntegration } from "@/components/settings/GoogleCalendarIntegration";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { BackButton } from "@/components/ui/back-button";
import { HelpButton } from "@/components/ui/help-button";
import { ProfileSecuritySettings } from "@/components/settings/ProfileSecuritySettings";

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
          toast.error("Erreur", {
            description: "Impossible de charger les données du profil."
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
    toast.success("Succès", {
      description: "Profil mis à jour avec succès"
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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">
                  Profil & Facturation
                </h1>
                <HelpButton 
                  content="Configurez vos informations professionnelles (nom, titre), vos données de facturation (RPPS, SIRET) et uploadez votre tampon professionnel. Ces informations sont essentielles pour la génération de factures conformes et de documents officiels."
                />
              </div>
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

        <div className="space-y-6">
          {/* Google Calendar Integration */}
          <GoogleCalendarIntegration />

          {/* Profile & Billing Form */}
          <ProfileBillingForm 
            currentOsteopath={osteopath}
            osteopathId={osteopath?.id} 
            isEditing={!!osteopath} 
            onSuccess={handleSuccess} 
          />

          {/* Sécurité du stockage local */}
          <ProfileSecuritySettings />
          
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
