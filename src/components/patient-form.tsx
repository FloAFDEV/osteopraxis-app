import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";
import { Layout } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  Heart,
  Baby,
  Stethoscope,
  FileText,
  ArrowLeft,
  Save,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";
import { FancyLoader } from "@/components/ui/fancy-loader";

const patientSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phone: z.string().min(10, {
    message: "Le numéro de téléphone doit contenir au moins 10 chiffres.",
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  gender: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  bloodType: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  familyHistory: z.string().optional(),
  notes: z.string().optional(),
  occupation: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
  siblings: z.string().optional(),
  childhoodDiseases: z.string().optional(),
  vaccinations: z.string().optional(),
  delivery: z.string().optional(),
  feeding: z.string().optional(),
  motorSkills: z.string().optional(),
  languageSkills: z.string().optional(),
  socialSkills: z.string().optional(),
  cognitiveSkills: z.string().optional(),
  otherNotes: z.string().optional(),
  reasonForConsultation: z.string().optional(),
  examinationResults: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  recommendations: z.string().optional(),
  followUp: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: any;
  isEditing?: boolean;
}

export default function PatientForm({ patient, isEditing = false }: PatientFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      address: patient?.address || "",
      city: patient?.city || "",
      postalCode: patient?.postalCode || "",
      country: patient?.country || "",
      birthDate: patient?.birthDate || "",
      birthPlace: patient?.birthPlace || "",
      gender: patient?.gender || "",
      height: patient?.height || "",
      weight: patient?.weight || "",
      bloodType: patient?.bloodType || "",
      medicalHistory: patient?.medicalHistory || "",
      allergies: patient?.allergies || "",
      medications: patient?.medications || "",
      familyHistory: patient?.familyHistory || "",
      notes: patient?.notes || "",
      occupation: patient?.occupation || "",
      emergencyContactName: patient?.emergencyContactName || "",
      emergencyContactPhone: patient?.emergencyContactPhone || "",
      emergencyContactRelationship: patient?.emergencyContactRelationship || "",
      motherName: patient?.motherName || "",
      fatherName: patient?.fatherName || "",
      siblings: patient?.siblings || "",
      childhoodDiseases: patient?.childhoodDiseases || "",
      vaccinations: patient?.vaccinations || "",
      delivery: patient?.delivery || "",
      feeding: patient?.feeding || "",
      motorSkills: patient?.motorSkills || "",
      languageSkills: patient?.languageSkills || "",
      socialSkills: patient?.socialSkills || "",
      cognitiveSkills: patient?.cognitiveSkills || "",
      otherNotes: patient?.otherNotes || "",
      reasonForConsultation: patient?.reasonForConsultation || "",
      examinationResults: patient?.examinationResults || "",
      diagnosis: patient?.diagnosis || "",
      treatmentPlan: patient?.treatmentPlan || "",
      recommendations: patient?.recommendations || "",
      followUp: patient?.followUp || "",
      additionalNotes: patient?.additionalNotes || "",
    },
  });

  useEffect(() => {
    if (patient) {
      form.reset(patient);
    }
  }, [patient, form]);

  const { handleSubmit } = form;

  async function onSubmit(values: PatientFormValues) {
    setLoading(true);
    try {
      if (isEditing) {
        if (!id) {
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le patient.",
          });
          return;
        }
        await api.updatePatient(id, values);
        toast({
          title: "Succès",
          description: "Patient mis à jour avec succès.",
        });
      } else {
        await api.createPatient(values);
        toast({
          title: "Succès",
          description: "Patient créé avec succès.",
        });
        navigate("/patients");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <FancyLoader message="Sauvegarde en cours..." />;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? "Modifier le patient" : "Nouveau patient"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Modifiez les informations du patient."
                : "Ajoutez un nouveau patient à votre liste."}
            </p>
          </div>
          <BackButton to="/patients" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 h-auto">
                  <TabsTrigger 
                    value="general" 
                    className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    <User className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Général</span>
                    <span className="sm:hidden">Info</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="contact" 
                    className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                  >
                    <Phone className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Contact</span>
                    <span className="sm:hidden">Tel</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="medical" 
                    className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                  >
                    <Heart className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Médical</span>
                    <span className="sm:hidden">Med</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pediatric" 
                    className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                  >
                    <Baby className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Pédiatrie</span>
                    <span className="sm:hidden">Péd</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="examinations" 
                    className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                  >
                    <Stethoscope className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Examens</span>
                    <span className="sm:hidden">Exam</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="additional" 
                    className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
                  >
                    <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Autre</span>
                    <span className="sm:hidden">+</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Prénom"
                        {...form.register("firstName")}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Nom"
                        {...form.register("lastName")}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthDate">Date de naissance</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        {...form.register("birthDate")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthPlace">Lieu de naissance</Label>
                      <Input
                        id="birthPlace"
                        type="text"
                        placeholder="Lieu de naissance"
                        {...form.register("birthPlace")}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Genre</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un genre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Homme</SelectItem>
                          <SelectItem value="female">Femme</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Téléphone"
                        {...form.register("phone")}
                      />
                      {form.formState.errors.phone && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Adresse"
                      {...form.register("address")}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Ville"
                        {...form.register("city")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        type="text"
                        placeholder="Code postal"
                        {...form.register("postalCode")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        type="text"
                        placeholder="Pays"
                        {...form.register("country")}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Taille (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="Taille (cm)"
                        {...form.register("height")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Poids (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="Poids (kg)"
                        {...form.register("weight")}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bloodType">Groupe sanguin</Label>
                    <Input
                      id="bloodType"
                      type="text"
                      placeholder="Groupe sanguin"
                      {...form.register("bloodType")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicalHistory">Antécédents médicaux</Label>
                    <Textarea
                      id="medicalHistory"
                      placeholder="Antécédents médicaux"
                      {...form.register("medicalHistory")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      placeholder="Allergies"
                      {...form.register("allergies")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medications">Médicaments</Label>
                    <Textarea
                      id="medications"
                      placeholder="Médicaments"
                      {...form.register("medications")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="familyHistory">Antécédents familiaux</Label>
                    <Textarea
                      id="familyHistory"
                      placeholder="Antécédents familiaux"
                      {...form.register("familyHistory")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Notes"
                      {...form.register("notes")}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="pediatric" className="space-y-4">
                  <div>
                    <Label htmlFor="motherName">Nom de la mère</Label>
                    <Input
                      id="motherName"
                      type="text"
                      placeholder="Nom de la mère"
                      {...form.register("motherName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherName">Nom du père</Label>
                    <Input
                      id="fatherName"
                      type="text"
                      placeholder="Nom du père"
                      {...form.register("fatherName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siblings">Frères et sœurs</Label>
                    <Input
                      id="siblings"
                      type="text"
                      placeholder="Frères et sœurs"
                      {...form.register("siblings")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="childhoodDiseases">Maladies infantiles</Label>
                    <Textarea
                      id="childhoodDiseases"
                      placeholder="Maladies infantiles"
                      {...form.register("childhoodDiseases")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vaccinations">Vaccinations</Label>
                    <Textarea
                      id="vaccinations"
                      placeholder="Vaccinations"
                      {...form.register("vaccinations")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery">Accouchement</Label>
                    <Textarea
                      id="delivery"
                      placeholder="Accouchement"
                      {...form.register("delivery")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="feeding">Alimentation</Label>
                    <Textarea
                      id="feeding"
                      placeholder="Alimentation"
                      {...form.register("feeding")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="motorSkills">Motricité</Label>
                    <Textarea
                      id="motorSkills"
                      placeholder="Motricité"
                      {...form.register("motorSkills")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="languageSkills">Langage</Label>
                    <Textarea
                      id="languageSkills"
                      placeholder="Langage"
                      {...form.register("languageSkills")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="socialSkills">Sociabilité</Label>
                    <Textarea
                      id="socialSkills"
                      placeholder="Sociabilité"
                      {...form.register("socialSkills")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cognitiveSkills">Cognition</Label>
                    <Textarea
                      id="cognitiveSkills"
                      placeholder="Cognition"
                      {...form.register("cognitiveSkills")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherNotes">Autres notes</Label>
                    <Textarea
                      id="otherNotes"
                      placeholder="Autres notes"
                      {...form.register("otherNotes")}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="examinations" className="space-y-4">
                  <div>
                    <Label htmlFor="reasonForConsultation">Motif de consultation</Label>
                    <Textarea
                      id="reasonForConsultation"
                      placeholder="Motif de consultation"
                      {...form.register("reasonForConsultation")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="examinationResults">Résultats de l'examen</Label>
                    <Textarea
                      id="examinationResults"
                      placeholder="Résultats de l'examen"
                      {...form.register("examinationResults")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diagnosis">Diagnostique</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Diagnostique"
                      {...form.register("diagnosis")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="treatmentPlan">Plan de traitement</Label>
                    <Textarea
                      id="treatmentPlan"
                      placeholder="Plan de traitement"
                      {...form.register("treatmentPlan")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recommendations">Recommandations</Label>
                    <Textarea
                      id="recommendations"
                      placeholder="Recommandations"
                      {...form.register("recommendations")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="followUp">Suivi</Label>
                    <Textarea
                      id="followUp"
                      placeholder="Suivi"
                      {...form.register("followUp")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="additionalNotes">Notes supplémentaires</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Notes supplémentaires"
                      {...form.register("additionalNotes")}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="space-y-4">
                  <div>
                    <Label htmlFor="occupation">Profession</Label>
                    <Input
                      id="occupation"
                      type="text"
                      placeholder="Profession"
                      {...form.register("occupation")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactName">Nom du contact d'urgence</Label>
                    <Input
                      id="emergencyContactName"
                      type="text"
                      placeholder="Nom du contact d'urgence"
                      {...form.register("emergencyContactName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Téléphone du contact d'urgence</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      placeholder="Téléphone du contact d'urgence"
                      {...form.register("emergencyContactPhone")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship">
                      Relation avec le contact d'urgence
                    </Label>
                    <Input
                      id="emergencyContactRelationship"
                      type="text"
                      placeholder="Relation avec le contact d'urgence"
                      {...form.register("emergencyContactRelationship")}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/patients")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Mettre à jour" : "Enregistrer"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
