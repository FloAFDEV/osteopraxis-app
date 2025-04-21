
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, AlertCircle, FileText2 } from "lucide-react";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentForm } from "@/components/appointment-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const EditAppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Log pour debug
        console.log(`Chargement du rendez-vous avec l'ID: ${id}`);
        
        const [appointmentData, patientsData] = await Promise.all([
          api.getAppointmentById(parseInt(id)), 
          api.getPatients()
        ]);
        
        if (!appointmentData) {
          console.error("Rendez-vous non trouvé avec l'ID:", id);
          throw new Error("Rendez-vous non trouvé");
        }
        
        console.log("Rendez-vous chargé avec succès:", appointmentData);
        setAppointment(appointmentData);
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
        toast.error("Impossible de charger les données du rendez-vous. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleCancel = async () => {
    if (!appointment || !id) return;
    
    try {
      await api.cancelAppointment(parseInt(id));
      toast.success("Rendez-vous annulé avec succès");
      // Mettre à jour l'état local
      setAppointment({ ...appointment, status: "CANCELED" });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Impossible d'annuler le rendez-vous");
    }
  };

  if (loading) {
    return <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données du rendez-vous...</p>
          </div>
        </div>
      </Layout>;
  }
  
  if (!appointment) {
    return <Layout>
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
      </Layout>;
  }

  // Extract date and time from appointment date
  const appointmentDate = new Date(appointment.date);
  const date = appointmentDate;
  const time = format(appointmentDate, "HH:mm");
  
  return <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-500" />
            Modifier le rendez-vous
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifiez les détails du rendez-vous en utilisant le formulaire ci-dessous.
          </p>
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <Badge className={
            appointment.status === "SCHEDULED" ? "bg-blue-500" :
            appointment.status === "COMPLETED" ? "bg-green-500" :
            appointment.status === "CANCELED" ? "bg-red-500" :
            "bg-amber-500"
          }>
            {appointment.status === "SCHEDULED" ? "Planifié" :
             appointment.status === "COMPLETED" ? "Terminé" :
             appointment.status === "CANCELED" ? "Annulé" :
             "Reporté"}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {appointment.status === "SCHEDULED" && (
            <Button 
              variant="destructive" 
              onClick={handleCancel}
            >
              Annuler le rendez-vous
            </Button>
          )}
          
          {appointment.status === "COMPLETED" && (
            <Button variant="outline" asChild>
              <Link to={`/invoices/new?appointmentId=${appointment.id}`}>
                <FileText2 className="h-4 w-4 mr-2" />
                Créer une facture
              </Link>
            </Button>
          )}
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <AppointmentForm 
            patients={patients} 
            defaultValues={{
              patientId: appointment.patientId,
              date,
              time,
              reason: appointment.reason,
              status: appointment.status
            }} 
            appointmentId={appointment.id} 
            isEditing={true} 
          />
        </div>
      </div>
    </Layout>;
};

export default EditAppointmentPage;
