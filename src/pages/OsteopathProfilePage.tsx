
import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { UserCog, Building } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Osteopath, Cabinet } from "@/types";
import { Button } from "@/components/ui/button";
import { CabinetForm } from "@/components/cabinet-form";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { supabase } from "@/services/supabase-api/utils";

const OsteopathProfilePage = () => {
  const { user, updateUser, loadStoredToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [showCabinetForm, setShowCabinetForm] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const navigate = useNavigate();
  
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
  
  // Vérifier si l'utilisateur a déjà un ostéopathe et des cabinets
  const checkExistingData = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log("Vérification des données existantes pour l'utilisateur:", user.id);
      setLoading(true);
      
      try {
        // Vérifions d'abord si un ostéopathe existe
        const existingOsteopath = await api.getOsteopathByUserId(user.id);
        console.log("Résultat de la recherche d'ostéopathe:", existingOsteopath || "Aucun trouvé");
        
        if (existingOsteopath && existingOsteopath.id) {
          console.log("Ostéopathe trouvé avec ID:", existingOsteopath.id);
          setOsteopath(existingOsteopath);
          
          // Mise à jour de l'utilisateur avec l'ID de l'ostéopathe
          if (!user.osteopathId) {
            console.log("Mise à jour de l'utilisateur avec l'ID de l'ostéopathe:", existingOsteopath.id);
            const updatedUser = { ...user, osteopathId: existingOsteopath.id };
            updateUser(updatedUser);
          }
          
          // Vérifier s'il y a des cabinets existants
          const existingCabinets = await api.getCabinetsByOsteopathId(existingOsteopath.id);
          console.log(`${existingCabinets.length} cabinet(s) trouvé(s) pour l'ostéopathe`);
          setCabinets(existingCabinets);
          
          // Si des cabinets existent, rediriger vers le tableau de bord
          if (existingCabinets && existingCabinets.length > 0) {
            console.log("Cabinets existants trouvés, redirection vers le tableau de bord dans 1 seconde");
            setTimeout(() => {
              navigate("/dashboard");
            }, 1000);
            return;
          } else {
            // Sinon, afficher le formulaire de cabinet
            setShowCabinetForm(true);
          }
        } else {
          // Aucun ostéopathe trouvé, rester sur le formulaire de création
          console.log("Aucun ostéopathe trouvé, formulaire de création nécessaire");
          setOsteopath(null);
          setShowCabinetForm(false);
        }
      } catch (apiError: any) {
        // En cas d'erreur CORS ou réseau, tenter de récupérer l'ostéopathe directement
        console.error("Erreur lors de la récupération de l'ostéopathe:", apiError);
        
        if (apiError.message && (
            apiError.message.includes('CORS') || 
            apiError.message.includes('fetch') || 
            apiError.message.includes('Failed to fetch'))
        ) {
          console.log("Erreur CORS/réseau détectée, tentative de récupération directe");
          
          // Récupération directe via Supabase
          const { data } = await supabase
            .from("Osteopath")
            .select("*")
            .eq("userId", user.id)
            .maybeSingle();
            
          if (data) {
            console.log("Ostéopathe récupéré directement:", data);
            setOsteopath(data as Osteopath);
            
            if (!user.osteopathId && data.id) {
              const updatedUser = { ...user, osteopathId: data.id };
              updateUser(updatedUser);
            }
          } else {
            console.log("Aucun ostéopathe trouvé via récupération directe");
            setOsteopath(null);
          }
        } else {
          throw apiError; // Propager l'erreur si ce n'est pas une erreur CORS
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des données existantes:", error);
      setLoadError("Une erreur est survenue lors de la vérification de vos données");
    } finally {
      setLoading(false);
      setHasAttemptedLoad(true);
    }
  }, [user, navigate, updateUser]);

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
    if (authChecked && user && !hasAttemptedLoad) {
      checkExistingData();
    }
  }, [authChecked, user, checkExistingData, hasAttemptedLoad]);

  const handleRetry = () => {
    setLoading(true);
    setLoadError(null);
    setHasAttemptedLoad(false); // Reset pour permettre une nouvelle tentative
    loadStoredToken().then(() => {
      setTimeout(() => checkExistingData(), 500);
    });
  };

  // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
  if (authChecked && !user) {
    console.log("Redirection vers login: Utilisateur non connecté");
    return <Navigate to="/login" />;
  }

  const handleOsteopathSuccess = async (updatedOsteopath: Osteopath) => {
    console.log("Succès de la mise à jour/création de l'ostéopathe:", updatedOsteopath);
    
    // Si c'est une mise à jour d'un ostéopathe existant
    if (osteopath && osteopath.id) {
      toast.success("Profil mis à jour avec succès");
      
      // Mise à jour de l'utilisateur avec l'ID de l'ostéopathe si nécessaire
      if (!user?.osteopathId && updatedOsteopath.id) {
        const updatedUser = { ...user!, osteopathId: updatedOsteopath.id };
        updateUser(updatedUser);
      }
    } else {
      // Pour un nouveau profil
      toast.success("Profil créé avec succès");
      
      // Mise à jour de l'utilisateur avec l'ID de l'ostéopathe
      if (updatedOsteopath && updatedOsteopath.id && user) {
        const updatedUser = { ...user, osteopathId: updatedOsteopath.id };
        updateUser(updatedUser);
      }
    }
    
    // Mettre à jour l'état local avec l'ostéopathe mis à jour
    setOsteopath(updatedOsteopath);
    
    // Vérifier si des cabinets existent déjà pour cet ostéopathe
    try {
      if (updatedOsteopath.id) {
        const existingCabinets = await api.getCabinetsByOsteopathId(updatedOsteopath.id);
        setCabinets(existingCabinets || []);
        
        // Si des cabinets existent, rediriger vers le tableau de bord
        if (existingCabinets && existingCabinets.length > 0) {
          toast.success("Configuration terminée, redirection vers le tableau de bord");
          navigate("/dashboard");
          return;
        }
      }
      
      // Sinon, afficher le formulaire de cabinet
      setShowCabinetForm(true);
    } catch (error) {
      console.error("Erreur lors de la vérification des cabinets après création de l'ostéopathe:", error);
    }
  };
  
  const handleCabinetSuccess = () => {
    toast.success("Cabinet créé avec succès");
    navigate("/dashboard");
  };

  const handleRelogin = () => {
    // Supprimer les données d'authentification en local et forcer un rechargement complet
    localStorage.removeItem("authState");
    
    // Redirection vers la page de connexion avec le chemin de retour
    window.location.href = `/login?returnTo=${encodeURIComponent('/dashboard')}`;
  };

  if (loading) {
    return <FancyLoader message="Chargement de votre profil..." />;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {!showCabinetForm ? (
          <>
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
                  onSuccess={handleOsteopathSuccess}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Building className="h-8 w-8 text-primary" />
                Créer votre premier cabinet
              </h1>
              <p className="text-muted-foreground mt-1">
                Votre profil professionnel a été créé. Configurez maintenant votre cabinet pour commencer à utiliser l'application.
              </p>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-6">
              {osteopath && (
                <CabinetForm 
                  osteopathId={osteopath.id}
                  onSuccess={handleCabinetSuccess}
                />
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default OsteopathProfilePage;
