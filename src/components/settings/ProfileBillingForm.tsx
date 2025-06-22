import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Osteopath } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FancyLoader } from "@/components/ui/fancy-loader";
import { supabase } from "@/services/supabase-api/utils";
import { ProfileStampManagement } from "./ProfileStampManagement";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const profileBillingSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  professional_title: z.string().optional(),
  rpps_number: z.string().optional(),
  siret: z.string().optional(),
  ape_code: z.string().optional(),
});

type ProfileBillingFormValues = z.infer<typeof profileBillingSchema>;

interface ProfileBillingFormProps {
  defaultValues?: Partial<ProfileBillingFormValues>;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: (osteopath: Osteopath) => void;
}

export function ProfileBillingForm({
  defaultValues,
  osteopathId,
  isEditing = false,
  onSuccess
}: ProfileBillingFormProps) {
  const { user, updateUser, loadStoredToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [authRetryCount, setAuthRetryCount] = useState(0);
  const [stampUrl, setStampUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const MAX_AUTH_RETRIES = 2;
  
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  
  const redirectToLogin = () => {
    toast.info("Veuillez vous connecter pour continuer");
    window.location.href = "/login?returnTo=" + encodeURIComponent(window.location.pathname + window.location.search);
  };
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlReturnTo = urlParams.get('returnTo');
    const storedReturnUrl = sessionStorage.getItem("profileSetupReturnUrl");
    
    if (urlReturnTo) {
      setReturnUrl(urlReturnTo);
    } else if (storedReturnUrl) {
      setReturnUrl(storedReturnUrl);
    }
  }, []);
  
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!user && authRetryCount < MAX_AUTH_RETRIES) {
          console.log(`Tentative ${authRetryCount + 1}/${MAX_AUTH_RETRIES} de récupération du token...`);
          await loadStoredToken();
          
          setTimeout(() => {
            if (!user) {
              setAuthRetryCount(prev => prev + 1);
            }
          }, 800);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification d'authentification:", error);
      }
    };
    
    verifyAuth();
  }, [loadStoredToken, user, authRetryCount]);

  const form = useForm<ProfileBillingFormValues>({
    resolver: zodResolver(profileBillingSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      professional_title: defaultValues?.professional_title || "Ostéopathe D.O.",
      rpps_number: defaultValues?.rpps_number || "",
      siret: defaultValues?.siret || "",
      ape_code: defaultValues?.ape_code || "8690F",
    },
  });
  
  useEffect(() => {
    if ((defaultValues?.name || (user && (user.firstName || user.lastName))) && !form.getValues('name')) {
      const fullName = defaultValues?.name || 
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
      
      if (fullName) {
        form.setValue('name', fullName);
      }
    }
  }, [defaultValues, user, form]);

  const onSubmit = async (data: ProfileBillingFormValues) => {
    if (!user) {
      await loadStoredToken();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!user) {
        setError("Vous devez être connecté pour effectuer cette action");
        setAuthError(true);
        toast.error("Vous devez être connecté pour effectuer cette action");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log("État de l'authentification avant soumission:");
      console.log("- User présent:", !!user);
      if (user) console.log("- User ID:", user.id);
      
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("- Session Supabase:", sessionData.session ? "Valide" : "Invalide");
      
      if (!sessionData.session) {
        console.log("Session invalide, tentative de rechargement du token");
        await loadStoredToken();
        const { data: newSessionData } = await supabase.auth.getSession();
        console.log("- Nouvelle session après rechargement:", newSessionData.session ? "Valide" : "Invalide");
      }
      
      let osteopathResult: Osteopath;
      
      if (isEditing && osteopathId) {
        console.log(`Mise à jour de l'ostéopathe (ID: ${osteopathId}) avec les données:`, data);
        osteopathResult = await api.updateOsteopath(osteopathId, data) as Osteopath;
        toast.success("Profil mis à jour avec succès");
        console.log("Mise à jour réussie:", osteopathResult);
      } else {
        console.log("Vérification si un profil ostéopathe existe déjà pour l'utilisateur:", user.id);
        try {
          const existingOsteopath = await api.getOsteopathByUserId(user.id);
          
          if (existingOsteopath) {
            console.log("Un profil ostéopathe existe déjà:", existingOsteopath);
            osteopathResult = existingOsteopath;
            
            if (!user.osteopathId && existingOsteopath.id) {
              const updatedUser = { ...user, osteopathId: existingOsteopath.id };
              updateUser(updatedUser);
              console.log("User mis à jour avec l'osteopathId existant:", existingOsteopath.id);
            }
            
            toast.success("Profil ostéopathe déjà existant");
          } else {
            console.log("Aucun profil existant trouvé, création d'un nouveau profil");
            
            const osteopathData = {
              name: data.name,
              professional_title: data.professional_title || "Ostéopathe D.O.",
              rpps_number: data.rpps_number || null,
              siret: data.siret || null,
              ape_code: data.ape_code || "8690F",
              userId: user.id
            };
            
            console.log("Données pour création:", osteopathData);
            osteopathResult = await api.createOsteopath(osteopathData);
            console.log("Création réussie:", osteopathResult);
            
            if (osteopathResult && osteopathResult.id) {
              console.log("Mise à jour de l'utilisateur avec l'ID de l'ostéopathe:", osteopathResult.id);
              
              try {
                const { error: updateError } = await supabase
                  .from("User")
                  .update({ osteopathId: osteopathResult.id })
                  .eq("id", user.id);
                  
                if (updateError) {
                  console.error("Erreur lors de la mise à jour de l'utilisateur avec osteopathId:", updateError);
                } else {
                  console.log("Utilisateur mis à jour avec succès avec osteopathId:", osteopathResult.id);
                }
              } catch (updateError) {
                console.error("Exception lors de la mise à jour de l'utilisateur:", updateError);
              }
              
              const updatedUser = { ...user, osteopathId: osteopathResult.id };
              updateUser(updatedUser);
            }
            
            toast.success("Profil créé avec succès");
          }
        } catch (error) {
          console.error("Erreur lors de la vérification ou création du profil ostéopathe:", error);
          throw error;
        }
      }
      
      if (onSuccess) {
        onSuccess(osteopathResult);
      } else {
        if (returnUrl) {
          console.log("Redirection vers l'URL de retour:", returnUrl);
          sessionStorage.removeItem("profileSetupReturnUrl");
          navigate(returnUrl);
        } else {
          navigate("/settings");
        }
      }
    } catch (error: any) {
      console.error("Error submitting profile form:", error);
      
      if (error.message?.includes('Not authenticated') || 
          error.message?.includes('Authentication') ||
          error.message?.includes('permission denied') ||
          error.message?.includes('Non authentifié') ||
          error.message?.includes('Failed to fetch') ||
          error.status === 401 ||
          error.status === 403) {
          
        setAuthError(true);
        setError("Session expirée. Veuillez vous reconnecter pour continuer.");
        
        localStorage.removeItem("authState");
        
        setTimeout(() => {
          redirectToLogin();
        }, 100);
      } else {
        setError(error.message || "Une erreur est survenue. Veuillez réessayer.");
        toast.error(error.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <FancyLoader message="Enregistrement de votre profil..." />;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded mb-6">
          <p className="font-medium">Erreur</p>
          <p className="text-sm">{error}</p>
          {authError && (
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={redirectToLogin}
            >
              Se connecter
            </Button>
          )}
        </div>
      )}
      
      {!user && (
        <Alert className="mb-6" variant="destructive">
          <AlertTitle>Authentification requise</AlertTitle>
          <AlertDescription>
            Vous devez être connecté pour créer ou modifier votre profil.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={redirectToLogin}
            >
              Se connecter
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section Profil Professionnel */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Profil Professionnel</h2>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom et prénom</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom et prénom complet"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professional_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre professionnel</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || "Ostéopathe D.O."}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre titre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ostéopathe D.O.">Ostéopathe D.O.</SelectItem>
                        <SelectItem value="Ostéopathe">Ostéopathe</SelectItem>
                        <SelectItem value="Ostéopathe MROF">Ostéopathe MROF</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Section Informations de Facturation */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Informations de Facturation</h2>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="rpps_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro RPPS</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Numéro RPPS"
                        disabled={isSubmitting}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Numéro RPPS (Répertoire Partagé des Professionnels de Santé) nécessaire pour la facturation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro SIRET</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Numéro SIRET"
                        disabled={isSubmitting}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Numéro SIRET nécessaire pour la facturation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ape_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code APE / NAF</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Code APE / NAF"
                        disabled={isSubmitting}
                        {...field}
                        value={field.value || "8690F"}
                      />
                    </FormControl>
                    <FormDescription>
                      Code APE/NAF de votre activité (par défaut: 8690F pour les activités de santé humaine)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Section Tampon/Signature */}
          {osteopathId && (
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Tampon et Signature</h2>
              <p className="text-muted-foreground mb-4">
                Ajoutez votre tampon professionnel pour vos factures et documents.
              </p>
              <ProfileStampManagement 
                currentStampUrl={stampUrl}
                onStampUrlChange={setStampUrl}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting || !user} 
            className="w-full"
          >
            {isSubmitting 
              ? "Enregistrement..." 
              : isEditing 
                ? "Mettre à jour le profil" 
                : "Créer mon profil"
            }
          </Button>
        </form>
      </Form>
    </div>
  );
}
