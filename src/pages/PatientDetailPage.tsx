
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Patient, Appointment, Invoice } from "@/types";
import { Layout } from "@/components/ui/layout";
import { toast } from "sonner";
import { PatientLoadingState } from "@/components/patients/PatientLoadingState";
import { PatientDetailHeader } from "@/components/patients/PatientDetailHeader";
import { PatientStats } from "@/components/patients/PatientStats";
import { PatientProfile } from "@/components/patients/PatientProfile";
import { PatientTabs } from "@/components/patients/PatientTabs";

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          setError("Patient ID is missing.");
          return;
        }

        const [patientData, appointmentsData, invoicesData] = await Promise.all([
          api.getPatientById(parseInt(id)),
          api.getAppointmentsByPatientId(parseInt(id)),
          api.getInvoicesByPatientId(parseInt(id))
        ]);
        
        if (!patientData) {
          throw new Error("Patient non trouvé");
        }

        setPatient(patientData);
        setAppointments(appointmentsData);
        setInvoices(invoicesData);
      } catch (e: any) {
        setError(e.message || "Failed to load patient data.");
        toast.error("Impossible de charger les informations du patient. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  return (
    <Layout>
      <PatientLoadingState isLoading={loading} error={error}>
        {patient && (
          <div className="flex flex-col space-y-6">
            <PatientDetailHeader patient={patient} />
            
            <PatientStats 
              appointments={appointments} 
              invoices={invoices}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PatientProfile patient={patient} />
              </div>
              
              <div className="lg:col-span-2">
                <PatientTabs 
                  patient={patient} 
                  appointments={appointments} 
                  invoices={invoices} 
                />
              </div>
            </div>
          </div>
        )}
      </PatientLoadingState>
    </Layout>
  );
};

export default PatientDetailPage;
