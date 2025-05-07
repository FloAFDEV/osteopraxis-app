
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { toast } from "sonner";
import { Session } from "@/services/api/session-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Calendar, CheckCircle, Clock, Edit, FileText } from "lucide-react";

const SessionDetailPage = () => {
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Non défini";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMMM yyyy à HH:mm", { locale: fr });
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "DRAFT":
        return <Edit className="h-5 w-5 text-amber-500" />;
      case "PLANNED":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "IN_PROGRESS":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case "DRAFT":
        return "Brouillon";
      case "PLANNED":
        return "Planifiée";
      case "IN_PROGRESS":
        return "En cours";
      case "COMPLETED":
        return "Terminée";
      default:
        return status;
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
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" asChild>
            <Link to={`/patients/${patient.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au patient
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            {getStatusIcon(session.status)}
            <span className="font-medium">{getStatusLabel(session.status)}</span>
          </div>
          
          <Button asChild>
            <Link to={`/sessions/${session.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Informations de la séance
                </CardTitle>
                <CardDescription>
                  Détails de la séance pour {patient.firstName} {patient.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Date de la séance</div>
                  <div className="mt-1">{formatDate(session.date)}</div>
                </div>
                
                {session.actualStartTime && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Début effectif</div>
                    <div className="mt-1">{formatDate(session.actualStartTime)}</div>
                  </div>
                )}
                
                {session.actualEndTime && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Fin de la séance</div>
                    <div className="mt-1">{formatDate(session.actualEndTime)}</div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Patient</div>
                  <div className="mt-1">{patient.firstName} {patient.lastName}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Motif de la séance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {session.motif || "Aucun motif renseigné"}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compte rendu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {session.compteRendu || "Aucun compte rendu renseigné"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link to={`/patients/${patient.id}`}>
              Retour au patient
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/sessions/${session.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SessionDetailPage;
