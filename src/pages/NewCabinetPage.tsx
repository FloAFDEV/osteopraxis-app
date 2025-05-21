
import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { Layout } from "@/components/ui/layout";
import { CabinetForm } from "@/components/cabinet";
import { api } from "@/services/api";
import { AuthState } from "@/types";
import { toast } from "sonner";

const NewCabinetPage = () => {
  const [osteopathId, setOsteopathId] = useState<number>(1); // Valeur par défaut
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Essayer de récupérer l'ostéopathe connecté
    const getUserOsteopath = async () => {
      try {
        // Dans un vrai cas, on récupérerait l'ostéopathe lié à l'utilisateur actuel
        // Ici on utilise juste la première valeur disponible
        const authData = localStorage.getItem("authState");
        if (authData) {
          const auth: AuthState = JSON.parse(authData);
          if (auth.user?.osteopathId) {
            setOsteopathId(auth.user.osteopathId);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'ostéopathe:", error);
        toast.error("Impossible de récupérer votre identifiant d'ostéopathe.");
      } finally {
        setLoading(false);
      }
    };

    getUserOsteopath();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
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
            <Building2 className="h-8 w-8 text-primary" />
            Nouveau Cabinet
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez un nouveau cabinet en remplissant le formulaire ci-dessous.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <CabinetForm osteopathId={osteopathId} />
        </div>
      </div>
    </Layout>
  );
};

export default NewCabinetPage;
