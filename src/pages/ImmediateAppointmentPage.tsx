import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { api } from "@/services/api";
import { Patient, AppointmentStatus } from "@/types";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ImmediateAppointmentPage = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the most recently created patient
    const fetchMostRecentPatient = async () => {
      try {
        const patients = await api.getPatients();
        if (patients && patients.length > 0) {
          // Assuming the API returns patients sorted by creation date
          const mostRecentPatient = patients[patients.length - 1];
          setPatient(mostRecentPatient);
        } else {
          toast.info("Aucun patient trouvé. Veuillez en créer un.");
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Erreur lors de la récupération des patients.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostRecentPatient();
  }, []);

  // Create initial appointment
  const createInitialAppointment = async (patientId: number) => {
    try {
      const now = new Date();
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
      
      const appointmentData = {
        patientId,
        cabinetId: 1, // Default value
        osteopathId: 1, // Default value
        date: now.toISOString(),
        start: now.toISOString(),
        end: thirtyMinutesLater.toISOString(),
        reason: "Séance immédiate",
        status: "SCHEDULED" as AppointmentStatus,
        notes: null,
        notificationSent: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const newAppointment = await api.createAppointment(appointmentData);
      toast.success("Séance immédiate créée avec succès!");
      navigate(`/appointments/${newAppointment.id}`);
    } catch (error) {
      console.error("Error creating immediate appointment:", error);
      toast.error("Erreur lors de la création de la séance immédiate.");
    }
  };

  const handleStartAppointment = async () => {
    if (patient) {
      await createInitialAppointment(patient.id);
    } else {
      toast.error("Aucun patient disponible. Veuillez en créer un.");
    }
  };

  const handleCreatePatient = () => {
    navigate("/patients/new");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Séance Immédiate</h1>
          <p className="text-muted-foreground mb-8">
            Démarrez une séance immédiatement avec le dernier patient créé ou créez un nouveau patient.
          </p>

          {patient ? (
            <div>
              <p className="text-lg">
                Démarrer une séance avec:{" "}
                <span className="font-semibold">{patient.firstName} {patient.lastName}</span>?
              </p>
              <Button 
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors" 
                onClick={handleStartAppointment}
                aria-label="Démarrer une séance immédiate avec le patient sélectionné"
              >
                Démarrer la Séance Immédiate
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-lg">
                Aucun patient trouvé. Veuillez créer un patient pour démarrer une séance.
              </p>
              <Button 
                className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors" 
                onClick={handleCreatePatient}
                aria-label="Créer un nouveau patient pour démarrer une séance"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer un Nouveau Patient
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ImmediateAppointmentPage;
