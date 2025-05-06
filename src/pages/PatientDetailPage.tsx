
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from "@/components/ui/layout";
import { Patient } from "@/types";
import { api } from "@/services/api";
import PatientDetailTabs from '@/components/patients/detail/PatientDetailTabs';
import { toast } from 'sonner';
import PatientFancyLoader from '@/components/patients/PatientFancyLoader';

const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Erreur lors du chargement du patient:", error);
        toast.error("Impossible de charger les données du patient");
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  return (
    <Layout>
      {loading ? (
        <PatientFancyLoader message="Chargement du patient..." />
      ) : patient ? (
        <PatientDetailTabs patient={patient} />
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
