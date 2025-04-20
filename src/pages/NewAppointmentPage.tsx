import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentForm } from "@/components/appointment-form";
import { toast } from "sonner";
const NewAppointmentPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get('patientId') ? parseInt(queryParams.get('patientId')!) : undefined;
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Impossible de charger les patients. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);
  return <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-500" />
            Nouveau rendez-vous
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez un rendez-vous en remplissant le formulaire ci-dessous.
          </p>
        </div>

        {loading ? <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div> : <div className="bg-card rounded-lg border shadow-sm p-6">
            <AppointmentForm patients={patients} defaultValues={{
          patientId,
          date: new Date(),
          time: "09:00",
          status: "SCHEDULED"
        }} />
          </div>}
      </div>
    </Layout>;
};
export default NewAppointmentPage;