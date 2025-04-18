
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
import { toast } from 'sonner';
import { ProfessionalProfile, Cabinet, Invoice } from '@/types';
import PatientFancyLoader from '@/components/patients/PatientFancyLoader';
import { Activity } from 'lucide-react';

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
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    // Fonction pour récupérer les données professionnelles
    const fetchProfessionalData = async () => {
      if (!loading) return; // Éviter les appels multiples

      try {
        if (!user?.id) {
          setError("Utilisateur non authentifié");
          setLoading(false);
          return;
        }

        setError(null);
        
        // Récupérer d'abord les informations du cabinet
        const { data: cabinets, error: cabinetError } = await supabase
          .from("Cabinet")
          .select("*")
          .limit(1);
        
        if (cabinetError) {
          console.warn("Erreur lors de la récupération du cabinet:", cabinetError);
        } else if (cabinets && cabinets.length > 0) {
          console.log("Cabinet trouvé:", cabinets[0]);
          setCabinetData(cabinets[0]);
          
          // Si nous avons un cabinet, récupérons le profil professionnel associé
          if (cabinets[0].professionalProfileId) {
            const { data: profileData, error: profileError } = await supabase
              .from("ProfessionalProfile")
              .select("*")
              .eq("id", cabinets[0].professionalProfileId)
              .maybeSingle();
              
            if (profileError) {
              console.warn("Erreur lors de la récupération du profil professionnel:", profileError);
            } else if (profileData) {
              console.log("Profil professionnel trouvé via cabinet:", profileData);
              setProfessionalProfile(profileData);
            }
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

    fetchProfessionalData();
  }, [user, loading]);

  const onSubmit = async (data: InvoiceFormValues) => {
    console.log("Données du formulaire:", data);
    
    try {
      // Création d'une consultation fictive pour la facturation
      const today = new Date().toISOString();
      const consultationData = {
        date: today,
        professionalProfileId: professionalProfile?.id || null,
        patientId: data.patientId ? parseInt(data.patientId) : 1, // Patient par défaut si non spécifié
        notes: "Consultation pour facturation",
        isCancelled: false
      };
      
      // Création de la consultation
      const { data: consultation, error: consultError } = await supabase
        .from("Consultation")
        .insert(consultationData)
        .select()
        .single();
        
      if (consultError) {
        throw new Error(`Erreur lors de la création de la consultation: ${consultError.message}`);
      }
      
      // Création de la facture
      const invoiceData = {
        patientId: consultationData.patientId,
        consultationId: consultation.id,
        amount: data.amount,
        date: today,
        paymentStatus: "PENDING" as const
      };
      
      // Utilisation directe de Supabase pour la création de facture
      const { data: invoice, error: invoiceError } = await supabase
        .from("Invoice")
        .insert(invoiceData)
        .select()
        .single();
        
      if (invoiceError) {
        throw new Error(`Erreur lors de la création de la facture: ${invoiceError.message}`);
      }
      
      toast.success("Facture créée avec succès");
      
      // Redirection vers la liste des factures après un court délai
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
      
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      toast.error("Erreur lors de la création de la facture");
    }
  };
  
  const handleRetry = () => {
    toast.info("Nouvelle tentative de récupération des données...");
    // Réinitialiser l'état pour déclencher un nouveau useEffect
    setProfessionalProfile(null);
    setCabinetData(null);
    setError(null);
    setLoading(true); // Réactiver le chargement pour déclencher le useEffect
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

  // Si nous n'avons pas de profil professionnel ni de cabinet, mais pas d'erreur,
  // permettons quand même la création d'une facture simple
  const professionalInfo = professionalProfile || {
    name: "Praticien",
    title: "Ostéopathe D.O.",
    ape_code: "8690F"
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 md:py-10 px-2 md:px-0">
        <h1 className="flex items-center gap-3 text-3xl font-bold mb-4 md:mb-6">
          <Activity className="h-8 w-8 text-blue-600 dark:text-blue-500" />
          <span className="inline-block text-transparent bg-clip-text
                           bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                           dark:from-blue-500 dark:via-purple-500 dark:to-pink-500">
            Nouvelle Facture
          </span>
        </h1>

        <Card className="p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-xl font-semibold mb-3 md:mb-4">Information du praticien</h2>
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="text-sm text-gray-500">Nom / Raison sociale</label>
              <p className="font-medium">{professionalInfo.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Titre professionnel</label>
              <p className="font-medium">{professionalInfo.title}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Numéro ADELI</label>
              <p className="font-medium">{professionalProfile?.adeli_number || "Non renseigné"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">SIRET</label>
              <p className="font-medium">{professionalProfile?.siret || "Non renseigné"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Code APE</label>
              <p className="font-medium">{professionalInfo.ape_code || "8690F"}</p>
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
        
        <Card className="p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-xl font-semibold mb-3 md:mb-4">Création de facture</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
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
