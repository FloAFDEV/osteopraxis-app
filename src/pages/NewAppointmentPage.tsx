
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import { api } from "@/services/api";
import { Patient } from "@/types";
import { Layout } from "@/components/ui/layout";
import { AppointmentForm } from "@/components/appointment-form";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-400" />
            Nouveau rendez-vous
          </h1>
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground mt-1 mb-6">
          Créez un rendez-vous en remplissant le formulaire ci-dessous.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-md">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border shadow-md p-6 hover:shadow-lg transition-all duration-300">
            <AppointmentForm 
              patients={patients} 
              defaultValues={{ 
                patientId,
                date: new Date(),
                time: "09:00",
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
