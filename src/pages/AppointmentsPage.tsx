import React, { useState, useEffect } from "react";
import { Calendar, Plus } from "lucide-react";
import { api } from "@/services/api";
import { Appointment } from "@/types";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "@/components/appointment-card";
import { ConfirmDeleteAppointmentModal } from "@/components/modals/ConfirmDeleteAppointmentModal";
import { toast } from "sonner";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Erreur lors du chargement des séances");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await api.deleteAppointment(appointmentToDelete.id);
      setAppointments(prevAppointments => prevAppointments.filter(a => a.id !== appointmentToDelete.id));
      toast.success("Séance supprimée avec succès");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast.error("Erreur lors de la suppression de la séance");
    }
  };

  const handleEdit = (appointment: Appointment) => {
    navigate(`/appointments/${appointment.id}/edit`);
  };

  const handleAddInvoice = (appointment: Appointment) => {
    navigate(`/invoices/new?appointmentId=${appointment.id}`);
  };

  return (
    <Layout>
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8 text-blue-500" />
          Séances
        </h1>
        <Button
          onClick={() => navigate("/appointments/new")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Nouvelle séance
        </Button>
      </div>

      {/* Appointment List */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p>Chargement des séances...</p>
        ) : appointments.length === 0 ? (
          <p>Aucune séance planifiée.</p>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={handleEdit}
              onDelete={confirmDelete}
              onAddInvoice={handleAddInvoice}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteAppointmentModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        appointment={appointmentToDelete}
      />
    </Layout>
  );
};

export default AppointmentsPage;
