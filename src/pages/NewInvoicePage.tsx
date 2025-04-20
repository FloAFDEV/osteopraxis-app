
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
import { Osteopath, Cabinet, Invoice, Patient } from '@/types';
import PatientFancyLoader from '@/components/patients/PatientFancyLoader';
import { Activity, CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Schema de validation pour le formulaire de facture
const invoiceFormSchema = z.object({
  includeTVA: z.boolean().default(false),
  amount: z.coerce.number().min(0, "Le montant doit être positif"),
  patientId: z.string().min(1, "Veuillez sélectionner un patient"),
  appointmentId: z.string().optional(),
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  paymentMethod: z.enum(['CB', 'ESPECES', 'CHEQUE', 'VIREMENT'], {
    required_error: "Veuillez sélectionner un mode de paiement",
  }),
  isPaid: z.boolean().default(true),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const NewInvoicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  const [cabinetData, setCabinetData] = useState<Cabinet | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      includeTVA: false,
      amount: 55, // Montant par défaut
      patientId: "",
      appointmentId: undefined,
      date: new Date(),
      paymentMethod: 'CB',
      isPaid: true,
      notes: "TVA non applicable – art. 261-4-1° du CGI",
    },
  });

  // Charger la liste des patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const { data: patientsData, error } = await supabase
          .from("Patient")
          .select("*")
          .order("lastName", { ascending: true });
          
        if (error) throw error;
        
        if (patientsData) {
          setPatients(patientsData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des patients:", error);
        toast.error("Impossible de charger la liste des patients");
      }
    };
    
    loadPatients();
  }, []);
  
  // Effet pour charger les rendez-vous quand un patient est sélectionné
  useEffect(() => {
    const loadAppointments = async () => {
      if (!selectedPatientId) return;
      
      try {
        const { data: appointmentsData, error } = await supabase
          .from("Appointment")
          .select("*")
          .eq("patientId", selectedPatientId)
          .order("date", { ascending: false });
          
        if (error) throw error;
        
        setAppointments(appointmentsData || []);
      } catch (error) {
        console.error("Erreur lors du chargement des rendez-vous:", error);
      }
    };
    
    loadAppointments();
  }, [selectedPatientId]);

  useEffect(() => {
    // Fonction pour récupérer les données professionnelles
    const fetchProfessionalData = async () => {
      if (!loading) return;

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
          
          // Si nous avons un cabinet, récupérons l'ostéopathe associé
          if (cabinets[0].osteopathId) {
            const { data: osteoData, error: osteoError } = await supabase
              .from("Osteopath")
              .select("*")
              .eq("id", cabinets[0].osteopathId)
              .maybeSingle();
              
            if (osteoError) {
              console.warn("Erreur lors de la récupération de l'ostéopathe:", osteoError);
            } else if (osteoData) {
              console.log("Ostéopathe trouvé via cabinet:", osteoData);
              setOsteopath(osteoData);
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
      // Création d'une consultation fictive pour la facturation si aucun rendez-vous n'est sélectionné
      const today = new Date().toISOString();
      let consultationId: number;
      
      if (data.appointmentId) {
        // Utiliser la consultation existante liée au rendez-vous
        consultationId = parseInt(data.appointmentId);
      } else {
        // Créer une nouvelle consultation
        const consultationData = {
          date: data.date.toISOString(),
          osteopathId: osteopath?.id || null,
          patientId: parseInt(data.patientId),
          notes: "Consultation pour facturation",
          isCancelled: false
        };
        
        const { data: consultation, error: consultError } = await supabase
          .from("Consultation")
          .insert(consultationData)
          .select()
          .single();
          
        if (consultError) {
          throw new Error(`Erreur lors de la création de la consultation: ${consultError.message}`);
        }
        
        consultationId = consultation.id;
      }
      
      // Création de la facture avec toutes les mentions légales françaises
      const invoiceData = {
        patientId: parseInt(data.patientId),
        consultationId: consultationId,
        amount: data.amount,
        date: data.date.toISOString(),
        paymentStatus: data.isPaid ? "PAID" : "PENDING",
        tvaExoneration: true,
        tvaMotif: "TVA non applicable - Article 261-4-1° du CGI",
        paymentMethod: data.paymentMethod,
        notes: data.notes || null
      } as any;
      
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
      
      // Redirection vers la facture créée après un court délai
      setTimeout(() => {
        navigate(`/invoices/${invoice.id}`);
      }, 1000);
      
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      toast.error("Erreur lors de la création de la facture");
    }
  };
  
  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    form.setValue("patientId", patientId);
  };
  
  const handleRetry = () => {
    toast.info("Nouvelle tentative de récupération des données...");
    setOsteopath(null);
    setCabinetData(null);
    setError(null);
    setLoading(true);
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

  // Si nous n'avons pas d'ostéopathe ni de cabinet, mais pas d'erreur,
  // permettons quand même la création d'une facture simple
  const professionalInfo = osteopath || {
    name: "Praticien",
    professional_title: "Ostéopathe D.O.",
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
              <p className="font-medium">{professionalInfo.professional_title}</p>
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
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select
                        onValueChange={handlePatientChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {patients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.lastName} {patient.firstName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Le patient qui recevra la facture
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                {selectedPatientId && appointments.length > 0 && (
                  <FormField
                    control={form.control}
                    name="appointmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rendez-vous associé</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un rendez-vous (optionnel)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            {appointments.map(appointment => (
                              <SelectItem key={appointment.id} value={appointment.id.toString()}>
                                {format(new Date(appointment.date), "dd/MM/yyyy à HH:mm")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Facultatif: lier la facture à un rendez-vous existant
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de la facture</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Date d'émission de la facture
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
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
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de paiement</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le mode de paiement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CB">Carte Bancaire</SelectItem>
                        <SelectItem value="ESPECES">Espèces</SelectItem>
                        <SelectItem value="CHEQUE">Chèque</SelectItem>
                        <SelectItem value="VIREMENT">Virement bancaire</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Mode de paiement utilisé par le patient
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mentions légales</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TVA non applicable – art. 261-4-1° du CGI"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Mentions légales obligatoires (TVA, etc.)
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="includeTVA"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">TVA</FormLabel>
                        <FormDescription>
                          Activer la TVA sur cette facture (soins ostéopathiques exonérés)
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
                
                <FormField
                  control={form.control}
                  name="isPaid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 md:p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Facture acquittée</FormLabel>
                        <FormDescription>
                          La facture est déjà payée
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
              </div>
              
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
