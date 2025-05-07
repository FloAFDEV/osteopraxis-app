
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { toast } from "sonner";
import { SessionList } from "@/components/session/SessionList";
import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionHistoryTabProps {
  patient: Patient;
}

export function SessionHistoryTab({ patient }: SessionHistoryTabProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await api.getSessionsByPatientId(patient.id);
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Impossible de charger les séances");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [patient.id]);

  return (
    <div className="space-y-6 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-500" />
          Historique des séances
        </h2>
        
        <Button asChild>
          <Link to={`/sessions/new?patientId=${patient.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            Séance immédiate
          </Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune séance trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Ce patient n'a pas encore de séance enregistrée.
          </p>
          <Button asChild>
            <Link to={`/sessions/new?patientId=${patient.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une séance maintenant
            </Link>
          </Button>
        </div>
      ) : (
        <SessionList sessions={sessions} />
      )}
    </div>
  );
}
