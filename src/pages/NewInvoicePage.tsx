
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
import { Osteopath, Cabinet, Invoice } from '@/types';
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
        
        // Utilisation directe de l'API
        const osteopathResult = await api.getOsteopathByUserId(user.id);
        
        if (!osteopathResult) {
          setError("Aucun profil ostéopathe trouvé pour cet utilisateur");
          setLoading(false);
          return;
        }
        
        console.log("Données ostéopathe trouvées:", osteopathResult);
        setOsteopath(osteopathResult);

        // Récupérer les données du cabinet
        if (osteopathResult.id) {
          try {
            const cabinetResult = await api.getCabinetsByOsteopathId(osteopathResult.id);
            if (cabinetResult && cabinetResult.length > 0) {
              console.log("Cabinet trouvé:", cabinetResult[0]);
              setCabinetData(cabinetResult[0]);
            } else {
              console.log("Aucun cabinet trouvé pour cet ostéopathe");
            }
          } catch (cabinetError) {
            console.error("Erreur lors de la récupération du cabinet:", cabinetError);
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
  }, [user]);

  const onSubmit = async (data: InvoiceFormValues) => {
    console.log("Données du formulaire:", data);
    
    if (!osteopath) {
      toast.error("Profil ostéopathe non disponible");
      return;
    }
    
    try {
      // Création d'une consultation fictive pour la facturation
      // En pratique, la consultation devrait être créée au moment du RDV
      const today = new Date().toISOString();
      const consultationData = {
        date: today,
        osteopathId: osteopath.id,
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
        paymentStatus: "PENDING"
      } as Omit<Invoice, 'id'>;
      
      const invoice = await api.createInvoice(invoiceData);
      
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
    setOsteopath(null);
    setError(null);
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
