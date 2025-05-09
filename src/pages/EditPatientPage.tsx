
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/ui/layout";
import { PatientForm } from '@/components/patient-form';
import { Patient } from '@/types';
import { toast } from 'sonner';
import { UserRound, Trash } from 'lucide-react';
import { patientService } from '@/services/api/patient-service';
import ConfirmDeletePatientModal from "@/components/modals/ConfirmDeletePatientModal";
import { Button } from "@/components/ui/button";

const EditPatientPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);

  // Récupérer le cabinet sélectionné depuis le localStorage
  useEffect(() => {
    const storedCabinetId = localStorage.getItem("selectedCabinetId");
    if (storedCabinetId) {
      setSelectedCabinetId(Number(storedCabinetId));
    }
  }, []);

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
      
      // Ensure enum fields are properly formatted
      const patientUpdate = {
        ...patient,
        ...updatedData,
        // Préserver le cabinetId existant ou utiliser celui du formulaire ou celui de la navbar
        cabinetId: updatedData.cabinetId || patient.cabinetId || selectedCabinetId || 1,
        updatedAt: new Date().toISOString(),
        // Make sure these fields are properly set for the update
        gender: updatedData.gender || patient.gender,
        maritalStatus: updatedData.maritalStatus || patient.maritalStatus,
        handedness: updatedData.handedness || patient.handedness,
        contraception: updatedData.contraception || patient.contraception,
        // Ensure all required fields are present
        complementaryExams: updatedData.complementaryExams || patient.complementaryExams || null,
        generalSymptoms: updatedData.generalSymptoms || patient.generalSymptoms || null,
        pregnancyHistory: updatedData.pregnancyHistory || patient.pregnancyHistory || null,
        birthDetails: updatedData.birthDetails || patient.birthDetails || null,
        developmentMilestones: updatedData.developmentMilestones || patient.developmentMilestones || null,
        sleepingPattern: updatedData.sleepingPattern || patient.sleepingPattern || null,
        feeding: updatedData.feeding || patient.feeding || null,
        behavior: updatedData.behavior || patient.behavior || null,
        childCareContext: updatedData.childCareContext || patient.childCareContext || null
      };

      console.log("Mise à jour du patient avec cabinetId:", patientUpdate.cabinetId);

      // Use the patientService updatePatient method
      await patientService.updatePatient(patientUpdate);

      // Afficher le toast de succès ici
      toast.success("Patient mis à jour avec succès");
      
      // Attendre un peu avant de naviguer pour laisser le toast s'afficher
      setTimeout(() => {
        navigate('/patients');
      }, 1500);
    } catch (error: any) {
      console.error("Error updating patient:", error);
      toast.error("Impossible de mettre à jour le patient");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePatient = async () => {
    setShowDeleteModal(false);
    if (!patient) return;
    try {
      await patientService.deletePatient(patient.id);
      toast.success("Patient supprimé avec succès !");
      setTimeout(() => {
        navigate("/patients");
      }, 1500);
    } catch (err) {
      toast.error("Erreur lors de la suppression du patient");
      setShowDeleteModal(false);
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
            <button onClick={() => navigate('/patients')} className="px-4 py-2 bg-primary text-white rounded-md">
              Retour à la liste des patients
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Affichage des informations sur les enfants si le patient en a
  const hasChildren = patient?.hasChildren === "true";
  const childrenInfo = hasChildren && patient?.childrenAges && patient.childrenAges.length > 0 ? `${patient.childrenAges.length} enfant(s): ${patient.childrenAges.join(', ')} ans` : null;
  
  return (
    <Layout>
      <ConfirmDeletePatientModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={handleDeletePatient}
        patientName={patient?.firstName + " " + patient?.lastName}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserRound className="h-8 w-8 text-pink-500" />
              Modifier la fiche patient de {patient?.firstName} {patient?.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Modifiez les informations du patient
            </p>
            {patient?.hasChildren === "true" && patient?.childrenAges && patient.childrenAges.length > 0 && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-700">
                <span className="font-medium">Enfants : </span> 
                {patient.childrenAges.length} enfant(s): {patient.childrenAges.join(', ')} ans
              </div>
            )}
          </div>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2" size="sm">
            <Trash className="mr-1 h-4 w-4" />
            Supprimer
          </Button>
        </div>
        {patient && (
          <PatientForm 
            patient={patient} 
            onSave={handleSave} 
            isLoading={isSaving} 
            selectedCabinetId={selectedCabinetId}
          />
        )}
      </div>
    </Layout>
  );
};

export default EditPatientPage;
