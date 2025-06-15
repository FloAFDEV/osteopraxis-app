import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Appointment, Patient, Cabinet, Osteopath } from "@/types";
import { Layout } from "@/components/ui/layout";
import { InvoiceForm } from "@/components/invoice-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
const NewInvoicePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cabinet & ostéopathe sélectionnés
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);
  const [osteopaths, setOsteopaths] = useState<Osteopath[]>([]);
  const [selectedOsteopathId, setSelectedOsteopathId] = useState<number | null>(null);
  const [osteopath, setOsteopath] = useState<Osteopath | null>(null);
  useEffect(() => {
    // Gestion du paramètre patientId OU appointmentId
    const appointmentId = searchParams.get("appointmentId");
    const patientId = searchParams.get("patientId");
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Si patientId direct dans l’url
        if (patientId && !appointmentId) {
          const patient = await api.getPatientById(Number(patientId));
          if (patient) {
            setPatientData(patient);
          } else {
            setError("Patient non trouvé");
            toast.error("Patient non trouvé");
          }
        }

        // 2. Si rendez-vous proposé, priorité : charger le patient lié
        if (appointmentId) {
          const appointment = await api.getAppointmentById(Number(appointmentId));
          if (appointment) {
            setAppointment(appointment);
            if (appointment.patientId) {
              const patient = await api.getPatientById(appointment.patientId);
              if (patient) {
                setPatientData(patient);
              }
            }
          } else {
            setError("Rendez-vous non trouvé");
            toast.error("Rendez-vous non trouvé");
          }
        }

        // 3. Charger l’ostéopathe courant (émétteur)
        const osteopaths = await api.getOsteopaths();
        // Sélectionne le premier ostéo s’il y en a qu’un, sinon le connectée
        if (osteopaths.length === 1) {
          setOsteopath(osteopaths[0]);
        } else if (osteopaths.length > 1) {
          // Si vous avez plusieurs, sélectionnez celui connecté par défaut ici (attention logique projet)
          setOsteopath(osteopaths[0]);
        }
      } catch (error) {
        setError("Impossible de charger les données nécessaires");
        toast.error("Erreur de chargement");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [searchParams]);

  // Empêcher l’édition tant que l’utilisateur n’a pas choisi un cabinet/ostéo (s’il y a au moins 2 choix)
  const needCabinetSelect = cabinets.length > 1;
  const needOsteopathSelect = osteopaths.length > 1;
  const isReady = (!needCabinetSelect || !!selectedCabinetId) && (!needOsteopathSelect || !!selectedOsteopathId);
  if (isLoading) {
    return <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>;
  }
  if (error) {
    return <Layout>
        <div className="container mx-auto py-10">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">{error}</h1>
            <Button onClick={() => navigate("/invoices")}>
              Retour aux factures
            </Button>
          </div>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="container mx-auto py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold mb-4">Nouvelle note d'honoraire</h1>
        <InvoiceForm patient={patientData} osteopath={osteopath} appointment={appointment} onCreate={() => navigate("/invoices")} />
      </div>
    </Layout>;
};
export default NewInvoicePage;