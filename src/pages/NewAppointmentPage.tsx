
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentForm } from "@/components/appointment-form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const NewAppointmentPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get('patientId') ? parseInt(queryParams.get('patientId')!) : undefined;
  const dateParam = queryParams.get('date');
  const timeParam = queryParams.get('time');
  const { user } = useAuth();

  // Parse date from URL parameters if provided
  let defaultDate = new Date();
  if (dateParam) {
    try {
      defaultDate = new Date(dateParam);
    } catch (e) {
      console.error("Invalid date parameter:", dateParam);
    }
  }

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        console.log("Fetching patients for current user:", user?.id);
        const data = await api.getPatients();
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} patients successfully`);
        } else {
          console.log("No patients found or empty array returned");
        }
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Impossible de charger les patients. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Nouveau rendez-vous
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez un rendez-vous en remplissant le formulaire ci-dessous.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <AppointmentForm 
              patients={patients} 
              defaultValues={{ 
                patientId,
                date: defaultDate,
                time: timeParam || "09:00",
                status: "SCHEDULED"
              }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewAppointmentPage;
