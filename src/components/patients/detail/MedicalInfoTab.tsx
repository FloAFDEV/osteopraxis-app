import React, { useState, useEffect } from "react";
import { AppointmentForm } from "@/components/appointment-form";
import { PatientForm } from "@/components/patient-form";
import { PatientFormValues } from "@/components/patient-form/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment, AppointmentStatus, Patient } from "@/types";
import { differenceInYears, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Activity,
  Baby,
  Calendar,
  Dumbbell,
  Ear,
  Edit,
  Eye,
  FilePlus2,
  Heart,
  Home,
  Plus,
  Soup,
  Stethoscope,
  StickyNote,
  X,
  ClipboardList,
  Syringe,
  CheckCircle2,
  User,
} from "lucide-react";
import { ShieldAlert } from "lucide-react";

import { AppointmentStatusBadge } from "./AppointmentStatusBadge";
import { MedicalAccordion } from "./MedicalAccordion";
import { translateHandedness } from "@/utils/patient-form-helpers";
import { ClinicalSections } from "./ClinicalSections";
import { GroupedMedicalSections } from "./GroupedMedicalSections";

interface MedicalInfoTabProps {
  patient: Patient;
  pastAppointments: Appointment[];
  onUpdateAppointmentStatus: (
    appointmentId: number,
    status: AppointmentStatus
  ) => Promise<void>;
  onNavigateToHistory: () => void;
  onAppointmentCreated?: () => void;
  onPatientUpdated?: (updatedData: PatientFormValues) => void;
  selectedCabinetId?: number | null;
}

export function MedicalInfoTab({
  patient,
  pastAppointments,
  onAppointmentCreated,
  onPatientUpdated,
  selectedCabinetId,
}: MedicalInfoTabProps) {
  const [isChild, setIsChild] = useState<boolean>(false);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [showEditPatientForm, setShowEditPatientForm] = useState(false);

  const lastAppointment =
    pastAppointments && pastAppointments.length > 0
      ? pastAppointments[0]
      : null;

  useEffect(() => {
    if (patient.birthDate) {
      const age = differenceInYears(
        new Date(),
        new Date(patient.birthDate)
      );
      setIsChild(age < 17);
    }
  }, [patient.birthDate]);

  const formatValue = (value: any) =>
    value || value === 0 ? String(value) : "Non renseigné";

  // Helper: détecte la présence de mots-clés de problème cardiaque
  const isCardiacProblem = (label: string, value: string | null | undefined) => {
    if (!value) return false;
    const llabel = label.toLowerCase();
    const lower = String(value).toLowerCase();
    return (
      llabel.includes("cardiaque") ||
      lower.includes("cardiaque") ||
      lower.includes("coeur") ||
      lower.includes("cœur") ||
      lower.includes("cardio")
    );
  };

  // Helper: détecte les labels à marquer "Important"
  const importantFieldsList = [
    "Antécédents médicaux familiaux",
    "Antécédents pulmonaires",
    "Antécédents de traumatismes",
    "Traumatismes",
    "Fractures",
    "Chirurgies"
  ];

  const isFieldImportant = (label: string, value: string | null | undefined) => {
    if (!label || !value) return false;
    // Vérifie si le champ fait partie de la liste des importants et qu'il est renseigné et NON cardiaque
    if (
      importantFieldsList.includes(label) &&
      !isFieldCritical(label, value)
    ) {
      // Non vide, non générique
      const notFilled = ["non", "aucun", "non renseigné", "null", "-", ""];
      if (!notFilled.includes(String(value).trim().toLowerCase())) {
        return true;
      }
    }
    return false;
  };

  // Helper : cardiaque = rouge, pas de badge
  const isFieldCritical = (label: string, value: string | null | undefined) => {
    return isCardiacProblem(label, value);
  };

  // Sphère ORL + ophtalmo + dentaire (fusionnée)
  const orlOphDentalItems = [
    { label: "Correction de la vue", value: patient.hasVisionCorrection ? "Oui" : "Non", isImportant: isFieldImportant("Correction de la vue", patient.hasVisionCorrection ? "Oui" : "Non"), isCritical: isFieldCritical("Correction de la vue", patient.hasVisionCorrection ? "Oui" : "Non") },
    { label: "Ophtalmologue", value: formatValue(patient.ophtalmologistName), isImportant: isFieldImportant("Ophtalmologue", patient.ophtalmologistName), isCritical: isFieldCritical("Ophtalmologue", patient.ophtalmologistName) },
    { label: "Santé dentaire", value: formatValue(patient.dental_health), isImportant: isFieldImportant("Santé dentaire", patient.dental_health), isCritical: isFieldCritical("Santé dentaire", patient.dental_health) },
    { label: "Examen dentaire", value: formatValue(patient.dental_exam), isImportant: isFieldImportant("Examen dentaire", patient.dental_exam), isCritical: isFieldCritical("Examen dentaire", patient.dental_exam) },
    { label: "Médecin ORL", value: formatValue(patient.entDoctorName), isImportant: isFieldImportant("Médecin ORL", patient.entDoctorName), isCritical: isFieldCritical("Médecin ORL", patient.entDoctorName) },
    { label: "Problèmes ORL", value: formatValue(patient.entProblems), isImportant: isFieldImportant("Problèmes ORL", patient.entProblems), isCritical: isFieldCritical("Problèmes ORL", patient.entProblems) },
    { label: "Suivi ORL", value: formatValue(patient.ent_followup), isImportant: isFieldImportant("Suivi ORL", patient.ent_followup), isCritical: isFieldCritical("Suivi ORL", patient.ent_followup) },
  ];

  // Section sphère périphériques avec sous-sections
  const periphericSection = [
    {
      title: "Membres supérieurs",
      items: [
        { label: "Examen membre supérieur", value: formatValue(patient.upper_limb_exam), isImportant: isFieldImportant("Examen membre supérieur", patient.upper_limb_exam), isCritical: isFieldCritical("Examen membre supérieur", patient.upper_limb_exam) },
        { label: "Examen épaule", value: formatValue(patient.shoulder_exam), isImportant: isFieldImportant("Examen épaule", patient.shoulder_exam), isCritical: isFieldCritical("Examen épaule", patient.shoulder_exam) },
        { label: "Motricité fine", value: formatValue(patient.fine_motor_skills), isImportant: isFieldImportant("Motricité fine", patient.fine_motor_skills), isCritical: isFieldCritical("Motricité fine", patient.fine_motor_skills) },
      ],
    },
    {
      title: "Membres inférieurs",
      items: [
        { label: "Examen membre inférieur", value: formatValue(patient.lower_limb_exam), isImportant: isFieldImportant("Examen membre inférieur", patient.lower_limb_exam), isCritical: isFieldCritical("Examen membre inférieur", patient.lower_limb_exam) },
        { label: "Motricité globale", value: formatValue(patient.gross_motor_skills), isImportant: isFieldImportant("Motricité globale", patient.gross_motor_skills), isCritical: isFieldCritical("Motricité globale", patient.gross_motor_skills) },
        { label: "Tests LMO", value: formatValue(patient.lmo_tests), isImportant: isFieldImportant("Tests LMO", patient.lmo_tests), isCritical: isFieldCritical("Tests LMO", patient.lmo_tests) },
      ],
    },
  ];

  // Tableau des sphères à afficher
  const spheres = [
    {
      title: "Générale",
      icon: Stethoscope,
      category: "general" as const,
      defaultOpen: true,
      items: [
        { label: "Antécédents médicaux familiaux", value: formatValue(patient.familyStatus), isImportant: isFieldImportant("Antécédents médicaux familiaux", formatValue(patient.familyStatus)), isCritical: isFieldCritical("Antécédents médicaux familiaux", formatValue(patient.familyStatus)) },
        { label: "Antécédents cardiaques", value: formatValue(patient.cardiac_history), isImportant: isFieldImportant("Antécédents cardiaques", formatValue(patient.cardiac_history)), isCritical: isFieldCritical("Antécédents cardiaques", formatValue(patient.cardiac_history)) },
        { label: "Antécédents pulmonaires", value: formatValue(patient.pulmonary_history), isImportant: isFieldImportant("Antécédents pulmonaires", formatValue(patient.pulmonary_history)), isCritical: isFieldCritical("Antécédents pulmonaires", formatValue(patient.pulmonary_history)) },
        // Rhumatologie ne fait pas partie des importants ni cardiaque
        { label: "Rhumatologie", value: formatValue(patient.rheumatologicalHistory), isImportant: false, isCritical: false },
        { label: "Scoliose", value: formatValue(patient.scoliosis), isImportant: false, isCritical: false },
        { label: "Traumatismes", value: formatValue(patient.traumaHistory), isImportant: isFieldImportant("Traumatismes", formatValue(patient.traumaHistory)), isCritical: isFieldCritical("Traumatismes", formatValue(patient.traumaHistory)) },
        { label: "Fractures", value: formatValue(patient.fracture_history), isImportant: isFieldImportant("Fractures", formatValue(patient.fracture_history)), isCritical: isFieldCritical("Fractures", formatValue(patient.fracture_history)) },
        { label: "Chirurgies", value: formatValue(patient.surgicalHistory), isImportant: isFieldImportant("Chirurgies", formatValue(patient.surgicalHistory)), isCritical: isFieldCritical("Chirurgies", formatValue(patient.surgicalHistory)) },
        { label: "Médecin généraliste", value: formatValue(patient.generalPractitioner), isImportant: false, isCritical: false },
        { label: "Traitement actuel", value: formatValue(patient.currentTreatment), isImportant: false, isCritical: false },
        { label: "Allergies", value: formatValue(patient.allergies && patient.allergies !== "NULL" ? patient.allergies : null), isImportant: false, isCritical: false },
        { label: "Examens complémentaires", value: formatValue(patient.complementaryExams), isImportant: false, isCritical: false },
        { label: "Résumé / Conclusion consultation", value: formatValue(patient.consultation_conclusion), isImportant: false, isCritical: false },
        { label: "Diagnostic", value: formatValue(patient.diagnosis), isImportant: false, isCritical: false },
        { label: "Plan de traitement", value: formatValue(patient.treatment_plan), isImportant: false, isCritical: false },
        { label: "Examen médical", value: formatValue(patient.medical_examination), isImportant: false, isCritical: false },
        { label: "Autres commentaires (adulte)", value: formatValue(patient.other_comments_adult), isImportant: false, isCritical: false },
      ],
    },
    {
      title: "Activité & Hygiène de vie",
      icon: Dumbbell,
      category: "lifestyle" as const,
      items: [
        { label: "Activité physique", value: formatValue(patient.physicalActivity), isImportant: false, isCritical: false },
        { label: "Fréquence sportive", value: formatValue(patient.sport_frequency), isImportant: false, isCritical: false },
        { label: "Qualité du sommeil", value: formatValue(patient.sleep_quality), isImportant: false, isCritical: false },
        { label: "Alimentation", value: formatValue(patient.feeding), isImportant: false, isCritical: false },
        { label: "Poids", value: formatValue(patient.weight), isImportant: false, isCritical: false },
        { label: "Taille", value: formatValue(patient.height), isImportant: false, isCritical: false },
      ],
    },
    {
      title: "Sphère ORL / Ophtalmo / Dentaire",
      icon: Eye,
      category: "sensory" as const,
      items: orlOphDentalItems
    },
    {
      title: "Sphère viscérale / digestive",
      icon: Soup,
      category: "digestive" as const,
      items: [
        { label: "Médecin digestif", value: formatValue(patient.digestiveDoctorName), isImportant: false, isCritical: isFieldCritical("Médecin digestif", patient.digestiveDoctorName) },
        { label: "Problèmes digestifs", value: formatValue(patient.digestiveProblems), isImportant: false, isCritical: isFieldCritical("Problèmes digestifs", patient.digestiveProblems) },
        { label: "Transit intestinal", value: formatValue(patient.intestinal_transit), isImportant: false, isCritical: isFieldCritical("Transit intestinal", patient.intestinal_transit) },
      ],
    },
    {
      title: "Sphère neuro",
      icon: User,
      category: "general" as const,
      items: [
        { label: "Antécédents neurologiques", value: formatValue(patient.neurological_history), isImportant: false, isCritical: isFieldCritical("Antécédents neurologiques", patient.neurological_history) },
        { label: "Historique neurodéveloppemental", value: formatValue(patient.neurodevelopmental_history), isImportant: false, isCritical: isFieldCritical("Historique neurodéveloppemental", patient.neurodevelopmental_history) },
        { label: "Examen des nerfs crâniens", value: formatValue(patient.cranial_nerve_exam), isImportant: false, isCritical: isFieldCritical("Examen des nerfs crâniens", patient.cranial_nerve_exam) },
        { label: "Examen crânien", value: formatValue(patient.cranial_exam), isImportant: false, isCritical: isFieldCritical("Examen crânien", patient.cranial_exam) },
        { label: "Examen membranes crâniennes", value: formatValue(patient.cranial_membrane_exam), isImportant: false, isCritical: isFieldCritical("Examen membranes crâniennes", patient.cranial_membrane_exam) },
        { label: "Examen des fascias", value: formatValue(patient.fascia_exam), isImportant: false, isCritical: isFieldCritical("Examen des fascias", patient.fascia_exam) },
        { label: "Examen vasculaire", value: formatValue(patient.vascular_exam), isImportant: false, isCritical: isFieldCritical("Examen vasculaire", patient.vascular_exam) },
        { label: "Symptômes généraux", value: formatValue(patient.generalSymptoms), isImportant: false, isCritical: isFieldCritical("Symptômes généraux", patient.generalSymptoms) },
      ],
    },
    {
      title: "Sphère périphérique",
      icon: Activity,
      category: "general" as const,
      items: [
        { label: "Sous-section : Membres supérieurs", value: "" },
        ...periphericSection[0].items.map((i) => ({
          ...i, isImportant: false, isCritical: isFieldCritical(i.label, i.value)
        })),
        { label: "Sous-section : Membres inférieurs", value: "" },
        ...periphericSection[1].items.map((i) => ({
          ...i, isImportant: false, isCritical: isFieldCritical(i.label, i.value)
        })),
      ],
    },
    {
      title: "Sphère pelvienne/gynéco-uro",
      icon: Baby,
      category: "reproductive" as const,
      items: [
        { label: "Antécédents pelviens/gynéco-uro", value: formatValue(patient.pelvic_history), isImportant: false, isCritical: isFieldCritical("Antécédents pelviens/gynéco-uro", patient.pelvic_history) },
        { label: "Antécédents gynécologiques", value: formatValue(patient.gynecological_history), isImportant: false, isCritical: isFieldCritical("Antécédents gynécologiques", patient.gynecological_history) },
      ],
    },
    {
      title: "Enfant : données enfant/pédiatrie",
      icon: Baby,
      category: "pediatric" as const,
      items: [
        { label: "Poids de naissance", value: formatValue(patient.weight_at_birth), isImportant: false, isCritical: isFieldCritical("Poids de naissance", formatValue(patient.weight_at_birth)) },
        { label: "Taille de naissance", value: formatValue(patient.height_at_birth), isImportant: false, isCritical: isFieldCritical("Taille de naissance", formatValue(patient.height_at_birth)) },
        { label: "Périmètre crânien", value: formatValue(patient.head_circumference), isImportant: false, isCritical: isFieldCritical("Périmètre crânien", formatValue(patient.head_circumference)) },
        { label: "Score d'Apgar", value: formatValue(patient.apgar_score), isImportant: false, isCritical: isFieldCritical("Score d'Apgar", formatValue(patient.apgar_score)) },
        { label: "Mode de garde", value: formatValue(patient.childcare_type), isImportant: false, isCritical: isFieldCritical("Mode de garde", formatValue(patient.childcare_type)) },
        { label: "Niveau scolaire", value: formatValue(patient.school_grade), isImportant: false, isCritical: isFieldCritical("Niveau scolaire", formatValue(patient.school_grade)) },
        { label: "Pédiatre", value: formatValue(patient.pediatrician_name), isImportant: false, isCritical: isFieldCritical("Pédiatre", formatValue(patient.pediatrician_name)) },
        { label: "Suivi paramédical", value: formatValue(patient.paramedical_followup), isImportant: false, isCritical: isFieldCritical("Suivi paramédical", formatValue(patient.paramedical_followup)) },
        { label: "Commentaires enfant", value: formatValue(patient.other_comments_child), isImportant: false, isCritical: isFieldCritical("Commentaires enfant", formatValue(patient.other_comments_child)) },
      ],
    },
  ];

  const handleAppointmentSuccess = () => {
    onAppointmentCreated?.();
    setShowNewAppointmentForm(false);
  };

  const handlePatientUpdate = async (updatedData: PatientFormValues) => {
    if (onPatientUpdated) {
      await onPatientUpdated(updatedData);
      setShowEditPatientForm(false);
    }
  };

  // Gestionnaire pour le bouton Modifier
  const handleEditClick = () => {
    if (showNewAppointmentForm) {
      setShowNewAppointmentForm(false);
    }
    setShowEditPatientForm(!showEditPatientForm);
  };

  // Gestionnaire pour le bouton Nouvelle séance
  const handleNewAppointmentClick = () => {
    if (showEditPatientForm) {
      setShowEditPatientForm(false);
    }
    setShowNewAppointmentForm(!showNewAppointmentForm);
  };

  // Préparer les blocs cliniques
  const clinicalSections = [
    {
      field: patient.medical_examination,
      title: "Examen médical",
      icon: <ClipboardList className="h-5 w-5 text-indigo-700" />,
    },
    {
      field: patient.diagnosis,
      title: "Diagnostic",
      icon: <Stethoscope className="h-5 w-5 text-pink-700" />,
    },
    {
      field: patient.treatment_plan,
      title: "Plan de traitement",
      icon: <Syringe className="h-5 w-5 text-green-800" />,
    },
    {
      field: patient.consultation_conclusion,
      title: "Conclusion",
      icon: <CheckCircle2 className="h-5 w-5 text-blue-700" />,
    },
  ];

  return (
    <div className="space-y-6 mt-6 p-6 bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Boutons d'action */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dossier médical</h3>
        <div className="fixed top-20 right-16 z-50 flex flex-col md:flex-row gap-2 items-end md:items-center">
          <Button
            onClick={handleEditClick}
            variant={showEditPatientForm ? "outline" : "default"}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 hover:text-white text-white dark:bg-white dark:text-slate-900 dark:hover:bg-white/80 text-sm md:text-base px-3 md:px-4 py-2"
          >
            {showEditPatientForm ? (
              <>
                <X className="h-4 w-4 bg-red-700 hover:text-white dark:text-white" />
                Annuler
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Modifier
              </>
            )}
          </Button>
          <Button
            onClick={handleNewAppointmentClick}
            variant={showNewAppointmentForm ? "outline" : "default"}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-white/80 hover:text-white text-sm md:text-base px-3 md:px-4 py-2"
          >
            {showNewAppointmentForm ? (
              <>
                <X className="h-4 w-4 bg-red-700 hover:text-white dark:text-white" />
                Annuler
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Nouvelle séance
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Formulaire de modification du patient */}
      {showEditPatientForm && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit className="h-5 w-5 text-amber-500" />
              Modifier les informations de {
                patient.firstName
              }{" "}
              {patient.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PatientForm
              patient={patient}
              onSave={handlePatientUpdate}
              selectedCabinetId={selectedCabinetId}
            />
          </CardContent>
        </Card>
      )}

      {/* Formulaire de nouvelle séance */}
      {showNewAppointmentForm && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Nouvelle séance pour {patient.firstName}{" "}
              {patient.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentForm
              defaultValues={{
                patientId: patient.id,
                date: new Date(),
                time: "09:00",
                status: "SCHEDULED",
                website: "",
              }}
              onSuccess={handleAppointmentSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* Dernière séance */}
      {lastAppointment && (
        <Card className="border-blue-100 dark:border-slate-900/50 ">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg">
            <CardTitle className="text-lg flex flex-wrap items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Dernière séance (
              {format(
                new Date(lastAppointment.date),
                "dd MMMM yyyy",
                {
                  locale: fr,
                }
              )}
              ) :
              <AppointmentStatusBadge
                status={lastAppointment.status}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div>
              <p className="mb-2">
                <span className="font-medium">Motif :</span>{" "}
                {lastAppointment.reason}
              </p>
              <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 italic text-muted-foreground my-2">
                <span className="font-medium">
                  Compte-rendu :
                </span>{" "}
                {lastAppointment.notes
                  ? lastAppointment.notes
                  : "Pas de notes pour cette séance"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affichage des sphères sous forme d'accordéon avec icônes */}
      <MedicalAccordion
        sections={spheres.map((sphere) => ({
          title: sphere.title,
          icon: sphere.icon,
          category: sphere.category,
          items: sphere.items,
          defaultOpen: sphere.defaultOpen || false,
        }))}
      />
      {/* plus de sections si besoin */}
    </div>
  );
}
