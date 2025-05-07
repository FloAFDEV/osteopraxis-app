
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { SessionForm } from "@/components/session/SessionForm";
import { toast } from "sonner";
import { Session } from "@/services/api/session-service";

const EditSessionPage = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const sessionId = id ? parseInt(id) : undefined;

  useEffect(() => {
    const fetchSessionAndPatient = async () => {
      if (!sessionId) {
        toast.error("ID de séance manquant");
        navigate("/patients");
        return;
      }

      try {
        setLoading(true);
        
        // Fetch session
        const sessionData = await api.getSessionById(sessionId);
        
        if (!sessionData) {
          toast.error("Séance non trouvée");
          navigate("/patients");
          return;
        }
        
        setSession(sessionData);
        
        // Fetch patient
        const patientData = await api.getPatientById(sessionData.patientId);
        
        if (!patientData) {
          toast.error("Patient non trouvé");
          navigate("/patients");
          return;
        }
        
        setPatient(patientData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Impossible de charger les données");
        navigate("/patients");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndPatient();
  }, [sessionId, navigate]);

  const handleCancel = () => {
    if (patient) {
      navigate(`/patients/${patient.id}`);
    } else {
      navigate("/patients");
    }
  };

  const handleSaveSession = () => {
    toast.success("Séance mise à jour");
    if (patient) {
      navigate(`/patients/${patient.id}`);
    } else {
      navigate("/patients");
    }
  };

  if (loading || !patient || !session) {
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
          initialSession={session}
          patient={patient}
          onSave={handleSaveSession}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
};

export default EditSessionPage;
