
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AppointmentForm } from "@/components/appointment-form";

const EditAppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAppointment = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          toast.error("ID de séance manquant");
          return navigate("/appointments");
        }

        const appointmentId = parseInt(id, 10);
        if (isNaN(appointmentId)) {
          toast.error("ID de séance invalide");
          return navigate("/appointments");
        }

        console.log("Chargement du rendez-vous avec ID:", appointmentId);

        // Charger le rendez-vous et les patients en parallèle
        const [appointmentData, patientsData] = await Promise.all([
          api.getAppointmentById(appointmentId),
          api.getPatients()
        ]);

        console.log("Données du rendez-vous récupérées:", appointmentData);

        if (appointmentData) {
          setAppointment(appointmentData);
          setPatients(patientsData);
        } else {
          toast.error("Séance non trouvée");
          navigate("/appointments");
          return;
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la séance:", error);
        toast.error("Erreur lors du chargement de la séance");
        navigate("/appointments");
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointment();
  }, [id, navigate]);

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

  if (!appointment) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Séance non trouvée.</p>
            <Button onClick={() => navigate("/appointments")} className="mt-4">
              Retour aux rendez-vous
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8 text-purple-500" />
              Modifier la séance
            </h1>
            <p className="text-gray-500 mt-2">
              Modifiez les détails de la séance en remplissant le formulaire ci-dessous.
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
              appointmentId={Number(id)}
            />
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default EditAppointmentPage;
