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
import { WeightHeightBmiFields } from "./patient-form/WeightHeightBmiFields";
import { ContactTab } from "./patient-form/ContactTab";
import { ExaminationsTab } from "./patient-form/ExaminationsTab";
import { Checkbox } from "@/components/ui/checkbox";

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
  city: z.string().optional().or(z.literal('')).nullable(),
  postalCode: z.string().optional().or(z.literal('')).nullable(),
  country: z.string().optional().or(z.literal('')).nullable(),
  maritalStatus: z.string().optional().or(z.literal('')).nullable(),
  occupation: z.string().optional().or(z.literal('')).nullable(),
  job: z.string().optional().or(z.literal('')).nullable(),
  height: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  bmi: z.number().optional().nullable(),
  handedness: z.string().optional().or(z.literal('')).nullable(),
  hasChildren: z.string().optional().or(z.literal('')).nullable(),
  isSmoker: z.boolean().optional(),
  smoker: z.boolean().optional(),
  smokerSince: z.number().optional().nullable(),
  isExSmoker: z.boolean().optional(),
  physicalActivity: z.string().optional().or(z.literal('')).nullable(),
  sportActivity: z.string().optional().or(z.literal('')).nullable(),
  alcoholConsumption: z.string().optional().or(z.literal('')).nullable(),
  surgicalHistory: z.string().optional().or(z.literal('')).nullable(),
  medicalHistory: z.string().optional().or(z.literal('')).nullable(),
  allergies: z.string().optional().or(z.literal('')).nullable(),
  contraception: z.string().optional().or(z.literal('')).nullable(),
  otherContraception: z.string().optional().or(z.literal('')).nullable(),
  currentMedication: z.string().optional().or(z.literal('')).nullable(),
  notes: z.string().optional().or(z.literal('')).nullable(),
  cabinetId: z.number().optional(),
  childrenAges: z.array(z.number()).optional().nullable(),
  
  // Additional optional fields from PatientFormValues
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
  
  // Champs techniques
  hdlm: z.string().optional().nullable(),
  isDeceased: z.boolean().optional(),
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

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      birthDate: patient?.birthDate || "",
      gender: convertGender(patient?.gender as string),
      address: patient?.address || "",
      city: patient?.city || "",
      postalCode: patient?.postalCode || "",
      country: patient?.country || "",
      maritalStatus: patient?.maritalStatus || "",
      occupation: patient?.occupation || "",
      job: patient?.job || "",
      height: patient?.height || undefined,
      weight: patient?.weight || undefined,
      bmi: patient?.bmi || undefined,
      handedness: patient?.handedness || "",
      hasChildren: patient?.hasChildren || "",
      isSmoker: patient?.isSmoker || false,
      smoker: patient?.smoker || false,
      smokerSince: patient?.smokerSince || undefined,
      isExSmoker: patient?.isExSmoker || false,
      physicalActivity: patient?.physicalActivity || "",
      sportActivity: patient?.sportActivity || "",
      alcoholConsumption: patient?.alcoholConsumption || "",
      surgicalHistory: patient?.surgicalHistory || "",
      medicalHistory: patient?.medicalHistory || "",
      allergies: patient?.allergies || "",
      contraception: patient?.contraception || "",
      otherContraception: patient?.otherContraception || "",
      currentMedication: patient?.currentMedication || "",
      notes: patient?.notes || "",
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
      
      // Champs techniques
      hdlm: patient?.hdlm || "",
      isDeceased: patient?.isDeceased || false,
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
                  <TabsTrigger value="contact">Contact & Adresse</TabsTrigger>
                  <TabsTrigger value="lifestyle">Mode de vie</TabsTrigger>
                  <TabsTrigger value="medical">Médical</TabsTrigger>
                  <TabsTrigger value="pediatric">Pédiatrie</TabsTrigger>
                  <TabsTrigger value="examinations">Examens</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <WeightHeightBmiFields form={form} />
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <ContactTab form={form} emailRequired={false} />
                </TabsContent>

                <TabsContent value="lifestyle" className="space-y-4">
                  <Card>
                    <CardContent className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="occupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profession</FormLabel>
                              <FormControl>
                                <Input placeholder="Profession" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="job"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emploi</FormLabel>
                              <FormControl>
                                <Input placeholder="Emploi actuel" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                        name="sportActivity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activité sportive</FormLabel>
                            <FormControl>
                              <Input placeholder="Activité sportive" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="alcoholConsumption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Consommation d'alcool</FormLabel>
                            <FormControl>
                              <Input placeholder="Consommation d'alcool" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Tabagisme</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="isSmoker"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Fumeur actuel</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isExSmoker"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Ex-fumeur</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="smokerSince"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fumeur depuis (années)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Nombre d'années"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      field.onChange(e.target.value === "" ? null : Number(e.target.value));
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="smokingSince"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fumeur depuis</FormLabel>
                                <FormControl>
                                  <Input placeholder="Depuis quand" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="smokingAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantité fumée</FormLabel>
                                <FormControl>
                                  <Input placeholder="Quantité par jour" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="quitSmokingDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date d'arrêt du tabac</FormLabel>
                              <FormControl>
                                <Input placeholder="Date d'arrêt" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <Card>
                    <CardContent className="space-y-4 mt-6">
                      <WeightHeightBmiFields form={form} />

                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allergies</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Allergies connues" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicalHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antécédents médicaux</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Antécédents médicaux" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="surgicalHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antécédents chirurgicaux</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Antécédents chirurgicaux" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="traumaHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antécédents traumatiques</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Antécédents traumatiques" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rheumatologicalHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antécédents rhumatologiques</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Antécédents rhumatologiques" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fracture_history"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antécédents de fractures</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Antécédents de fractures" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currentTreatment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Traitement actuel</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Traitement en cours" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currentMedication"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Médicaments actuels</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Médicaments en cours" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Praticiens</h3>
                        <FormField
                          control={form.control}
                          name="generalPractitioner"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Médecin traitant</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom du médecin traitant" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="hasVisionCorrection"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Correction de la vision</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="ophtalmologistName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ophtalmologue</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nom de l'ophtalmologue" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="entProblems"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Problèmes ORL</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Problèmes ORL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="entDoctorName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Médecin ORL</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nom du médecin ORL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="ent_followup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Suivi ORL</FormLabel>
                              <FormControl>
                                <Input placeholder="Suivi ORL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="digestiveProblems"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Problèmes digestifs</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Problèmes digestifs" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="digestiveDoctorName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gastro-entérologue</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nom du gastro-entérologue" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="gynecological_history"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Antécédents gynécologiques</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Antécédents gynécologiques" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="other_comments_adult"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autres commentaires</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Autres commentaires médicaux" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Divers</h3>
                        <FormField
                          control={form.control}
                          name="hdlm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HDLM</FormLabel>
                              <FormControl>
                                <Input placeholder="HDLM" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isDeceased"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Décédé(e)</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pediatric" className="space-y-4">
                  <Card>
                    <CardContent className="space-y-4 mt-6">
                      <h3 className="text-lg font-medium">Informations à la naissance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="weight_at_birth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Poids à la naissance (kg)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Ex: 3.2"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e.target.value === "" ? null : Number(e.target.value));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="height_at_birth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Taille à la naissance (cm)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ex: 50"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e.target.value === "" ? null : Number(e.target.value));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="head_circumference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Périmètre crânien (cm)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Ex: 35"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e.target.value === "" ? null : Number(e.target.value));
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="apgar_score"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Score d'Apgar</FormLabel>
                            <FormControl>
                              <Input placeholder="Score d'Apgar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="birthDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Détails de la naissance</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Détails de la naissance" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <h3 className="text-lg font-medium">Développement</h3>
                      <FormField
                        control={form.control}
                        name="developmentMilestones"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Étapes de développement</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Étapes de développement" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fine_motor_skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Motricité fine</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Développement de la motricité fine" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gross_motor_skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Motricité globale</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Développement de la motricité globale" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <h3 className="text-lg font-medium">Vie quotidienne</h3>
                      <FormField
                        control={form.control}
                        name="sleepingPattern"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rythme de sommeil</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Rythme de sommeil" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="feeding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alimentation</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Habitudes alimentaires" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="behavior"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comportement</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Comportement de l'enfant" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <h3 className="text-lg font-medium">Environnement</h3>
                      <FormField
                        control={form.control}
                        name="childCareContext"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contexte de garde</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Contexte de garde de l'enfant" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="childcare_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type de garde</FormLabel>
                            <FormControl>
                              <Input placeholder="Type de garde" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="school_grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Niveau scolaire</FormLabel>
                            <FormControl>
                              <Input placeholder="Niveau scolaire" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <h3 className="text-lg font-medium">Suivi médical pédiatrique</h3>
                      <FormField
                        control={form.control}
                        name="pediatrician_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du pédiatre</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom du pédiatre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paramedical_followup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suivi paramédical</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Suivi paramédical (kinésithérapie, orthophonie...)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pregnancyHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Antécédents de grossesse</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Antécédents de grossesse de la mère" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="other_comments_child"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autres commentaires pédiatriques</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Autres commentaires concernant l'enfant" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="examinations" className="space-y-4">
                  <ExaminationsTab form={form} />
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <Card>
                    <CardContent className="space-y-4 mt-6">
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes générales</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Notes générales sur le patient"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="familyStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Situation familiale</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Situation familiale" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
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
