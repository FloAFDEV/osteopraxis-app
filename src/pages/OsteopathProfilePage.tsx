
import { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/ui/layout";
import { OsteopathProfileForm } from "@/components/osteopath-profile-form";
import { UserCog, Building, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Osteopath, Cabinet } from "@/types";
import { Button } from "@/components/ui/button";
import { CabinetForm } from "@/components/cabinet";
import { FancyLoader } from "@/components/ui/fancy-loader";

const OsteopathProfilePage = () => {
  const { user, updateUser, loadStoredToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [showCabinetForm, setShowCabinetForm] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [setupFlow, setSetupFlow] = useState<'profile' | 'cabinet'>('profile');
  const [setupProgress, setSetupProgress] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
      
      // Vérifions d'abord si un ostéopathe existe
      const existingOsteopath = await api.getOsteopathByUserId(user.id);
      console.log("Résultat de la recherche d'ostéopathe:", existingOsteopath || "Aucun trouvé");
      
      if (existingOsteopath && existingOsteopath.id) {
        console.log("Ostéopathe trouvé avec ID:", existingOsteopath.id);
        setOsteopath(existingOsteopath);
        setSetupProgress(50);
        
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
          setSetupProgress(100);
          
          const returnTo = searchParams.get("returnTo") || "/dashboard";
          // Si l'utilisateur a déjà terminé la configuration, rediriger après un court délai
          setTimeout(() => {
            navigate(returnTo);
          }, 1000);
          return;
        } else {
          // Sinon, afficher le formulaire de cabinet
          setSetupFlow('cabinet');
          setShowCabinetForm(true);
        }
      } else {
        // Aucun ostéopathe trouvé, rester sur le formulaire de création
        console.log("Aucun ostéopathe trouvé, formulaire de création nécessaire");
        setOsteopath(null);
        setShowCabinetForm(false);
        setSetupFlow('profile');
        setSetupProgress(0);
      }
      
    } catch (error) {
      console.error("Erreur lors de la vérification des données existantes:", error);
      setLoadError("Une erreur est survenue lors de la vérification de vos données");
    } finally {
      setLoading(false);
      setHasAttemptedLoad(true);
    }
  }, [user, navigate, updateUser, searchParams]);

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

  // Si l'utilisateur n'est pas connecté et la feuille d'authentification n'est pas affichée, rediriger vers la connexion
  if (authChecked && !user && !showAuthSheet) {
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
      toast.success("Profil créé avec succès! Continuons avec votre cabinet.");
      
      // Mise à jour de l'utilisateur avec l'ID de l'ostéopathe
      if (updatedOsteopath && updatedOsteopath.id && user) {
        const updatedUser = { ...user, osteopathId: updatedOsteopath.id };
        updateUser(updatedUser);
      }
    }
    
    // Mettre à jour l'état local avec l'ostéopathe mis à jour
    setOsteopath(updatedOsteopath);
    setSetupProgress(50);
    
    // Vérifier si des cabinets existent déjà pour cet ostéopathe
    try {
      if (updatedOsteopath.id) {
        const existingCabinets = await api.getCabinetsByOsteopathId(updatedOsteopath.id);
        setCabinets(existingCabinets || []);
        
        // Si des cabinets existent, rediriger vers le tableau de bord
        if (existingCabinets && existingCabinets.length > 0) {
          setSetupProgress(100);
          const returnTo = searchParams.get("returnTo") || "/dashboard";
          toast.success("Configuration terminée, redirection vers le tableau de bord");
          setTimeout(() => {
            navigate(returnTo);
          }, 1500);
          return;
        }
      }
      
      // Sinon, afficher le formulaire de cabinet
      setSetupFlow('cabinet');
      setShowCabinetForm(true);
    } catch (error) {
      console.error("Erreur lors de la vérification des cabinets après création de l'ostéopathe:", error);
    }
  };
  
  const handleCabinetSuccess = () => {
    setSetupProgress(100);
    toast.success("Cabinet créé avec succès! Configuration terminée.");
    const returnTo = searchParams.get("returnTo") || "/dashboard";
    
    // Redirection vers le tableau de bord après un court délai
    setTimeout(() => {
      navigate(returnTo);
    }, 1500);
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
      <div className="max-w-4xl mx-auto">
        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`rounded-full flex items-center justify-center w-10 h-10 ${setupFlow === 'profile' || setupProgress >= 50 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                {setupProgress >= 50 ? <CheckCircle className="h-5 w-5" /> : "1"}
              </div>
              <div className={`h-1 w-20 mx-2 ${setupProgress >= 50 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`rounded-full flex items-center justify-center w-10 h-10 ${setupProgress === 100 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : setupFlow === 'cabinet' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                {setupProgress === 100 ? <CheckCircle className="h-5 w-5" /> : "2"}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {setupProgress === 0 && "Configuration du profil professionnel"}
              {setupProgress === 50 && "Configuration du cabinet"}
              {setupProgress === 100 && "Configuration terminée!"}
            </div>
          </div>
        </div>

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

        {/* Étapes du processus d'onboarding */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Processus de configuration de votre compte
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-3 rounded-md flex items-start ${setupFlow === 'profile' || setupProgress >= 50 ? 'bg-green-100/50 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800/30'}`}>
              <div className={`rounded-full p-1.5 mr-3 flex-shrink-0 ${setupProgress >= 50 ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                {setupProgress >= 50 ? <CheckCircle className="h-4 w-4" /> : <UserCog className="h-4 w-4" />}
              </div>
              <div>
                <p className="font-medium text-sm">1. Profil professionnel</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Nom professionnel, titre, numéro ADELI et SIRET</p>
              </div>
            </div>
            <div className={`p-3 rounded-md flex items-start ${setupProgress === 100 ? 'bg-green-100/50 dark:bg-green-900/20' : setupFlow === 'cabinet' ? 'bg-blue-100/50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-800/30'}`}>
              <div className={`rounded-full p-1.5 mr-3 flex-shrink-0 ${setupProgress === 100 ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-300' : setupFlow === 'cabinet' ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                {setupProgress === 100 ? <CheckCircle className="h-4 w-4" /> : <Building className="h-4 w-4" />}
              </div>
              <div>
                <p className="font-medium text-sm">2. Configuration du cabinet</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Nom du cabinet, adresse, coordonnées</p>
              </div>
            </div>
          </div>
          {setupProgress === 100 && (
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Accéder à mon tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
