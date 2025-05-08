
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { PatientForm } from "@/components/patient-form";
import { toast } from "sonner";
import { Patient } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const NewPatientPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Redirection si l'utilisateur n'est pas connecté
  if (!isAuthenticated || !user) {
    toast.error("Vous devez être connecté pour ajouter un patient");
    navigate("/login");
    return null;
  }
  
  const handleAddPatient = async (patientData: any) => {
    try {
      setLoading(true);

      // Vérifier les champs obligatoires
      if (!patientData.firstName || !patientData.lastName) {
        toast.error("Veuillez remplir au moins le nom et le prénom");
        setLoading(false);
        return;
      }

      // Convertir la date si elle est au format Date
      if (patientData.birthDate instanceof Date) {
        patientData.birthDate = patientData.birthDate.toISOString();
      }
      console.log("Données patient avant création:", patientData);

      // Utiliser l'ID de l'ostéopathe connecté au lieu de la valeur en dur
      const patientToCreate = {
        ...patientData,
        osteopathId: user.osteopathId || user.id, // Utilise osteopathId ou id selon ce qui est disponible
        cabinetId: 1, // Pour la démo, nous utilisons toujours le cabinet ID 1
        userId: null // Requis par le type mais peut être null
      } as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;

      console.log("Envoi du patient à l'API avec osteopathId:", patientToCreate.osteopathId);
      const newPatient = await api.createPatient(patientToCreate);
      console.log("Patient créé avec succès:", newPatient);
      
      toast.success(`Patient ${newPatient.firstName} ${newPatient.lastName} ajouté avec succès`);
      
      setTimeout(() => {
        navigate(`/patients/${newPatient.id}`);
      }, 1500);
    } catch (error) {
      console.error("Error adding patient:", error);
      if (error instanceof Error && error.message.includes("duplicate key value")) {
        toast.error("Cet email est déjà utilisé par un autre patient.");
      } else {
        toast.error(error instanceof Error ? `Erreur: ${error.message}` : "Impossible d'ajouter le patient. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-pink-500" />
            Nouveau patient
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez un nouveau patient en remplissant le formulaire ci-dessous.
          </p>
        </div>

        <div className="relative mb-6 p-4 bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-950/20 dark:to-pink-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
          <div className="flex flex-col md:flex-row items-center">
            <img src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=120&h=120&q=80" alt="Nouveau patient" className="w-24 h-24 rounded-md object-cover mb-4 md:mb-0 md:mr-6" />
            <div>
              <h3 className="text-lg font-medium text-pink-800 dark:text-pink-300">Ajout d'un nouveau patient</h3>
              <p className="text-pink-600/70 dark:text-pink-400/70 mt-1">
                Les informations collectées permettront d'assurer un suivi de qualité et d'offrir des soins personnalisés.
                Remplissez les champs obligatoires pour commencer.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 bg-card rounded-lg border">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
              <p className="text-muted-foreground">Enregistrement du patient...</p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <PatientForm onSave={handleAddPatient} emailRequired={false} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewPatientPage;
