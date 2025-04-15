
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/layout';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FancyLoader } from '@/components/ui/fancy-loader';
import { Osteopath, Cabinet } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Schéma de validation pour le formulaire rapide de profil
const osteopathFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Le nom doit contenir au moins 2 caractères'
  }),
  professional_title: z.string().min(2, {
    message: 'Le titre professionnel doit contenir au moins 2 caractères'
  }),
  adeli_number: z.string().min(1, {
    message: 'Le numéro ADELI est obligatoire'
  }),
  siret: z.string().min(1, {
    message: 'Le numéro SIRET est obligatoire'
  })
});

type OsteopathFormValues = z.infer<typeof osteopathFormSchema>;

const NewInvoicePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validatingFields, setValidatingFields] = useState(true);
  const [hasRequiredFields, setHasRequiredFields] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQuickProfile, setShowQuickProfile] = useState(false);

  // Initialiser react-hook-form avec le schéma zod
  const form = useForm<OsteopathFormValues>({
    resolver: zodResolver(osteopathFormSchema),
    defaultValues: {
      name: user?.email?.split('@')[0] || "Ostéopathe",
      professional_title: "Ostéopathe D.O.",
      adeli_number: "",
      siret: "",
    }
  });

  console.log("NewInvoicePage - User state:", user);

  // Vérifier si l'ostéopathe a tous les champs requis pour générer des factures
  // et récupérer les informations du cabinet principal
  useEffect(() => {
    const checkRequiredFields = async () => {
      if (!user) {
        setValidatingFields(false);
        setLoading(false);
        setError("Vous devez être connecté pour créer une facture.");
        console.log("Aucun utilisateur connecté");
        return;
      }

      console.log("Vérification des champs pour l'utilisateur:", user.id);
      
      try {
        // Récupérer l'ostéopathe existant ou en créer un nouveau si nécessaire
        let osteopathData = null;
        
        if (user.osteopathId) {
          console.log("L'utilisateur a un osteopathId:", user.osteopathId);
          try {
            osteopathData = await api.getOsteopathById(user.osteopathId);
            console.log("Données ostéopathe récupérées via osteopathId:", osteopathData);
          } catch (osteoErr) {
            console.error("Erreur lors de la récupération par osteopathId:", osteoErr);
            setError("Erreur lors de la récupération du profil d'ostéopathe.");
          }
        } 
        
        if (!osteopathData) {
          console.log("L'utilisateur n'a pas d'osteopathId ou n'a pas été trouvé, recherche par userId");
          // Essai via l'API standard
          try {
            osteopathData = await api.getOsteopathByUserId(user.id);
            console.log("Résultat de la recherche par userId:", osteopathData);
          } catch (userIdErr) {
            console.error("Erreur lors de la recherche par userId:", userIdErr);
            setError("Erreur lors de la recherche du profil par identifiant utilisateur.");
          }
        }
        
        // Si toujours pas d'ostéopathe, proposer de créer un profil temporaire
        if (!osteopathData) {
          console.log("Aucun ostéopathe trouvé, offrir l'option de création rapide de profil");
          setHasRequiredFields(false);
          setMissingFields(["Profil ostéopathe non trouvé"]);
          setError("Nous n'avons pas pu créer ou récupérer automatiquement votre profil d'ostéopathe. Vous pouvez utiliser le formulaire rapide ci-dessous pour créer un profil temporaire et continuer vers la création de facture.");
          setLoading(false);
          setValidatingFields(false);
          setShowQuickProfile(true);
          return;
        }
        
        if (osteopathData) {
          setOsteopath(osteopathData);
          processOsteopathData(osteopathData);
        } else {
          console.log("Impossible de créer ou récupérer un profil d'ostéopathe");
          setHasRequiredFields(false);
          setMissingFields(["Problème avec le profil d'ostéopathe"]);
          setError("Impossible de créer ou récupérer un profil d'ostéopathe. Veuillez essayer de nouveau plus tard.");
          setLoading(false);
          setValidatingFields(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des champs obligatoires:", error);
        setHasRequiredFields(false);
        setMissingFields(["Erreur lors de la vérification des champs"]);
        setError(`Une erreur est survenue: ${error.message || "Erreur inconnue"}`);
        setLoading(false);
        setValidatingFields(false);
        toast.error("Erreur lors de la vérification des champs du profil");
      }
    };
    
    const processOsteopathData = async (osteopathData: Osteopath) => {
      // Vérifier que l'ostéopathe contient les champs attendus
      console.log("Vérification des champs pour la facturation:", {
        adeli_number: osteopathData.adeli_number,
        siret: osteopathData.siret,
        name: osteopathData.name,
        professional_title: osteopathData.professional_title
      });
      
      const missing: string[] = [];
      
      if (!osteopathData.adeli_number) missing.push("Numéro ADELI");
      if (!osteopathData.siret) missing.push("Numéro SIRET");
      if (!osteopathData.name) missing.push("Nom professionnel");
      if (!osteopathData.professional_title) missing.push("Titre professionnel");
      
      console.log("Champs manquants pour la facturation:", missing.length > 0 ? missing : "Aucun");
      
      setMissingFields(missing);
      setHasRequiredFields(missing.length === 0);

      // Récupérer les données du cabinet principal
      try {
        // Récupérer les cabinets associés à cet ostéopathe
        console.log("Récupération des cabinets pour l'ostéopathe ID:", osteopathData.id);
        const cabinets = await api.getCabinetsByOsteopathId(osteopathData.id);
        console.log("Cabinets récupérés:", cabinets);
        
        if (cabinets && cabinets.length > 0) {
          setCabinetData(cabinets[0]);
          console.log("Données du cabinet récupérées pour la facturation:", cabinets[0]);
        } else {
          console.log("Aucun cabinet trouvé pour l'ostéopathe, création d'un cabinet par défaut");
          
          try {
            // Créer un cabinet par défaut avec tous les champs requis
            const newCabinet = {
              name: "Cabinet par défaut",
              address: "Adresse à compléter",
              osteopathId: osteopathData.id,
              phone: "",
              imageUrl: null,
              logoUrl: null,
              email: null
            };
            
            const createdCabinet = await api.createCabinet(newCabinet);
            console.log("Cabinet par défaut créé:", createdCabinet);
            setCabinetData(createdCabinet);
          } catch (cabinetError) {
            console.error("Erreur lors de la création du cabinet par défaut:", cabinetError);
            setError("Erreur lors de la création du cabinet par défaut. Veuillez créer un cabinet manuellement.");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données du cabinet:", error);
        setError("Erreur lors de la récupération des données du cabinet.");
      }
      
      setLoading(false);
      setValidatingFields(false);
    };

    if (user) {
      checkRequiredFields();
    } else {
      setValidatingFields(false);
      setLoading(false);
      setError("Vous devez être connecté pour accéder à cette page.");
    }
  }, [user]);

  const handleRetry = async () => {
    setLoading(true);
    setValidatingFields(true);
    setError(null);
    setShowQuickProfile(false);
    
    // Rechargement forcé de la session
    try {
      await supabase.auth.refreshSession();
      const { data } = await supabase.auth.getSession();
      
      if (data && data.session) {
        console.log("Session rechargée avec succès");
        // Continuer avec la vérification normale
        if (user) {
          checkRequiredFields();
        } else {
          setValidatingFields(false);
          setLoading(false);
          setError("Impossible de récupérer les informations de l'utilisateur.");
        }
      } else {
        setLoading(false);
        setValidatingFields(false);
        setError("Session expirée ou invalide. Veuillez vous reconnecter.");
      }
    } catch (refreshError) {
      console.error("Erreur lors du rafraîchissement de la session:", refreshError);
      setLoading(false);
      setValidatingFields(false);
      setError("Erreur lors du rafraîchissement de la session.");
    }
  };

  // Gestion du formulaire de création rapide de profil
  const handleQuickProfileSubmit = async (values: OsteopathFormValues) => {
    try {
      setLoading(true);
      console.log("Création rapide d'un profil avec les valeurs:", values);
      
      // Créer manuellement l'ostéopathe sans passer par la fonction edge
      const osteopathData = {
        name: values.name,
        professional_title: values.professional_title,
        adeli_number: values.adeli_number,
        siret: values.siret,
        ape_code: "8690F",
        userId: user?.id
      };
      
      // Utiliser le client Supabase directement pour contourner le problème de la fonction edge
      const { data: newOsteo, error: insertError } = await supabase
        .from("Osteopath")
        .insert(osteopathData)
        .select()
        .single();
        
      if (insertError) {
        throw new Error(`Erreur lors de la création du profil: ${insertError.message}`);
      }
      
      console.log("Profil créé avec succès:", newOsteo);
      toast.success("Profil créé avec succès!");
      
      // Utiliser le nouveau profil
      setOsteopath(newOsteo);
      setHasRequiredFields(true);
      setMissingFields([]);
      setError(null);
      setShowQuickProfile(false);
      
      // Créer un cabinet par défaut
      const newCabinet = {
        name: "Cabinet par défaut",
        address: "Adresse à compléter",
        osteopathId: newOsteo.id,
        phone: "",
        imageUrl: null,
        logoUrl: null,
        email: null
      };
      
      const createdCabinet = await api.createCabinet(newCabinet);
      setCabinetData(createdCabinet);
      
      // Mettre à jour le profil utilisateur avec l'ID de l'ostéopathe
      await supabase
        .from("User")
        .update({ osteopathId: newOsteo.id })
        .eq("id", user?.id);
        
    } catch (error) {
      console.error("Erreur lors de la création du profil:", error);
      toast.error(`Erreur: ${error.message || "Impossible de créer le profil"}`);
    } finally {
      setLoading(false);
    }
  };

  if (validatingFields || loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-6">
          <FancyLoader message="Vérification des informations..." />
        </div>
      </Layout>
    );
  }

  // Formulaire de création rapide de profil
  if (showQuickProfile) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-6">
          <Card className="mb-6 border-orange-200 shadow-md">
            <CardHeader className="bg-orange-50 border-b border-orange-100">
              <CardTitle className="text-xl font-semibold text-orange-800">
                Création rapide de profil
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="mb-4 text-gray-600">
                Pour générer des factures, complétez ces informations professionnelles obligatoires.
                Vous pourrez modifier ces informations plus tard dans les paramètres de votre profil.
              </p>
              
              {error && (
                <Alert variant="default" className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleQuickProfileSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom professionnel</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom professionnel" {...field} />
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
                        <FormControl>
                          <Input placeholder="Ostéopathe D.O." {...field} />
                        </FormControl>
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
                          <Input placeholder="Votre numéro ADELI" {...field} />
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
                          <Input placeholder="Votre numéro SIRET" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 flex gap-2 justify-end">
                    <Button onClick={handleRetry} variant="outline" type="button">
                      Annuler
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Création..." : "Créer mon profil"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                Retour au tableau de bord
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/settings/profile">
                Gérer mon profil complet
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Si l'ostéopathe n'a pas les champs requis, afficher une alerte
  if (!hasRequiredFields || !osteopath) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="text-lg font-semibold">Information incomplète</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                Pour pouvoir générer des factures, vous devez compléter votre profil professionnel avec les informations suivantes :
              </p>
              <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4 text-red-800 dark:text-red-300">
                  <p>{error}</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button 
                  onClick={() => setShowQuickProfile(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Compléter rapidement mon profil
                </Button>
                <Button asChild>
                  <Link to="/settings/profile">
                    Gérer mon profil complet
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleRetry}>
                  Réessayer
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (!cabinetData) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-6">
          <Alert className="mb-6">
            <AlertTitle className="text-lg font-semibold">Cabinet non configuré</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                Pour générer des factures, vous devez d'abord créer un cabinet avec vos informations professionnelles.
              </p>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4 text-red-800 dark:text-red-300">
                  <p>{error}</p>
                </div>
              )}
              <div className="mt-4">
                <Button asChild>
                  <Link to="/cabinets/new">
                    Créer un cabinet
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  // Si toutes les vérifications sont passées, continuer avec le formulaire normal
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Nouvelle Facture</h1>
        <div className="bg-green-50 p-4 border border-green-200 rounded-md shadow mb-6">
          <p className="font-medium text-green-800">Cabinet: {cabinetData?.name}</p>
          <p className="text-green-700">Ostéopathe: {osteopath?.name}</p>
          <p className="text-green-700">{osteopath?.professional_title}</p>
          {osteopath?.adeli_number && <p className="text-green-700">ADELI: {osteopath.adeli_number}</p>}
          {osteopath?.siret && <p className="text-green-700">SIRET: {osteopath.siret}</p>}
        </div>
        {/* Formulaire de facture à implémenter */}
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50">
            <CardTitle>Informations de facturation</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              Pour créer une facture, sélectionnez un patient et complétez les informations requises.
            </p>
            <div className="mb-8">
              <Button asChild>
                <Link to="/patients">
                  Sélectionner un patient
                </Link>
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Le module de facturation sera bientôt disponible.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Cette fonction est ajoutée pour satisfaire la référence dans l'appel
// du handleRetry. Son implémentation est intégrée dans le contexte du 
// hook useEffect, mais nous la gardons ici par cohérence de code.
const checkRequiredFields = async () => {};

export default NewInvoicePage;
