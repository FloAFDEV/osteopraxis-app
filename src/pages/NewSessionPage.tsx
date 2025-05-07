
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { SessionForm } from "@/components/session/SessionForm";
import { toast } from "sonner";

const NewSessionPage = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get("patientId")
    ? parseInt(queryParams.get("patientId")!)
    : undefined;

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        toast.error("ID de patient manquant");
        navigate("/patients");
        return;
      }

      try {
        setLoading(true);
        const patientData = await api.getPatientById(patientId);
        
        if (!patientData) {
          toast.error("Patient non trouvé");
          navigate("/patients");
          return;
        }
        
        setPatient(patientData);
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Impossible de charger les données du patient");
        navigate("/patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, navigate]);

  const handleCancel = () => {
    navigate(`/patients/${patientId}`);
  };

  const handleSaveSession = () => {
    toast.success("Séance enregistrée");
    navigate(`/patients/${patientId}`);
  };

  if (loading || !patient) {
    return (
      <Layout>
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-6xl">
        <SessionForm
          patient={patient}
          onSave={handleSaveSession}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
};

export default NewSessionPage;
