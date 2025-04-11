
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { UserCog } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const OsteopathProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOsteopathData = async () => {
      if (!user) {
        setLoading(false);
        setShowAuthSheet(true);
        return;
      }

      try {
        console.log("Loading osteopath data for user:", user.id);
        const osteopathData = await api.getOsteopathByUserId(user.id);
        console.log("Osteopath data received:", osteopathData || "Aucune donnée trouvée");
        setOsteopath(osteopathData || null);
        setLoadError(null);
      } catch (error: any) {
        console.error("Error fetching osteopath data:", error);
        setLoadError(error.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadOsteopathData();
  }, [user]);

  // Si l'utilisateur n'est pas connecté et la feuille d'authentification n'est pas affichée, rediriger vers la connexion
  if (!user && !showAuthSheet) {
    return <Navigate to="/login" />;
  }

  // Si l'utilisateur a déjà un profil d'ostéopathe complet, rediriger vers les paramètres
  if (user?.osteopathId && !loading && osteopath && Object.keys(osteopath).length > 0 && 
      osteopath.name && osteopath.professional_title) {
    return <Navigate to="/settings" />;
  }

  const handleSuccess = async (updatedOsteopath) => {
    // Si c'est une mise à jour d'un ostéopathe existant
    if (osteopath && osteopath.id) {
      toast.success("Profil mis à jour avec succès");
      
      // Mise à jour de l'utilisateur avec l'ID de l'ostéopathe si nécessaire
      if (!user.osteopathId && updatedOsteopath.id) {
        const updatedUser = { ...user, osteopathId: updatedOsteopath.id };
        updateUser(updatedUser);
      }
      
      navigate("/settings");
    } else {
      // Pour un nouveau profil
      toast.success("Profil créé avec succès");
      
      // Mise à jour de l'utilisateur avec l'ID de l'ostéopathe
      if (updatedOsteopath && updatedOsteopath.id) {
        const updatedUser = { ...user, osteopathId: updatedOsteopath.id };
        updateUser(updatedUser);
      }
      
      // Redirection vers la page de création de cabinet après la création du profil
      navigate("/cabinets/new");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            {osteopath && osteopath.id ? "Mettre à jour votre profil professionnel" : "Compléter votre profil professionnel"}
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
          ) : loadError ? (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-6">
              <p className="font-medium">Erreur lors du chargement</p>
              <p className="text-sm">{loadError}</p>
              <div className="mt-4">
                <OsteopathProfileForm 
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          ) : (
            <OsteopathProfileForm 
              defaultValues={osteopath || undefined}
              osteopathId={osteopath?.id}
              isEditing={!!osteopath?.id}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
      
      {/* Authentication Sheet */}
      <Sheet open={showAuthSheet} onOpenChange={setShowAuthSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Authentification requise</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder à cette page.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => navigate("/login")}
                className="w-full bg-primary text-primary-foreground rounded px-4 py-2 hover:bg-primary/90 transition-colors"
              >
                Se connecter
              </button>
              <button 
                onClick={() => navigate("/register")}
                className="w-full bg-secondary text-secondary-foreground rounded px-4 py-2 hover:bg-secondary/90 transition-colors"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default OsteopathProfilePage;
