
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/ui/layout";
import { useNavigate, useLocation } from "react-router-dom";
import AppointmentForm from "@/components/appointment-form";
import { api } from "@/services/api";
import { toast } from "sonner";
import { AppointmentStatus } from "@/types";
import { FancyLoader } from "@/components/ui/fancy-loader";

const NewAppointmentPage = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [cabinets, setCabinets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract initialDate from query parameters if provided
  const queryParams = new URLSearchParams(location.search);
  const dateParam = queryParams.get("date");
  const initialDate = dateParam ? new Date(dateParam) : new Date();

  // Load patients and cabinets on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsData, cabinetsData] = await Promise.all([
          api.getPatients(),
          api.getCabinets(),
        ]);

        setPatients(patientsData || []);
        setCabinets(cabinetsData || []);
      } catch (error) {
        console.error("Error loading data for appointment form:", error);
        toast.error(
          "Une erreur est survenue lors du chargement des données. Veuillez réessayer."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFormSubmit = async (appointmentData: any) => {
    try {
      setSubmitting(true);

      // Ensure the status is a valid AppointmentStatus
      const status: AppointmentStatus = appointmentData.status as AppointmentStatus || "PLANNED";

      // Create the appointment with the validated data
      await api.createAppointment({
        ...appointmentData,
        status,
      });

      toast.success("Rendez-vous créé avec succès!");
      navigate("/appointments");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(
        "Une erreur est survenue lors de la création du rendez-vous. Veuillez réessayer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FancyLoader message="Chargement..." />;
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Nouveau rendez-vous</h1>
        <AppointmentForm
          patients={patients}
          cabinets={cabinets}
          initialDate={initialDate}
          onSubmit={handleFormSubmit}
          isSubmitting={submitting}
          onCancel={() => navigate("/appointments")}
        />
      </div>
    </Layout>
  );
};

export default NewAppointmentPage;
