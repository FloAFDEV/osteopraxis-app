import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const patientFormSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis" }),
  lastName: z.string().min(1, { message: "Le nom est requis" }),
  email: z.string().email({ message: "Email invalide" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  gender: z.enum(["Homme", "Femme", "Autre", "Non spécifié"]).optional(),
  height: z.string().optional().or(z.literal("")),
  weight: z.string().optional().or(z.literal("")),
  job: z.string().optional().or(z.literal("")),
  maritalStatus: z.string().optional().or(z.literal("")),
  hasChildren: z.boolean().optional(),
  childrenAges: z.string().optional().or(z.literal("")),
  physicalActivity: z.string().optional().or(z.literal("")),
  medicalHistory: z.string().optional().or(z.literal("")),
  currentMedication: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  patient?: any;
  onSuccess?: () => void;
}

export default function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
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
      gender: patient?.gender || "Non spécifié",
      height: patient?.height ? String(patient.height) : "",
      weight: patient?.weight ? String(patient.weight) : "",
      job: patient?.job || "",
      maritalStatus: patient?.maritalStatus || "",
      hasChildren: patient?.hasChildren || false,
      childrenAges: patient?.childrenAges || "",
      physicalActivity: patient?.physicalActivity || "",
      medicalHistory: patient?.medicalHistory || "",
      currentMedication: patient?.currentMedication || "",
      allergies: patient?.allergies || "",
      notes: patient?.notes || "",
    },
  });

  const onSubmit = async (data: PatientFormValues) => {
    try {
      setIsSubmitting(true);

      const patientData = {
        // Required fields with defaults
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        osteopathId: user?.osteopathId || 1,
        cabinetId: 1,
        userId: user?.id || null,
        bmi: null,
        isDeceased: false,
        isSmoker: false,
        hasVisionCorrection: false,
        smoker: false,
        
        // Optional fields
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        birthDate: data.birthDate || null,
        gender: data.gender || null,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        job: data.job || null,
        maritalStatus: data.maritalStatus || null,
        hasChildren: data.hasChildren || null,
        childrenAges: data.childrenAges || null,
        physicalActivity: data.physicalActivity || null,
        medicalHistory: data.medicalHistory || null,
        currentMedication: data.currentMedication || null,
        allergies: data.allergies || null,
        notes: data.notes || null,
        
        // All other medical fields as null by default
        contraception: null,
        handedness: null,
        smokerSince: null,
        isExSmoker: null,
        weight_at_birth: null,
        height_at_birth: null,
        head_circumference: null,
        fracture_history: null,
        dental_health: null,
        sport_frequency: null,
        gynecological_history: null,
        fine_motor_skills: null,
        gross_motor_skills: null,
        apgar_score: null,
        childcare_type: null,
        school_grade: null,
        pediatrician_name: null,
        paramedical_followup: null,
        other_comments_adult: null,
        other_comments_child: null,
        familyStatus: null,
        alcoholConsumption: null,
        sportActivity: null,
        otherContraception: null,
        diagnosis: null,
        medical_examination: null,
        treatment_plan: null,
        consultation_conclusion: null,
        cardiac_history: null,
        pulmonary_history: null,
        pelvic_history: null,
        neurological_history: null,
        neurodevelopmental_history: null,
        cranial_nerve_exam: null,
        dental_exam: null,
        cranial_exam: null,
        lmo_tests: null,
        cranial_membrane_exam: null,
        musculoskeletal_history: null,
        lower_limb_exam: null,
        upper_limb_exam: null,
        shoulder_exam: null,
        scoliosis: null,
        facial_mask_exam: null,
        fascia_exam: null,
        vascular_exam: null,
        avatarUrl: null,
        currentTreatment: null,
        digestiveDoctorName: null,
        digestiveProblems: null,
        entDoctorName: null,
        entProblems: null,
        generalPractitioner: null,
        occupation: null,
        ophtalmologistName: null,
        rheumatologicalHistory: null,
        surgicalHistory: null,
        traumaHistory: null,
        hdlm: null,
        smokingAmount: null,
        smokingSince: null,
        quitSmokingDate: null,
        complementaryExams: null,
        generalSymptoms: null,
        pregnancyHistory: null,
        birthDetails: null,
        developmentMilestones: null,
        sleepingPattern: null,
        feeding: null,
        behavior: null,
        childCareContext: null,
        ent_followup: null,
        intestinal_transit: null,
        sleep_quality: null,
      };

      if (patient) {
        await api.updatePatient(patient.id, patientData);
        toast.success("Patient mis à jour avec succès");
      } else {
        await api.createPatient(patientData);
        toast.success("Patient créé avec succès");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du patient:", error);
      toast.error("Erreur lors de la sauvegarde du patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom</FormLabel>
              <FormControl>
                <Input placeholder="Prénom" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} disabled={isSubmitting} />
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
                <Input placeholder="Téléphone" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Adresse" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville</FormLabel>
              <FormControl>
                <Input placeholder="Ville" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code postal</FormLabel>
              <FormControl>
                <Input placeholder="Code postal" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pays</FormLabel>
              <FormControl>
                <Input placeholder="Pays" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de naissance</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homme">Homme</SelectItem>
                  <SelectItem value="Femme">Femme</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                  <SelectItem value="Non spécifié">Non spécifié</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taille (cm)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Taille en cm" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poids (kg)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Poids en kg" {...field} disabled={isSubmitting} />
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
              <FormLabel>Profession</FormLabel>
              <FormControl>
                <Input placeholder="Profession" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situation familiale</FormLabel>
              <FormControl>
                <Input placeholder="Situation familiale" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasChildren"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enfants</FormLabel>
              <Select onValueChange={(val) => field.onChange(val === "true")} value={String(field.value)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Avez-vous des enfants ?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Oui</SelectItem>
                  <SelectItem value="false">Non</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="childrenAges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Âges des enfants</FormLabel>
              <FormControl>
                <Input placeholder="Âges des enfants (ex: 3, 5, 8)" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="physicalActivity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activité physique</FormLabel>
              <FormControl>
                <Textarea placeholder="Décrivez l'activité physique" {...field} disabled={isSubmitting} />
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
                <Textarea placeholder="Antécédents médicaux" {...field} disabled={isSubmitting} />
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
                <Textarea placeholder="Médicaments actuels" {...field} disabled={isSubmitting} />
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
                <Textarea placeholder="Allergies" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Notes supplémentaires" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : patient ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
