
import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { UserCog } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Osteopath } from "@/types";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { Button } from "@/components/ui/button";

const OsteopathProfilePage = () => {
  const { user, updateUser, loadStoredToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const navigate = useNavigate();
  const MAX_FETCH_ATTEMPTS = 3;

  // Générer un nom par défaut si first_name et last_name sont manquants
  const getDefaultName = useCallback(() => {
    if (user) {
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      } else if (user.first_name) {
        return user.first_name;
      } else if (user.last_name) {
        return user.last_name;
      } else if (user.email) {
        // Extraire un nom à partir de l'email
        const emailName = user.email.split('@')[0];
        // Capitaliser le nom extrait de l'email et remplacer les points/tirets par des espaces
        return emailName
          .split(/[._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
      }
    }
    return "";
  }, [user]);

  // Fonction pour charger les données de l'ostéopathe (avec limitation des appels)
  const loadOsteopathData = useCallback(async () => {
    if (!user || fetchAttempts >= MAX_FETCH_ATTEMPTS) return;
    
    setFetchAttempts(prev => prev + 1);
    
    try {
      console.log("Tentative de chargement des données d'ostéopathe:", fetchAttempts + 1);
      const osteopathData = await api.getOsteopathByUserId(user.id);
      console.log("Données d'ostéopathe reçues:", osteopathData || "Aucune donnée trouvée");
      setOsteopath(osteopathData || null);
      setLoadError(null);
      setShowAuthSheet(false);
    } catch (error: any) {
      console.error("Error fetching osteopath data:", error);
      
      if (error.message?.includes('Not authenticated') || 
          error.message?.includes('Authentication') ||
          error.message?.includes('permission denied')) {
        
        setShowAuthSheet(true);
        setLoadError("Session expirée ou invalide. Veuillez vous reconnecter.");
      } else {
        setLoadError(error.message || "Erreur lors du chargement des données");
      }
    } finally {
      setLoading(false);
    }
  }, [user, fetchAttempts]);

  // Rechargement du token d'authentification au montage du composant
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log("Vérification de l'authentification...");
        await loadStoredToken();
        setAuthChecked(true);
      } catch (error) {
        console.error("Erreur lors de la vérification d'authentification:", error);
        setAuthChecked(true);
      }
    };

    checkAuthentication();
  }, [loadStoredToken]);

  // Chargement des données quand l'authentification est vérifiée
  useEffect(() => {
    if (authChecked && user && fetchAttempts < MAX_FETCH_ATTEMPTS) {
      loadOsteopathData();
    }
  }, [authChecked, user, loadOsteopathData, fetchAttempts]);

  const handleRetry = () => {
    setLoading(true);
    setLoadError(null);
    setFetchAttempts(0);
    loadStoredToken().then(() => {
      setTimeout(loadOsteopathData, 500);
    });
  };

  // Si l'utilisateur n'est pas connecté et la feuille d'authentification n'est pas affichée, rediriger vers la connexion
  if (authChecked && !user && !showAuthSheet) {
    console.log("Redirection vers login: Utilisateur non connecté");
    return <Navigate to="/login" />;
  }

  // Si l'utilisateur a déjà un profil d'ostéopathe complet, rediriger vers les paramètres
  if (user?.osteopathId && !loading && osteopath && osteopath.name && osteopath.professional_title) {
    console.log("Redirection vers settings: Profil d'ostéopathe complet");
    return <Navigate to="/settings" />;
  }

  const handleSuccess = (updatedOsteopath: Osteopath) => {
    // Si c'est une mise à jour d'un ostéopathe existant
    if (osteopath && osteopath.id) {
      toast.success("Profil mis à jour avec succès");
      
      // Mise à jour de l'utilisateur avec l'ID de l'ostéopathe si nécessaire
      if (!user?.osteopathId && updatedOsteopath.id) {
        const updatedUser = { ...user!, osteopathId: updatedOsteopath.id };
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
    // Supprimer les données d'authentification en local et forcer un rechargement complet
    localStorage.removeItem("authState");
    
    // Redirection vers la page de connexion avec le chemin de retour
    window.location.href = `/login?returnTo=${encodeURIComponent('/profile/setup')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="mt-4 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
          PatientHub
        </span>
        <p className="mt-2 text-muted-foreground text-center">
          Configuration de votre profil professionnel...
        </p>
      </div>
    );
  }

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
          {loadError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded mb-6">
              <p className="font-medium">Erreur lors du chargement</p>
              <p className="text-sm">{loadError}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={handleRelogin}
                  variant="secondary"
                  className="bg-red-100 hover:bg-red-200 dark:bg-red-800/30 dark:hover:bg-red-800/50 text-red-800 dark:text-red-300"
                >
                  Se reconnecter
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          ) : (
            <OsteopathProfileForm 
              defaultValues={{
                ...osteopath,
                // Pré-remplir le nom si l'ostéopathe n'en a pas déjà un
                name: osteopath?.name || getDefaultName()
              }}
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
              Vous devez être connecté pour accéder à cette page. Il semble que votre session a expiré ou est invalide.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleRelogin}
                className="w-full bg-primary text-primary-foreground rounded"
              >
                Se connecter
              </Button>
              <Button 
                onClick={() => navigate("/register")}
                variant="secondary"
                className="w-full"
              >
                S'inscrire
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default OsteopathProfilePage;
