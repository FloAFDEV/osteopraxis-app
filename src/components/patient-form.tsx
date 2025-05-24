
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Patient } from "@/types";
import { PatientFormProps, PatientFormValues } from "./patient-form/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CabinetSelector } from "@/components/cabinet/cabinet-selector";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TranslatedSelect from "@/components/ui/translated-select";
import { GeneralTab } from "./patient-form/GeneralTab";
import { WeightHeightBmiFields } from "./patient-form/WeightHeightBmiFields";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')).nullable(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  birthDate: z.string().optional().or(z.literal('')).nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'Homme', 'Femme']).optional().nullable(),
  address: z.string().optional().or(z.literal('')).nullable(),
  maritalStatus: z.string().optional().or(z.literal('')).nullable(),
  occupation: z.string().optional().or(z.literal('')).nullable(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  bmi: z.number().optional().nullable(),
  handedness: z.string().optional().or(z.literal('')).nullable(),
  hasChildren: z.string().optional().or(z.literal('')).nullable(),
  isSmoker: z.boolean().optional(),
  physicalActivity: z.string().optional().or(z.literal('')).nullable(),
  surgicalHistory: z.string().optional().or(z.literal('')).nullable(),
  allergies: z.string().optional().or(z.literal('')).nullable(),
  contraception: z.string().optional().or(z.literal('')).nullable(),
  cabinetId: z.number().optional(),
  childrenAges: z.array(z.number()).optional().nullable(),
  
  // Additional required fields from PatientFormValues
  generalPractitioner: z.string().optional().nullable(),
  traumaHistory: z.string().optional().nullable(),
  rheumatologicalHistory: z.string().optional().nullable(),
  currentTreatment: z.string().optional().nullable(),
  hasVisionCorrection: z.boolean().optional(),
  ophtalmologistName: z.string().optional().nullable(),
  entProblems: z.string().optional().nullable(),
  entDoctorName: z.string().optional().nullable(),
  digestiveProblems: z.string().optional().nullable(),
  digestiveDoctorName: z.string().optional().nullable(),
  isExSmoker: z.boolean().optional(),
  smokingSince: z.string().optional().nullable(),
  smokingAmount: z.string().optional().nullable(),
  quitSmokingDate: z.string().optional().nullable(),
  familyStatus: z.string().optional().nullable(),
  complementaryExams: z.string().optional().nullable(),
  generalSymptoms: z.string().optional().nullable(),
  pregnancyHistory: z.string().optional().nullable(),
  birthDetails: z.string().optional().nullable(),
  developmentMilestones: z.string().optional().nullable(),
  sleepingPattern: z.string().optional().nullable(),
  feeding: z.string().optional().nullable(),
  behavior: z.string().optional().nullable(),
  childCareContext: z.string().optional().nullable(),
  
  // Nouveaux champs généraux
  ent_followup: z.string().optional().nullable(),
  intestinal_transit: z.string().optional().nullable(),
  sleep_quality: z.string().optional().nullable(),
  fracture_history: z.string().optional().nullable(),
  dental_health: z.string().optional().nullable(),
  sport_frequency: z.string().optional().nullable(),
  gynecological_history: z.string().optional().nullable(),
  other_comments_adult: z.string().optional().nullable(),
  
  // Nouveaux champs spécifiques aux enfants
  fine_motor_skills: z.string().optional().nullable(),
  gross_motor_skills: z.string().optional().nullable(),
  weight_at_birth: z.number().optional().nullable(),
  height_at_birth: z.number().optional().nullable(),
  head_circumference: z.number().optional().nullable(),
  apgar_score: z.string().optional().nullable(),
  childcare_type: z.string().optional().nullable(),
  school_grade: z.string().optional().nullable(),
  pediatrician_name: z.string().optional().nullable(),
  paramedical_followup: z.string().optional().nullable(),
  other_comments_child: z.string().optional().nullable(),
});

// Fonction pour convertir les genres legacy
const convertGender = (gender: string | null): "MALE" | "FEMALE" | "OTHER" | "Homme" | "Femme" | null => {
  if (!gender) return null;
  return gender as "MALE" | "FEMALE" | "OTHER" | "Homme" | "Femme";
};

export const PatientForm = ({ patient, onSubmit, onSave }: PatientFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | undefined>(
    patient?.cabinetId || undefined
  );
  const [childrenAgesInput, setChildrenAgesInput] = useState<string>(
    patient?.childrenAges?.join(", ") || ""
  );
  const [currentCabinetId, setCurrentCabinetId] = useState<string | null>(
    patient?.cabinetId?.toString() || null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      birthDate: patient?.birthDate || "",
      gender: convertGender(patient?.gender as string),
      address: patient?.address || "",
      maritalStatus: patient?.maritalStatus || "",
      occupation: patient?.occupation || "",
      height: patient?.height || undefined,
      weight: patient?.weight || undefined,
      bmi: patient?.bmi || undefined,
      handedness: patient?.handedness || "",
      hasChildren: patient?.hasChildren || "",
      isSmoker: patient?.isSmoker || false,
      physicalActivity: patient?.physicalActivity || "",
      surgicalHistory: patient?.surgicalHistory || "",
      allergies: patient?.allergies || "",
      contraception: patient?.contraception || "",
      cabinetId: patient?.cabinetId || undefined,
      childrenAges: patient?.childrenAges || [],
      
      // Initialize additional fields
      generalPractitioner: patient?.generalPractitioner || "",
      traumaHistory: patient?.traumaHistory || "",
      rheumatologicalHistory: patient?.rheumatologicalHistory || "",
      currentTreatment: patient?.currentTreatment || "",
      hasVisionCorrection: patient?.hasVisionCorrection || false,
      ophtalmologistName: patient?.ophtalmologistName || "",
      entProblems: patient?.entProblems || "",
      entDoctorName: patient?.entDoctorName || "",
      digestiveProblems: patient?.digestiveProblems || "",
      digestiveDoctorName: patient?.digestiveDoctorName || "",
      isExSmoker: patient?.isExSmoker || false,
      smokingSince: patient?.smokingSince || "",
      smokingAmount: patient?.smokingAmount || "",
      quitSmokingDate: patient?.quitSmokingDate || "",
      familyStatus: patient?.familyStatus || "",
      complementaryExams: patient?.complementaryExams || "",
      generalSymptoms: patient?.generalSymptoms || "",
      pregnancyHistory: patient?.pregnancyHistory || "",
      birthDetails: patient?.birthDetails || "",
      developmentMilestones: patient?.developmentMilestones || "",
      sleepingPattern: patient?.sleepingPattern || "",
      feeding: patient?.feeding || "",
      behavior: patient?.behavior || "",
      childCareContext: patient?.childCareContext || "",
      
      // Nouveaux champs généraux
      ent_followup: patient?.ent_followup || "",
      intestinal_transit: patient?.intestinal_transit || "",
      sleep_quality: patient?.sleep_quality || "",
      fracture_history: patient?.fracture_history || "",
      dental_health: patient?.dental_health || "",
      sport_frequency: patient?.sport_frequency || "",
      gynecological_history: patient?.gynecological_history || "",
      other_comments_adult: patient?.other_comments_adult || "",
      
      // Nouveaux champs spécifiques aux enfants
      fine_motor_skills: patient?.fine_motor_skills || "",
      gross_motor_skills: patient?.gross_motor_skills || "",
      weight_at_birth: patient?.weight_at_birth || undefined,
      height_at_birth: patient?.height_at_birth || undefined,
      head_circumference: patient?.head_circumference || undefined,
      apgar_score: patient?.apgar_score || "",
      childcare_type: patient?.childcare_type || "",
      school_grade: patient?.school_grade || "",
      pediatrician_name: patient?.pediatrician_name || "",
      paramedical_followup: patient?.paramedical_followup || "",
      other_comments_child: patient?.other_comments_child || "",
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Traiter les âges des enfants
      let childrenAgesArray: number[] = [];
      if (childrenAgesInput.trim()) {
        childrenAgesArray = childrenAgesInput
          .split(",")
          .map((age) => parseInt(age.trim()))
          .filter((age) => !isNaN(age));
      }

      // Ajouter le cabinetId sélectionné aux données du patient
      const patientData = {
        ...data,
        cabinetId: selectedCabinetId,
        childrenAges: childrenAgesArray.length > 0 ? childrenAgesArray : null,
      };

      if (patient) {
        // Mode édition
        if (onSubmit || onSave) {
          await (onSubmit || onSave)?.(patientData);
        } else {
          await api.updatePatient({ ...patient, ...patientData });
          toast.success("Patient mis à jour avec succès");
          navigate("/patients");
        }
      } else {
        // Mode création
        await api.createPatient(patientData);
        toast.success("Patient créé avec succès");
        navigate("/patients");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du patient:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{patient ? "Modifier" : "Créer"} un patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Sélecteur de cabinet */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Cabinet <span className="text-red-500">*</span>
                </label>
                <CabinetSelector
                  selectedCabinetId={selectedCabinetId}
                  onCabinetChange={setSelectedCabinetId}
                  className="w-full"
                />
                {!selectedCabinetId && (
                  <p className="text-sm text-red-500 mt-1">
                    Veuillez sélectionner un cabinet
                  </p>
                )}
              </div>

              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">Informations générales</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="habits">Habitudes de vie</TabsTrigger>
                  <TabsTrigger value="history">Antécédents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <GeneralTab 
                    form={form}
                    childrenAgesInput={childrenAgesInput}
                    setChildrenAgesInput={setChildrenAgesInput}
                    currentCabinetId={currentCabinetId}
                    setCurrentCabinetId={setCurrentCabinetId}
                  />
                  
                  {/* Ajout des champs poids, taille et IMC avec calcul automatique */}
                  <WeightHeightBmiFields form={form} />
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="Téléphone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="habits" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="physicalActivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activité physique</FormLabel>
                        <FormControl>
                          <Input placeholder="Activité physique" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contraception"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraception</FormLabel>
                        <FormControl>
                          <TranslatedSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            enumType="Contraception"
                            placeholder="Sélectionner..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="surgicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Antécédents chirurgicaux</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Antécédents chirurgicaux"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Input placeholder="Allergies" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/patients")}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !selectedCabinetId}
                >
                  {isSubmitting ? "Enregistrement..." : patient ? "Mettre à jour" : "Créer le patient"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
