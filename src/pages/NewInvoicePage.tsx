
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/ui/layout";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Patient, ProfessionalProfile, PaymentStatus, ProfessionType } from "@/types";
import { FancyLoader } from "@/components/ui/fancy-loader";

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Veuillez sélectionner un patient" }),
  consultationId: z.string().min(1, { message: "Veuillez sélectionner une consultation" }),
  amount: z.string().min(1, { message: "Veuillez entrer un montant" }),
  paymentStatus: z.enum(["PENDING", "PAID", "CANCELLED"]),
  tvaExoneration: z.boolean().default(true),
  tvaMotif: z.string().optional(),
});

const NewInvoicePage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [profile, setProfile] = useState<ProfessionalProfile>({
    id: 0,
    name: "",
    title: "",
    userId: "",
    profession_type: "osteopathe" as ProfessionType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [patientsData, user] = await Promise.all([
          api.getPatients(),
          api.getSession()
        ]);

        setPatients(patientsData || []);

        // Charger le profil si l'utilisateur est connecté
        if (user?.user?.professionalProfileId) {
          const profileData = await api.getProfessionalProfileById(user.user.professionalProfileId);
          if (profileData) {
            setProfile(profileData);
          }
        }
        
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Charger les consultations du patient sélectionné
  useEffect(() => {
    const loadConsultations = async () => {
      if (!selectedPatient) {
        setConsultations([]);
        return;
      }

      try {
        const patientId = parseInt(selectedPatient);
        // Filtrer les consultations uniquement pour le patient sélectionné
        // TODO: Implementer l'API pour récupérer uniquement les consultations du patient sélectionné
        const allConsultations = await api.getConsultations();
        const patientConsultations = allConsultations.filter(
          (c: any) => c.patientId === patientId && !c.isCancelled
        );
        setConsultations(patientConsultations || []);
      } catch (error) {
        console.error("Erreur lors du chargement des consultations:", error);
        toast.error("Une erreur est survenue lors du chargement des consultations");
      }
    };

    loadConsultations();
  }, [selectedPatient]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      consultationId: "",
      amount: "45",
      paymentStatus: "PAID" as PaymentStatus,
      tvaExoneration: true,
      tvaMotif: "TVA non applicable - Article 261-4-1° du CGI",
    },
  });

  const handlePatientChange = (value: string) => {
    setSelectedPatient(value);
    form.setValue("consultationId", "");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const invoiceData = {
        patientId: parseInt(values.patientId),
        consultationId: parseInt(values.consultationId),
        amount: parseFloat(values.amount),
        paymentStatus: values.paymentStatus as PaymentStatus,
        date: new Date().toISOString(),
        tvaExoneration: values.tvaExoneration,
        tvaMotif: values.tvaMotif,
      };

      await api.createInvoice(invoiceData);
      toast.success("Facture créée avec succès");
      navigate("/invoices");
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      toast.error("Une erreur est survenue lors de la création de la facture");
    }
  };

  if (loading) {
    return <FancyLoader message="Chargement des données..." />;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Créer une nouvelle facture</h1>

        {/* Section informations pratique */}
        <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-medium mb-2">Informations du professionnel</h2>
          <div>
            <p className="font-bold">{profile.name}</p>
            <p>{profile.title}</p>
            <p>N° ADELI: {profile.adeli_number || "-"}</p>
            <p>N° SIRET: {profile.siret || "-"}</p>
            <p>Code APE: {profile.ape_code || "8690F"}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePatientChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consultationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consultation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedPatient || consultations.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une consultation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {consultations.length > 0 ? (
                        consultations.map((consultation) => (
                          <SelectItem key={consultation.id} value={consultation.id.toString()}>
                            Consultation du{" "}
                            {new Date(consultation.date).toLocaleDateString("fr-FR")}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          Aucune consultation disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut de paiement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PAID">Payé</SelectItem>
                      <SelectItem value="PENDING">En attente</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tvaExoneration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Exonération de TVA</FormLabel>
                    <p className="text-sm text-gray-500">
                      Cochez cette case si vous êtes exonéré de TVA
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("tvaExoneration") && (
              <FormField
                control={form.control}
                name="tvaMotif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif d'exonération</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Motif d'exonération de TVA"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/invoices")}
              >
                Annuler
              </Button>
              <Button type="submit">Créer la facture</Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default NewInvoicePage;
