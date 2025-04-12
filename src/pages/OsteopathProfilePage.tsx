
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { UserCog } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Osteopath } from "@/types";

const OsteopathProfilePage = () => {
  const { user, updateUser, loadStoredToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Rechargement du token d'authentification au montage du composant
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Recharger le token stocké dans le localStorage
        loadStoredToken();
        
        // Petit délai pour s'assurer que l'état est mis à jour
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setAuthChecked(true);
      } catch (error) {
        console.error("Erreur lors de la vérification d'authentification:", error);
        setAuthChecked(true);
      }
    };

    checkAuthentication();
  }, [loadStoredToken]);

  // Vérification et chargement des données à chaque changement de l'état d'authentification
  useEffect(() => {
    if (!authChecked) return;

    const loadOsteopathData = async () => {
      if (!user) {
        setLoading(false);
        setShowAuthSheet(true);
        return;
      }

      try {
        console.log("Loading osteopath data for user:", user.id);
        // Forcer un petit délai pour s'assurer que l'authentification est bien établie
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const osteopathData = await api.getOsteopathByUserId(user.id);
        console.log("Osteopath data received:", osteopathData || "Aucune donnée trouvée");
        setOsteopath(osteopathData || null);
        setLoadError(null);
        setShowAuthSheet(false);
      } catch (error: any) {
        console.error("Error fetching osteopath data:", error);
        
        // Vérifier si l'erreur est liée à l'authentification
        if (error.message?.includes('Not authenticated') || 
            error.message?.includes('Authentication') ||
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('permission denied')) {
          
          // Problème d'authentification, afficher la feuille de connexion
          setShowAuthSheet(true);
          setLoadError("Session expirée ou invalide. Veuillez vous reconnecter.");
        } else {
          setLoadError(error.message || "Erreur lors du chargement des données");
        }
      } finally {
        setLoading(false);
      }
    };

    // Si l'utilisateur change, recharger les données
    if (authChecked) {
      setLoading(true);
      loadOsteopathData();
    }
  }, [user, authChecked]);

  // Si l'utilisateur n'est pas connecté et la feuille d'authentification n'est pas affichée, rediriger vers la connexion
  if (authChecked && !user && !showAuthSheet) {
    console.log("Redirecting to login: No user and auth sheet not shown");
    return <Navigate to="/login" />;
  }

  // Si l'utilisateur a déjà un profil d'ostéopathe complet, rediriger vers les paramètres
  if (user?.osteopathId && !loading && osteopath && Object.keys(osteopath).length > 0 && 
      osteopath.name && osteopath.professional_title) {
    console.log("Redirecting to settings: User has complete osteopath profile");
    return <Navigate to="/settings" />;
  }

  const handleSuccess = (updatedOsteopath: Osteopath) => {
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
      if (updatedOsteopath && updatedOsteopath.id && user) {
        const updatedUser = { ...user, osteopathId: updatedOsteopath.id };
        updateUser(updatedUser);
      }
      
      // Redirection vers la page de création de cabinet après la création du profil
      navigate("/cabinets/new");
    }
  };

  const handleRelogin = () => {
    // Supprimer les données d'authentification en local
    localStorage.removeItem("authState");
    
    // Redirection vers la page de connexion avec le chemin de retour
    window.location.href = `/login?returnTo=${encodeURIComponent('/profile/setup')}`;
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
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleRelogin}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-800 transition-colors"
                >
                  Se reconnecter
                </button>
                {user && (
                  <button
                    onClick={() => {
                      setLoading(true);
                      setLoadError(null);
                      setTimeout(() => {
                        // Essayer de charger à nouveau les données
                        loadStoredToken();
                        // Forcer le rechargement de la page pour s'assurer que tout est frais
                        window.location.reload();
                      }, 500);
                    }}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 transition-colors"
                  >
                    Réessayer
                  </button>
                )}
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
                onClick={handleRelogin}
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
