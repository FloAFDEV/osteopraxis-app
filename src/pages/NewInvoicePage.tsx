
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { InvoiceForm } from "@/components/invoice-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewInvoicePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const appointmentId = searchParams.get("appointmentId");
    
    if (appointmentId) {
      const fetchAppointmentAndPatient = async () => {
        setIsLoading(true);
        try {
          const appointment = await api.getAppointmentById(parseInt(appointmentId));
          
          if (appointment) {
            setAppointment(appointment);
            
            // Vérifier si ce rendez-vous a déjà une facture associée
            // Pour l'instant, on ne fait qu'un log
            console.log("Vérification si le rendez-vous a déjà une facture");
            
            // Récupérer les informations du patient
            if (appointment.patientId) {
              const patient = await api.getPatientById(appointment.patientId);
              if (patient) {
                setPatientData(patient);
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données du rendez-vous:", error);
          toast.error("Impossible de charger les données du rendez-vous");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAppointmentAndPatient();
    }
  }, [searchParams]);

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
      <div className="container mx-auto py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold mb-4">Nouvelle Facture</h1>
        {appointment && patientData ? (
          <InvoiceForm 
            patient={patientData}
            appointment={appointment}
            onCreate={() => navigate("/invoices")}
          />
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              Aucun rendez-vous sélectionné ou informations du patient manquantes.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewInvoicePage;
