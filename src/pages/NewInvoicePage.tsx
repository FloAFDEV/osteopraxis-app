
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { InvoiceForm } from '@/components/invoice-form';
import { FancyLoader } from '@/components/ui/fancy-loader';
import { Patient, Appointment } from '@/types';

const NewInvoicePage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load appointment data if appointmentId is provided
        if (appointmentId) {
          const appointmentData = await api.getAppointmentById(parseInt(appointmentId, 10));
          if (appointmentData) {
            setAppointment(appointmentData);
            // Load patient data from appointment
            const patientData = await api.getPatientById(appointmentData.patientId);
            if (patientData) setPatient(patientData);
          }
        }
        // Load patient data if patientId is provided
        else if (patientId) {
          const patientData = await api.getPatientById(parseInt(patientId, 10));
          if (patientData) setPatient(patientData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [patientId, appointmentId]);

  const handleInvoiceCreated = () => {
    toast.success("Facture créée avec succès !");
    navigate('/invoices');
  };

  if (isLoading) {
    return <FancyLoader message="Chargement des données..." />;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">
        {patient 
          ? `Nouvelle facture pour ${patient.firstName} ${patient.lastName}`
          : "Nouvelle facture"
        }
      </h2>
      <InvoiceForm
        initialPatient={patient}
        initialAppointment={appointment}
        onCreate={handleInvoiceCreated}
      />
    </div>
  );
};

export default NewInvoicePage;
