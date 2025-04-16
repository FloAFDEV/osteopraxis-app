
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Osteopath, Cabinet } from '@/types';
import PatientFancyLoader from '@/components/patients/PatientFancyLoader';

// Schema de validation pour le formulaire de facture
const invoiceFormSchema = z.object({
  includeTVA: z.boolean().default(false),
  amount: z.coerce.number().min(0, "Le montant doit être positif"),
  patientId: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      includeTVA: false,
      amount: 55, // Montant par défaut
      patientId: undefined,
    },
  });

  useEffect(() => {
    const fetchOsteopathData = async () => {
      try {
        if (!user?.id) {
          setError("Utilisateur non authentifié");
          return;
        }

        setLoading(true);
        setError(null);
        console.log("Tentative de récupération des données de l'ostéopathe (tentative #" + (retryCount + 1) + ")...");
        
        // Méthode directe via SELECT *
        const { data: osteoData, error: osteoError } = await supabase
          .from("Osteopath")
          .select("*")
          .eq("userId", user.id)
          .single();
        
        if (osteoError) {
          console.error("Erreur lors de la requête Osteopath:", osteoError);
          
          // Essayer une approche alternative si la première échoue
          if (retryCount < 2) {
            setRetryCount(retryCount + 1);
            return; // Cela déclenchera un autre useEffect en raison du changement de retryCount
          }
          
          throw new Error("Impossible de récupérer les données de l'ostéopathe");
        }
        
        if (!osteoData) {
          setError("Aucun profil ostéopathe trouvé pour cet utilisateur");
          setLoading(false);
          return;
        }
        
        console.log("Données ostéopathe trouvées:", osteoData);
        setOsteopath(osteoData);

        // Récupérer les données du cabinet
        const { data: cabinetResult, error: cabinetError } = await supabase
          .from("Cabinet")
          .select("*")
          .eq("osteopathId", osteoData.id)
          .maybeSingle();

        if (cabinetError && cabinetError.code !== 'PGRST116') {
          console.error("Erreur lors de la récupération du cabinet:", cabinetError);
        } else if (cabinetResult) {
          console.log("Cabinet trouvé:", cabinetResult);
          setCabinetData(cabinetResult);
        } else {
          console.log("Aucun cabinet trouvé, création d'un cabinet par défaut");
          // Créer un cabinet par défaut si aucun n'existe
          const newCabinet = {
            name: "Cabinet par défaut",
            address: "Adresse à compléter",
            osteopathId: osteoData.id,
            phone: "",
            imageUrl: null,
            logoUrl: null,
            email: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          try {
            const { data: createdCabinet, error } = await supabase
              .from("Cabinet")
              .insert(newCabinet)
              .select()
              .single();

            if (error) {
              console.error("Erreur lors de la création du cabinet:", error);
            } else {
              console.log("Cabinet créé:", createdCabinet);
              setCabinetData(createdCabinet);
            }
          } catch (err) {
            console.error("Exception lors de la création du cabinet:", err);
          }
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError("Impossible de récupérer les données professionnelles");
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchOsteopathData();
  }, [user, retryCount]);

  const onSubmit = (data: InvoiceFormValues) => {
    console.log("Données du formulaire:", data);
    
    // Création de la facture
    toast.success("Paramètres de facture enregistrés");
    
    // Redirection vers la liste des factures après un court délai
    setTimeout(() => {
      navigate('/invoices');
    }, 1500);
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    toast.info("Nouvelle tentative de récupération des données...");
  };

  // Render loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <PatientFancyLoader message="Chargement des données professionnelles..." />
        </div>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-10">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Erreur</h1>
            <p className="mb-4">{error}</p>
            <div className="flex space-x-4">
              <Button onClick={handleRetry} variant="outline">
                Réessayer
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Retour au tableau de bord
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Nouvelle Facture</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Information du praticien</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Nom / Raison sociale</label>
              <p className="font-medium">{osteopath?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Titre professionnel</label>
              <p className="font-medium">{osteopath?.professional_title}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Numéro ADELI</label>
              <p className="font-medium">{osteopath?.adeli_number || "Non renseigné"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">SIRET</label>
              <p className="font-medium">{osteopath?.siret || "Non renseigné"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Code APE</label>
              <p className="font-medium">{osteopath?.ape_code || "8690F"}</p>
            </div>
            {cabinetData && (
              <>
                <div>
                  <label className="text-sm text-gray-500">Cabinet</label>
                  <p className="font-medium">{cabinetData.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Adresse</label>
                  <p className="font-medium">{cabinetData.address}</p>
                </div>
              </>
            )}
          </div>
        </Card>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Création de facture</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="55.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Montant de la consultation en euros
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="includeTVA"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">TVA</FormLabel>
                      <FormDescription>
                        Activer la TVA sur cette facture
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Choix du patient - À implémenter dans une version future */}
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>
                  Annuler
                </Button>
                <Button type="submit">Créer la facture</Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default NewInvoicePage;
