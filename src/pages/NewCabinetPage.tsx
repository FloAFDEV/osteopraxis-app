
import { useNavigate } from "react-router-dom";
import { Building, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/ui/layout";
import { useAuth } from "@/contexts/AuthContext";
import { CabinetForm } from "@/components/cabinet-form";
import { Cabinet } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const NewCabinetPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If there's no user or professional profile ID, redirect to profile page
  if (!user?.professionalProfileId) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Profil professionnel requis</h3>
            <p>
              Vous devez d'abord créer un profil professionnel avant de créer un cabinet.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate("/professional-profile")}
            >
              Créer mon profil professionnel
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCabinetCreated = (cabinet: Cabinet) => {
    toast.success("Le cabinet a été créé avec succès !");
    navigate("/cabinets");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => navigate("/cabinets")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux cabinets
          </Button>

          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            Créer un nouveau cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            Renseignez les informations de votre cabinet pour l'afficher sur vos documents et communications
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <CabinetForm
            professionalProfileId={user.professionalProfileId}
            onSuccess={handleCabinetCreated}
          />
        </div>
      </div>
    </Layout>
  );
};

export default NewCabinetPage;
