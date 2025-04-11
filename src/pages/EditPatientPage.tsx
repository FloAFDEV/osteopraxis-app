import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/ui/layout";
import { PatientForm } from '@/components/patient-form';
import { Patient, Contraception } from '@/types';
import { toast } from 'sonner';
import { UserRound } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { patientService } from '@/services/api/patient-service';
const EditPatientPage = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!id) return;
    const loadPatient = async () => {
      try {
        setIsLoading(true);
        const patientId = parseInt(id);
        const patient = await patientService.getPatientById(patientId);
        if (!patient) {
          toast.error("Patient non trouvé");
          navigate('/patients');
          return;
        }
        setPatient(patient as Patient);
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
      setIsSaving(true);
      console.info("Submitting values:", updatedData);

      // Make sure hasChildren is kept as a string to match Patient type
      if (typeof updatedData.hasChildren === 'boolean') {
        updatedData.hasChildren = updatedData.hasChildren ? "true" : "false";
      }

      // Use the patientService updatePatient method
      const result = await patientService.updatePatient({
        ...patient,
        ...updatedData,
        updatedAt: new Date().toISOString()
      });
      toast.success("Patient mis à jour avec succès");
      navigate('/patients');
    } catch (error: any) {
      console.error("Error updating patient:", error);
      toast.error("Impossible de mettre à jour le patient");
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du patient...</p>
          </div>
        </div>
      </Layout>;
  }
  if (!patient) {
    return <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-4">Patient non trouvé</div>
            <button onClick={() => navigate('/patients')} className="px-4 py-2 bg-primary text-white rounded-md">
              Retour à la liste des patients
            </button>
          </div>
        </div>
      </Layout>;
  }

  // Affichage des informations sur les enfants si le patient en a
  const hasChildren = patient.hasChildren === "true";
  const childrenInfo = hasChildren && patient.childrenAges && patient.childrenAges.length > 0 ? `${patient.childrenAges.length} enfant(s): ${patient.childrenAges.join(', ')} ans` : null;
  return <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserRound className="h-8 w-8 text-pink-500" />
            Modifier le patient
          </h1>
          <p className="text-muted-foreground mt-1">
            Modifiez les informations du patient {patient.firstName} {patient.lastName}
          </p>
          {childrenInfo && <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-700">
              <span className="font-medium">Enfants : </span>{childrenInfo}
            </div>}
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <PatientForm patient={patient} onSave={handleSave} isLoading={isSaving} />
        </div>
      </div>
    </Layout>;
};
export default EditPatientPage;