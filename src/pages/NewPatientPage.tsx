import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { PatientForm } from "@/components/patient-form";
import { toast } from "sonner";

const NewPatientPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddPatient = async (patientData: any) => {
    try {
      setLoading(true);
      
      // The childrenAges field is now processed by the zod schema transformation
      // and should already be an array of numbers, no need for any conversion here
      
      const newPatient = await api.createPatient({
        ...patientData,
        osteopathId: 1, // Pour la démo, nous utilisons l'ostéopathe ID 1
        cabinetId: 1 // Pour la démo, nous utilisons le cabinet ID 1
      });
      
      toast.success(`Patient ${newPatient.firstName} ${newPatient.lastName} ajouté avec succès`);
      navigate(`/patients/${newPatient.id}`);
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error("Impossible d'ajouter le patient. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-primary" />
            Nouveau patient
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez un nouveau patient en remplissant le formulaire ci-dessous.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Enregistrement du patient...</p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <PatientForm onSubmit={handleAddPatient} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewPatientPage;
