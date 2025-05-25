
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GeneralTab } from "./patient-form/GeneralTab";
import { ContactTab } from "./patient-form/ContactTab";
import { MedicalTab } from "./patient-form/MedicalTab";
import { ExaminationsTab } from "./patient-form/ExaminationsTab";
import { PediatricTab } from "./patient-form/PediatricTab";
import { AdditionalFieldsTab } from "./patient-form/AdditionalFieldsTab";
import { PatientFormProps, PatientFormValues } from "./patient-form/types";
import getPatientSchema from "@/utils/patient-form-helpers";
import { Patient } from "@/types";

export function PatientForm({
  patient,
  onSubmit,
  onSave,
  emailRequired = false,
  selectedCabinetId,
  isLoading = false,
}: PatientFormProps) {
  const [activeTab, setActiveTab] = useState("general");

  // Calcul de l'âge pour déterminer si c'est un enfant
  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isChild = patient ? calculateAge(patient.birthDate) !== null && calculateAge(patient.birthDate)! < 18 : false;

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(getPatientSchema(emailRequired)),
    defaultValues: {
      // Informations de base
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      birthDate: patient?.birthDate ? new Date(patient.birthDate) : undefined,
      address: patient?.address || "",
      
      // Informations personnelles
      gender: patient?.gender || null,
      height: patient?.height || null,
      weight: patient?.weight || null,
      bmi: patient?.bmi || null,
      cabinetId: patient?.cabinetId || selectedCabinetId || null,
      maritalStatus: patient?.maritalStatus || null,
      occupation: patient?.occupation || null,
      hasChildren: patient?.hasChildren || null,
      childrenAges: patient?.childrenAges || null,
      
      // Médecins et santé
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
      
      // Tabagisme - utiliser les bonnes propriétés
      isSmoker: patient?.isSmoker || false,
      isExSmoker: patient?.isExSmoker || false,
      smokingSince: patient?.smokingSince || null,
      smokingAmount: patient?.smokingAmount || null,
      quitSmokingDate: patient?.quitSmokingDate || null,
      
      // Contraception et statut familial
      contraception: patient?.contraception || null,
      familyStatus: patient?.familyStatus || null,
      
      // Examens et symptômes
      complementaryExams: patient?.complementaryExams || null,
      generalSymptoms: patient?.generalSymptoms || null,
      allergies: patient?.allergies || null,
      
      // Historique de grossesse et développement (enfants)
      pregnancyHistory: patient?.pregnancyHistory || null,
      birthDetails: patient?.birthDetails || null,
      developmentMilestones: patient?.developmentMilestones || null,
      sleepingPattern: patient?.sleepingPattern || null,
      feeding: patient?.feeding || null,
      behavior: patient?.behavior || null,
      childCareContext: patient?.childCareContext || null,
      
      // Nouveaux champs généraux
      ent_followup: patient?.ent_followup || null,
      intestinal_transit: patient?.intestinal_transit || null,
      sleep_quality: patient?.sleep_quality || null,
      fracture_history: patient?.fracture_history || null,
      dental_health: patient?.dental_health || null,
      sport_frequency: patient?.sport_frequency || null,
      gynecological_history: patient?.gynecological_history || null,
      other_comments_adult: patient?.other_comments_adult || null,
      
      // Nouveaux champs spécifiques aux enfants
      fine_motor_skills: patient?.fine_motor_skills || null,
      gross_motor_skills: patient?.gross_motor_skills || null,
      weight_at_birth: patient?.weight_at_birth || null,
      height_at_birth: patient?.height_at_birth || null,
      head_circumference: patient?.head_circumference || null,
      apgar_score: patient?.apgar_score || null,
      childcare_type: patient?.childcare_type || null,
      school_grade: patient?.school_grade || null,
      pediatrician_name: patient?.pediatrician_name || null,
      paramedical_followup: patient?.paramedical_followup || null,
      other_comments_child: patient?.other_comments_child || null,
    },
  });

  const handleSubmit = async (data: PatientFormValues) => {
    try {
      console.log("Form data being submitted:", data);
      
      if (onSubmit) {
        await onSubmit(data);
      } else if (onSave) {
        await onSave(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const tabs = [
    { id: "general", label: "Général", icon: "👤" },
    { id: "contact", label: "Contact", icon: "📞" },
    { id: "medical", label: "Médical", icon: "🏥" },
    { id: "examinations", label: "Examens", icon: "🔬" },
    ...(isChild ? [{ id: "pediatric", label: "Pédiatrie", icon: "👶" }] : []),
    { id: "additional", label: "Supplémentaire", icon: "📋" },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {patient ? "Modifier" : "Ajouter"} un patient
          {isChild && <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Enfant</span>}
        </CardTitle>
        <CardDescription>
          {patient 
            ? `Modification des informations de ${patient.firstName} ${patient.lastName}`
            : "Saisissez les informations du nouveau patient"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                    <span className="hidden sm:inline">{tab.icon}</span>
                    <span className="ml-1">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="general">
                <GeneralTab form={form} />
              </TabsContent>

              <TabsContent value="contact">
                <ContactTab form={form} />
              </TabsContent>

              <TabsContent value="medical">
                <MedicalTab form={form} />
              </TabsContent>

              <TabsContent value="examinations">
                <ExaminationsTab form={form} />
              </TabsContent>

              {isChild && (
                <TabsContent value="pediatric">
                  <PediatricTab form={form} />
                </TabsContent>
              )}

              <TabsContent value="additional">
                <AdditionalFieldsTab form={form} />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? "Enregistrement..." : patient ? "Mettre à jour" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
