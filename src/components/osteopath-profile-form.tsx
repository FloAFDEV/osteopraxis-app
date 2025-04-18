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

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

// Schéma de validation assoupli pour permettre l'enregistrement
const osteopathProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  professional_title: z.string().optional(),
  adeli_number: z.string().optional(), // Rendu optionnel pour permettre l'enregistrement
  siret: z.string().optional(),
  ape_code: z.string().optional(),
});

type OsteopathProfileFormValues = z.infer<typeof osteopathProfileSchema>;

interface OsteopathProfileFormProps {
  defaultValues?: Partial<OsteopathProfileFormValues>;
  osteopathId?: number;
  isEditing?: boolean;
  onSuccess?: (osteopath: Osteopath) => void;
}

export function OsteopathProfileForm({
  defaultValues,
  osteopathId,
  isEditing = false,
  onSuccess
}: OsteopathProfileFormProps) {
  const { user, updateUser, loadStoredToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [authRetryCount, setAuthRetryCount] = useState(0);
  const navigate = useNavigate();
  const MAX_AUTH_RETRIES = 2;
  
  // Vérifier l'authentification au chargement du composant et réessayer si nécessaire
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!user && authRetryCount < MAX_AUTH_RETRIES) {
          console.log(`Tentative ${authRetryCount + 1}/${MAX_AUTH_RETRIES} de récupération du token...`);
          await loadStoredToken();
          
          // Si toujours pas d'utilisateur après un délai, réessayer
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

  // Initialiser le formulaire avec les valeurs par défaut, incluant le nom depuis le profil utilisateur si disponible
  const form = useForm<OsteopathProfileFormValues>({
    resolver: zodResolver(osteopathProfileSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      professional_title: defaultValues?.professional_title || "Ostéopathe D.O.",
      adeli_number: defaultValues?.adeli_number || "",
      siret: defaultValues?.siret || "",
      ape_code: defaultValues?.ape_code || "8690F",
    },
  });
  
  // Mettre à jour les valeurs du formulaire si les props defaultValues changent ou si l'utilisateur est chargé
  useEffect(() => {
    if ((defaultValues?.name || (user && (user.first_name || user.last_name))) && !form.getValues('name')) {
      const fullName = defaultValues?.name || 
        `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
      
      if (fullName) {
        form.setValue('name', fullName);
      }
    }
  }, [defaultValues, user, form]);

  const redirectToLogin = () => {
    toast.info("Veuillez vous connecter pour continuer");
    // Force un rechargement de la page vers login pour s'assurer que l'état d'authentification est bien réinitialisé
    window.location.href = "/login?returnTo=" + encodeURIComponent(window.location.pathname);
  };

  const onSubmit = async (data: OsteopathProfileFormValues) => {
  if (!user) {
    // Essayer de recharger le token une dernière fois
    await loadStoredToken();
    
    // Vérifier à nouveau après un délai
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Si toujours pas d'utilisateur, afficher l'erreur
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
    
    // Log détaillé de l'état d'authentification
    console.log("État de l'authentification avant soumission:");
    console.log("- User présent:", !!user);
    if (user) console.log("- User ID:", user.id);
    
    // Vérifier que la session Supabase est valide
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
      // Mapping to ProfessionalProfile expected properties
      const profileData = {
        name: data.name,
        title: data.professional_title || "Ostéopathe D.O.", 
        adeli_number: data.adeli_number || null,
        siret: data.siret || null,
        ape_code: data.ape_code || "8690F",
        profession_type: "osteopathe" as const,
        updatedAt: new Date().toISOString()
      };
      
      // Update existing osteopath
      osteopathResult = await api.updateOsteopath(osteopathId, profileData) as Osteopath;
      toast.success("Profil mis à jour avec succès");
      console.log("Mise à jour réussie:", osteopathResult);
    } else {
      console.log("Création d'un ostéopathe pour l'utilisateur:", user.id);
      
      // Mapping to expected properties
      const profileData = {
        name: data.name,
        title: data.professional_title || "Ostéopathe D.O.",
        adeli_number: data.adeli_number || null,
        siret: data.siret || null,
        ape_code: data.ape_code || "8690F",
        profession_type: "osteopathe" as const,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log("Données pour création:", profileData);
      
      try {
        osteopathResult = await api.createOsteopath(profileData);
        console.log("Création réussie:", osteopathResult);
        toast.success("Profil créé avec succès");
      } catch (createError: any) {
        console.error("Erreur lors de la création de l'ostéopathe:", createError);
        
        // Si l'erreur est liée à l'authentification, réessayer avec la fonction edge
        if (createError.message?.includes('auth') || createError.message?.includes('permission') || 
            createError.status === 401 || createError.status === 403) {
          
          console.log("Tentative alternative via la fonction edge");
          
          // Vérifier à nouveau la session
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session || !sessionData.session.access_token) {
            throw new Error("Token d'authentification manquant");
          }
          
          const response = await fetch("https://jpjuvzpqfirymtjwnier.supabase.co/functions/v1/completer-profil", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${sessionData.session.access_token}`
            },
            body: JSON.stringify({ osteopathData: profileData })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur de la fonction edge: ${errorText}`);
          }
          
          const result = await response.json();
          console.log("Résultat de la fonction edge:", result);
          
          if (!result.success || !result.osteopath) {
            throw new Error("Échec de la création du profil");
          }
          
          osteopathResult = result.osteopath;
          toast.success("Profil créé avec succès (via fonction alternative)");
        } else {
          throw createError;
        }
      }
    }
    
    // Mise à jour de l'utilisateur avec l'ID de l'ostéopathe
    if (user && osteopathResult && osteopathResult.id) {
      console.log("Mise à jour de l'utilisateur avec l'ID de l'ostéopathe:", osteopathResult.id);
      const updatedUser = { ...user, professionalProfileId: osteopathResult.id };
      updateUser(updatedUser);
    }
    
    if (onSuccess) {
      onSuccess(osteopathResult);
    } else {
      // Rediriger vers le dashboard si aucune fonction de succès spécifiée
      navigate("/dashboard");
    }
  } catch (error: any) {
    console.error("Error submitting osteopath form:", error);
      
      // Check for auth errors
      if (error.message?.includes('Not authenticated') || 
          error.message?.includes('Authentication') ||
          error.message?.includes('permission denied') ||
          error.message?.includes('Non authentifié') ||
          error.message?.includes('Failed to fetch') ||
          error.status === 401 ||
          error.status === 403) {
          
        setAuthError(true);
        setError("Session expirée. Veuillez vous reconnecter pour continuer.");
        
        // Force un rechargement complet de l'auth
        localStorage.removeItem("authState");
        
        // Attendre un peu avant de rediriger
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
    <Form {...form}>
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
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <FormField
          control={form.control}
          name="adeli_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro ADELI</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Numéro ADELI"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

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
  );
}
