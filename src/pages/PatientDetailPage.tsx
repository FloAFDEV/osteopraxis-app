
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from "@/components/ui/layout";
import { Appointment, AppointmentStatus, Invoice, Patient } from "@/types";
import { api } from "@/services/api";
import { PatientDetailTabs } from '@/components/patients/detail/PatientDetailTabs';
import { toast } from 'sonner';
import PatientFancyLoader from '@/components/patients/PatientFancyLoader';

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  useEffect(() => {
    if (!id) return;

    const loadPatient = async () => {
      try {
        setLoading(true);
        const patientData = await api.getPatientById(parseInt(id));
        
        if (!patientData) {
          toast.error("Patient non trouvé");
          return;
        }
        
        setPatient(patientData as Patient);

        // Charger les rendez-vous du patient
        if (patientData) {
          try {
            const appointments = await api.getAppointmentsByPatientId(patientData.id);
            
            // Séparer les rendez-vous à venir et passés
            const now = new Date();
            const upcoming = appointments.filter(a => new Date(a.date) >= now && a.status !== "CANCELED");
            const past = appointments.filter(a => new Date(a.date) < now || a.status === "CANCELED");
            
            setUpcomingAppointments(upcoming);
            setPastAppointments(past);
          } catch (error) {
            console.error("Erreur lors du chargement des rendez-vous:", error);
          }
          
          // Charger les factures du patient
          try {
            const invoicesData = await api.getInvoicesByPatientId(patientData.id);
            setInvoices(invoicesData);
          } catch (error) {
            console.error("Erreur lors du chargement des factures:", error);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du patient:", error);
        toast.error("Impossible de charger les données du patient");
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await api.cancelAppointment(appointmentId);
      toast.success("Rendez-vous annulé avec succès");
      
      // Mettre à jour la liste des rendez-vous
      setUpcomingAppointments(prev => 
        prev.filter(a => a.id !== appointmentId)
      );
      setPastAppointments(prev => [
        ...prev, 
        { ...upcomingAppointments.find(a => a.id === appointmentId)!, status: "CANCELED" }
      ]);
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error);
      toast.error("Impossible d'annuler le rendez-vous");
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: number, status: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(appointmentId, status);
      toast.success("Statut du rendez-vous mis à jour");
      
      // Mettre à jour les listes de rendez-vous
      if (status === "CANCELED") {
        setUpcomingAppointments(prev => 
          prev.filter(a => a.id !== appointmentId)
        );
        setPastAppointments(prev => [
          ...prev.filter(a => a.id !== appointmentId),
          { ...upcomingAppointments.find(a => a.id === appointmentId)!, status }
        ]);
      } else {
        // Mettre à jour le statut dans la liste appropriée
        setUpcomingAppointments(prev => 
          prev.map(a => a.id === appointmentId ? { ...a, status } : a)
        );
        setPastAppointments(prev => 
          prev.map(a => a.id === appointmentId ? { ...a, status } : a)
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Impossible de mettre à jour le statut");
    }
  };

  return (
    <Layout>
      {loading ? (
        <PatientFancyLoader message="Chargement du patient..." />
      ) : patient ? (
        <PatientDetailTabs 
          patient={patient}
          upcomingAppointments={upcomingAppointments}
          pastAppointments={pastAppointments}
          invoices={invoices}
          onCancelAppointment={handleCancelAppointment}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-10">
          <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-lg text-center max-w-lg">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
              Patient non trouvé
            </h2>
            <p className="text-red-700 dark:text-red-400">
              Le patient que vous recherchez n'existe pas ou a été supprimé.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PatientDetailPage;
