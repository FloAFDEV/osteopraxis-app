
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Osteopath } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

const osteopathProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  professional_title: z.string().optional(),
  adeli_number: z.string().min(9, {
    message: "Le numéro ADELI doit contenir au moins 9 caractères",
  }),
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
      
      // Petit délai pour s'assurer que l'authentification est bien établie
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Vérifier que l'authentification est toujours valide avec une tentative de rechargement
      await loadStoredToken();
      
      if (!user) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setAuthError(true);
        redirectToLogin();
        return;
      }
      
      let osteopathResult: Osteopath;
      
      if (isEditing && osteopathId) {
        console.log(`Mise à jour de l'ostéopathe (ID: ${osteopathId}) avec les données:`, data);
        // Update existing osteopath
        osteopathResult = await api.updateOsteopath(osteopathId, data);
        toast.success("Profil mis à jour avec succès");
        console.log("Mise à jour réussie:", osteopathResult);
      } else {
        console.log("Création d'un ostéopathe pour l'utilisateur:", user.id);
        // Create new osteopath with delay to ensure auth is ready
        await new Promise(resolve => setTimeout(resolve, 200));
        
        osteopathResult = await api.createOsteopath({
          name: data.name,
          professional_title: data.professional_title || "Ostéopathe D.O.",
          adeli_number: data.adeli_number,
          siret: data.siret || null,
          ape_code: data.ape_code || "8690F",
          userId: user.id
        });
        
        console.log("Création réussie:", osteopathResult);
        toast.success("Profil créé avec succès");
      }
      
      if (onSuccess) {
        onSuccess(osteopathResult);
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

  return (
    <Form {...form}>
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-6">
          <p className="font-medium">Erreur</p>
          <p className="text-sm">{error}</p>
          {authError && (
            <Button 
              variant="outline" 
              className="mt-2 bg-white" 
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
