
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AppointmentForm } from "@/components/AppointmentForm";

const EditAppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointment = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!id) {
          setError("ID de séance manquant");
          return;
        }

        // Support à la fois les IDs numériques (mode connecté) et les UUIDs (mode démo)
        const parsedInt = parseInt(id, 10);
        const appointmentId: number | string = !isNaN(parsedInt) && parsedInt > 0 ? parsedInt : id;

        console.log(`EditAppointmentPage: Loading appointment ${appointmentId} (original: ${id}, type: ${typeof appointmentId})`);

        // Charger les données en parallèle avec retry
        let appointmentData, patientsData;
        try {
          [appointmentData, patientsData] = await Promise.all([
            api.getAppointmentById(appointmentId),
            api.getPatients()
          ]);
        } catch (apiError: any) {
          console.error(`EditAppointmentPage: API Error for ID ${appointmentId}:`, apiError);
          throw new Error(`Erreur API: ${apiError.message || 'Impossible de charger le rendez-vous'}`);
        }

        console.log(`EditAppointmentPage: Chargé RDV ID ${appointmentId}:`, appointmentData ? 'TROUVÉ' : 'NULL', `- ${patientsData.length} patients`);

        if (!appointmentData) {
          console.error(`EditAppointmentPage: Rendez-vous non trouvé pour ID ${appointmentId}`);
          setError(`Séance non trouvée (ID: ${appointmentId})`);
          toast.error(`Séance non trouvée (ID: ${appointmentId})`);
          return;
        }

        setAppointment(appointmentData);

        setPatients(patientsData);
      } catch (error: any) {
        console.error("EditAppointmentPage: Error loading data:", error);
        const errorMessage = error.message || "Erreur lors du chargement de la séance";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointment();
  }, [id]);

  const getTimeFromDate = (dateString: string | undefined): string => {
    if (!dateString) return "09:00";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de la séance...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4 mx-auto" />
            <p className="text-xl font-semibold text-red-600">{error}</p>
            <Button 
              onClick={() => navigate("/appointments")} 
              className="mt-4"
              variant="outline"
            >
              Retour aux séances
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-orange-500 mb-4 mx-auto" />
            <p className="text-muted-foreground">Séance non trouvée.</p>
            <Button 
              onClick={() => navigate("/appointments")} 
              className="mt-4"
              variant="outline"
            >
              Retour aux séances
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        <header className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-500" />
            Modifier la séance
          </h1>
          <p className="text-gray-500 mt-2">
            Modifiez les détails de la séance en remplissant le formulaire
            ci-dessous.
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 shadow-sm p-6">
          <AppointmentForm
            patients={patients}
            defaultValues={{
              patientId: appointment?.patientId,
              date: new Date(appointment?.date || new Date()),
              time: getTimeFromDate(appointment?.date),
              reason: appointment?.reason,
              notes: appointment?.notes,
              status: appointment?.status,
              website: "", // Champ honeypot
            }}
            appointmentId={!isNaN(parseInt(id!, 10)) ? parseInt(id!, 10) : id!}
          />
        </section>
      </div>
    </Layout>
  );
};

export default EditAppointmentPage;
