
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, AlertCircle, Clock, Edit, User, FileText } from "lucide-react";
import { api } from "@/services/api";
import { Appointment, Patient, AppointmentStatus } from "@/types";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const appointmentData = await api.getAppointmentById(parseInt(id));
        
        if (!appointmentData) {
          throw new Error("Rendez-vous non trouvé");
        }
        
        setAppointment(appointmentData);
        
        // Fetch patient data
        const patientData = await api.getPatientById(appointmentData.patientId);
        setPatient(patientData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Impossible de charger les données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const updateAppointmentStatus = async (status: AppointmentStatus) => {
    if (!appointment || !id) return;
    
    try {
      await api.updateAppointment(parseInt(id), { status });
      setAppointment({...appointment, status});
      toast.success("Statut du rendez-vous mis à jour");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Échec de la mise à jour du statut");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h3 className="text-xl font-medium">Rendez-vous non trouvé</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Le rendez-vous que vous recherchez n&apos;existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/appointments">
              Retour aux rendez-vous
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Format date
  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = format(appointmentDate, "HH:mm", { locale: fr });

  // Status badge color
  const getStatusBadge = () => {
    switch (appointment.status) {
      case "SCHEDULED":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Planifié</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Terminé</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Annulé</Badge>;
      case "RESCHEDULED":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">Reporté</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Inconnu</Badge>;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Détail du rendez-vous
          </h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/appointments" className="flex items-center gap-1">
                Retour
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/appointments/${id}/edit`} className="flex items-center gap-1">
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Informations du rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Date</p>
                      <p className="font-medium capitalize">{formattedDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Heure</p>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Motif de consultation</p>
                    <p>{appointment.reason}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Statut</p>
                    <div className="flex items-center">{getStatusBadge()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Compte rendu
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointment.notes ? (
                  <p>{appointment.notes}</p>
                ) : (
                  <p className="text-muted-foreground italic">Aucun compte rendu disponible pour ce rendez-vous.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-lg">{patient.firstName} {patient.lastName}</h3>
                      {patient.email && <p className="text-muted-foreground">{patient.email}</p>}
                      {patient.phone && <p className="text-muted-foreground">{patient.phone}</p>}
                    </div>
                    <Button asChild variant="secondary" size="sm" className="w-full">
                      <Link to={`/patients/${patient.id}`}>
                        Voir la fiche patient
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Informations du patient non disponibles.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Mettre à jour le statut</p>
                  <Select 
                    value={appointment.status}
                    onValueChange={(value) => updateAppointmentStatus(value as AppointmentStatus)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">Planifié</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                      <SelectItem value="RESCHEDULED">Reporté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch space-y-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/invoices/new?patientId=${appointment.patientId}`} className="w-full justify-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Créer une facture
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/appointments/new?patientId=${appointment.patientId}`} className="w-full justify-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Nouveau rendez-vous
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentDetailPage;
