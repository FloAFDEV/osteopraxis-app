
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { AppointmentForm } from "@/components/appointment-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { AppointmentFormProps } from "@/types";

const NewAppointmentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // État pour stocker les données initiales nécessaires au composant de formulaire
  const [formInitialData, setFormInitialData] = useState({
    patients: [],
    cabinets: [],
    initialDate: new Date(),
  });

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);

        // Récupérer la liste des patients
        const patientsData = await api.getPatients();
        if (!patientsData || patientsData.length === 0) {
          console.warn("Aucun patient disponible pour créer un rendez-vous.");
        }

        // Récupérer la liste des cabinets pour l'utilisateur actuellement connecté
        let cabinetsData = [];
        if (user && user.professionalProfileId) {
          cabinetsData = await api.getCabinetsByProfessionalProfileId(user.professionalProfileId);
        }

        if (!cabinetsData || cabinetsData.length === 0) {
          console.warn("Aucun cabinet disponible pour créer un rendez-vous.");
        }

        setFormInitialData({
          patients: patientsData || [],
          cabinets: cabinetsData || [],
          initialDate: new Date(),
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation du formulaire de rendez-vous:", error);
        setInitError("Impossible de charger les données nécessaires. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [user]);

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      setLoading(true);

      // Formater correctement les données pour l'API
      const formattedAppointment = {
        ...appointmentData,
        patientId: parseInt(appointmentData.patientId),
        cabinetId: appointmentData.cabinetId ? parseInt(appointmentData.cabinetId) : undefined,
        date: format(appointmentData.date, "yyyy-MM-dd"),
        status: "PLANNED", // Statut initial pour un nouveau rendez-vous
        notificationSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Appel API pour créer le rendez-vous
      const newAppointment = await api.createAppointment(formattedAppointment);

      toast.success(`Rendez-vous créé le ${format(new Date(newAppointment.date), "PPPP", { locale: fr })}`);
      navigate("/appointments");
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      toast.error(
        error instanceof Error 
          ? `Erreur: ${error.message}` 
          : "Une erreur est survenue lors de la création du rendez-vous"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formInitialData.patients.length) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (initError) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-red-500 mb-4 text-lg">⚠️ Erreur</div>
          <p className="mb-4">{initError}</p>
          <button 
            onClick={() => navigate("/appointments")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour à la liste des rendez-vous
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-blue-500" />
            Nouveau rendez-vous
          </h1>
          <p className="text-muted-foreground mt-1">
            Planifiez un nouveau rendez-vous en remplissant le formulaire ci-dessous.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <AppointmentForm 
            patients={formInitialData.patients}
            cabinets={formInitialData.cabinets}
            initialDate={formInitialData.initialDate}
            onSubmit={handleCreateAppointment}
            isSubmitting={loading}
            onCancel={() => navigate("/appointments")}
          />
        </div>
      </div>
    </Layout>
  );
};

export default NewAppointmentPage;
