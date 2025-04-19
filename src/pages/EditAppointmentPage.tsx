
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { Appointment, Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import AppointmentForm from "@/components/appointment-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <AppointmentForm 
            patients={patients} 
            defaultValues={{
              patientId: appointment.patientId,
              date,
              time,
              // Utiliser notes ou reason, selon ce qui est disponible
              reason: appointment.notes || appointment.reason,
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
