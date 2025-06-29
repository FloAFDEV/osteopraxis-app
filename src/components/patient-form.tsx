
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Patient } from "@/types";
import { GeneralTab } from "./patient-form/GeneralTab";
import { ContactTab } from "./patient-form/ContactTab";
import { MedicalTab } from "./patient-form/MedicalTab";
import { PediatricTab } from "./patient-form/PediatricTab";
import { ExaminationsTab } from "./patient-form/ExaminationsTab";
import { AdditionalFieldsTab } from "./patient-form/AdditionalFieldsTab";
import { SpecializedFieldsTab } from "./patient-form/SpecializedFieldsTab";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { PatientFormValues } from "./patient-form/types";

interface PatientFormProps {
  patient?: Partial<Patient>;
  onSubmit: (patient: Partial<Patient>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [childrenAgesInput, setChildrenAgesInput] = useState("");
  const [currentCabinetId, setCurrentCabinetId] = useState<string | null>(
    patient?.cabinetId?.toString() || null
  );

  const form = useForm<PatientFormValues>({
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      birthDate: patient?.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : "",
      address: patient?.address || "",
      gender: patient?.gender || null,
      height: patient?.height || null,
      weight: patient?.weight || null,
      bmi: patient?.bmi || null,
      cabinetId: patient?.cabinetId || null,
      maritalStatus: patient?.maritalStatus || null,
      occupation: patient?.occupation || null,
      hasChildren: patient?.hasChildren || null,
      childrenAges: patient?.childrenAges || null,
      generalPractitioner: patient?.generalPractitioner || null,
      surgicalHistory: patient?.surgicalHistory || null,
      traumaHistory: patient?.traumaHistory || null,
      rheumatologicalHistory: patient?.rheumatologicalHistory || null,
      currentTreatment: patient?.currentTreatment || null,
      handedness: patient?.handedness || null,
      hasVisionCorrection: patient?.hasVisionCorrection || false,
      ophtalmologistName: patient?.ophtalmologistName || null,
      entProblems: patient?.entProblems || null,
      entDoctorName: patient?.entDoctorName || null,
      digestiveProblems: patient?.digestiveProblems || null,
      digestiveDoctorName: patient?.digestiveDoctorName || null,
      physicalActivity: patient?.physicalActivity || null,
      isSmoker: patient?.isSmoker || false,
      isExSmoker: patient?.isExSmoker || false,
      smokingSince: patient?.smokingSince || null,
      smokingAmount: patient?.smokingAmount || null,
      quitSmokingDate: patient?.quitSmokingDate || null,
      contraception: patient?.contraception || null,
      familyStatus: patient?.familyStatus || null,
      complementaryExams: patient?.complementaryExams || null,
      generalSymptoms: patient?.generalSymptoms || null,
      pregnancyHistory: patient?.pregnancyHistory || null,
      birthDetails: patient?.birthDetails || null,
      developmentMilestones: patient?.developmentMilestones || null,
      sleepingPattern: patient?.sleepingPattern || null,
      feeding: patient?.feeding || null,
      behavior: patient?.behavior || null,
      childCareContext: patient?.childCareContext || null,
      allergies: patient?.allergies || null,
      osteopathId: patient?.osteopathId ? Number(patient.osteopathId) : null,
      ...patient
    }
  });

  const isChild = React.useMemo(() => {
    const birthDate = form.watch("birthDate");
    if (!birthDate) return false;
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return age < 18;
  }, [form.watch("birthDate")]);

  useEffect(() => {
    if (patient?.childrenAges) {
      setChildrenAgesInput(patient.childrenAges.join(", "));
    }
  }, [patient?.childrenAges]);

  const handleSubmit = async (data: PatientFormValues) => {
    try {
      let processedChildrenAges = null;
      if (data.hasChildren === "true" && childrenAgesInput.trim()) {
        processedChildrenAges = childrenAgesInput
          .split(",")
          .map(age => parseInt(age.trim()))
          .filter(age => !isNaN(age));
      }

      const processedData = {
        ...data,
        childrenAges: processedChildrenAges,
        cabinetId: currentCabinetId ? Number(currentCabinetId) : null,
        osteopathId: data.osteopathId ? Number(data.osteopathId) : null,
      };

      await onSubmit(processedData);
      toast.success("Patient enregistré avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Erreur lors de l'enregistrement du patient");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{patient?.id ? "Modifier le patient" : "Nouveau patient"}</CardTitle>
            <CardDescription>
              Remplissez les informations du patient dans les différents onglets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 mb-6 h-auto p-1 gap-1">
                <TabsTrigger 
                  value="general" 
                  className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="hidden sm:inline">Général</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="hidden sm:inline">Contact</span>
                  <span className="sm:hidden">Tel</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="medical" 
                  className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="hidden sm:inline">Médical</span>
                  <span className="sm:hidden">Méd</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="pediatric" 
                  className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="hidden sm:inline">Pédiatrie</span>
                  <span className="sm:hidden">Péd</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="examinations" 
                  className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="hidden sm:inline">Examens</span>
                  <span className="sm:hidden">Ex</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="additional" 
                  className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="hidden sm:inline">Additionnel</span>
                  <span className="sm:hidden">Add</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="specialized" 
                  className="text-xs px-1 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="hidden sm:inline">Spécialisé</span>
                  <span className="sm:hidden">Sp</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <GeneralTab 
                  form={form} 
                  childrenAgesInput={childrenAgesInput}
                  setChildrenAgesInput={setChildrenAgesInput}
                  currentCabinetId={currentCabinetId}
                  setCurrentCabinetId={setCurrentCabinetId}
                />
              </TabsContent>

              <TabsContent value="contact">
                <ContactTab form={form} />
              </TabsContent>

              <TabsContent value="medical">
                <MedicalTab form={form} isChild={isChild} />
              </TabsContent>

              <TabsContent value="pediatric">
                <PediatricTab form={form} />
              </TabsContent>

              <TabsContent value="examinations">
                <ExaminationsTab form={form} />
              </TabsContent>

              <TabsContent value="additional">
                <AdditionalFieldsTab form={form} isChild={isChild} />
              </TabsContent>

              <TabsContent value="specialized">
                <SpecializedFieldsTab form={form} />
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default PatientForm;
