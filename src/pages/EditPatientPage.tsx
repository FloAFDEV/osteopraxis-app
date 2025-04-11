
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/ui/layout";
import { PatientForm } from '@/components/patient-form';
import { api } from '@/services/api';
import { Patient } from '@/types';
import { toast } from 'sonner';
import { UserRound } from 'lucide-react';

const EditPatientPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadPatient = async () => {
      try {
        const patientId = parseInt(id);
        const data = await api.getPatientById(patientId);
        
        if (!data) {
          toast.error("Patient non trouvé");
          navigate('/patients');
          return;
        }
        
        // Assurer que tous les champs sont correctement formatés
        const formattedPatient = {
          ...data,
          // Convertir les champs booléens pour être sûr qu'ils sont de type boolean
          hasChildren: typeof data.hasChildren === 'string' 
            ? data.hasChildren.toLowerCase() === 'true' 
            : Boolean(data.hasChildren),
          isSmoker: Boolean(data.isSmoker),
          hasVisionCorrection: Boolean(data.hasVisionCorrection)
        };
        
        setPatient(formattedPatient);
      } catch (error) {
        console.error("Error loading patient:", error);
        toast.error("Impossible de charger les données du patient");
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [id, navigate]);

  const handleSave = async (updatedData: any) => {
    if (!patient) return;
    
    try {
      // Merge the updated form data with the existing patient data
      const updatedPatient: Patient = {
        ...patient,
        ...updatedData,
        // Ensure these required fields are present
        id: patient.id,
        createdAt: patient.createdAt,
        updatedAt: new Date().toISOString(),
        osteopathId: patient.osteopathId,
        userId: patient.userId,
      };
      
      await api.updatePatient(updatedPatient);
      toast.success("Patient mis à jour avec succès");
      navigate('/patients');
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Impossible de mettre à jour le patient");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du patient...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-4">Patient non trouvé</div>
            <button
              onClick={() => navigate('/patients')}
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              Retour à la liste des patients
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserRound className="h-8 w-8 text-primary" />
            Modifier le patient
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifiez les informations du patient {patient.firstName} {patient.lastName}
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <PatientForm patient={patient} onSave={handleSave} />
        </div>
      </div>
    </Layout>
  );
};

export default EditPatientPage;
