
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Activity, Plus } from 'lucide-react';
import { api } from '@/services/api';
import { Layout } from '@/components/ui/layout';
import { InvoiceForm } from '@/components/invoice-form';
import { FancyLoader } from '@/components/ui/fancy-loader';
import { Patient, Appointment } from '@/types';
import { Card } from '@/components/ui/card';

const NewInvoicePage = () => {
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
        // Charger les données du rendez-vous si l'ID est fourni
        if (appointmentId) {
          const appointmentData = await api.getAppointmentById(parseInt(appointmentId, 10));
          if (appointmentData) {
            setAppointment(appointmentData);
            // Charger les données du patient à partir du rendez-vous
            const patientData = await api.getPatientById(appointmentData.patientId);
            if (patientData) setPatient(patientData);
          }
        }
        // Charger les données du patient si l'ID est fourni
        else if (patientId) {
          const patientData = await api.getPatientById(parseInt(patientId, 10));
          if (patientData) setPatient(patientData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
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

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-amber-500 dark:text-amber-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
              Nouvelle Facture
            </span>
          </h1>
        </div>

        {isLoading ? (
          <FancyLoader message="Chargement des données..." />
        ) : (
          <Card className="p-6">
            <InvoiceForm
              initialPatient={patient}
              initialAppointment={appointment}
              onCreate={handleInvoiceCreated}
            />
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default NewInvoicePage;
