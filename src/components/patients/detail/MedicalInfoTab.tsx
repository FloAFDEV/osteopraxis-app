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
  const isCardiacProblem = (text: string | null | undefined) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return (
      lower.includes("cardiaque") ||
      lower.includes("coeur") ||
      lower.includes("cœur") ||
      lower.includes("cardio")
    );
  };

  // Ajout d'une fonction utilitaire pour savoir si un champ est important ou critique
  // Critique : si le label contient cardiaque/cardio OU la valeur contient ces mots-clés
  // Important : tous les champs renseignés (non vides et non critiques)
  const isFieldCritical = (label: string, value: string | null | undefined) => {
    if (!value) return false;
    if (label.toLowerCase().includes("cardiaque")) return true;
    if (isCardiacProblem(value)) return true;
    return false;
  };
  const isFieldImportant = (label: string, value: string | null | undefined) => {
    if (!value) return false;
    if (isFieldCritical(label, value)) return false;
    // Tous les champs renseignés sont "Important", sauf ceux jugés "Critique"
    // Ici, on exclut les valeurs génériques utilisées pour non-renseigné...
    const notFilled = ["non", "aucun", "non renseigné", "null", "-", "", "Non renseigné"];
    if (notFilled.includes(String(value).trim().toLowerCase())) return false;
    return true;
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
        { label: "Antécédents médicaux familiaux", value: formatValue(patient.familyStatus), isImportant: isFieldImportant("Antécédents médicaux familiaux", patient.familyStatus), isCritical: isFieldCritical("Antécédents médicaux familiaux", patient.familyStatus) },
        { label: "Antécédents cardiaques", value: formatValue(patient.cardiac_history), isImportant: isFieldImportant("Antécédents cardiaques", patient.cardiac_history), isCritical: isFieldCritical("Antécédents cardiaques", patient.cardiac_history) },
        { label: "Antécédents pulmonaires", value: formatValue(patient.pulmonary_history), isImportant: isFieldImportant("Antécédents pulmonaires", patient.pulmonary_history), isCritical: isFieldCritical("Antécédents pulmonaires", patient.pulmonary_history) },
        // "Rhumatologie" n'est PAS un antécédent important mais affichée ici pour la fiche médicale globale
        { label: "Rhumatologie", value: formatValue(patient.rheumatologicalHistory), isImportant: isFieldImportant("Rhumatologie", patient.rheumatologicalHistory), isCritical: isFieldCritical("Rhumatologie", patient.rheumatologicalHistory) },
        { label: "Scoliose", value: formatValue(patient.scoliosis), isImportant: isFieldImportant("Scoliose", patient.scoliosis), isCritical: isFieldCritical("Scoliose", patient.scoliosis) },
        { label: "Traumatismes", value: formatValue(patient.traumaHistory), isImportant: isFieldImportant("Traumatismes", patient.traumaHistory), isCritical: isFieldCritical("Traumatismes", patient.traumaHistory) },
        { label: "Fractures", value: formatValue(patient.fracture_history), isImportant: isFieldImportant("Fractures", patient.fracture_history), isCritical: isFieldCritical("Fractures", patient.fracture_history) },
        { label: "Chirurgies", value: formatValue(patient.surgicalHistory), isImportant: isFieldImportant("Chirurgies", patient.surgicalHistory), isCritical: isFieldCritical("Chirurgies", patient.surgicalHistory) },
        { label: "Médecin généraliste", value: formatValue(patient.generalPractitioner), isImportant: isFieldImportant("Médecin généraliste", patient.generalPractitioner), isCritical: isFieldCritical("Médecin généraliste", patient.generalPractitioner) },
        { label: "Traitement actuel", value: formatValue(patient.currentTreatment), isImportant: isFieldImportant("Traitement actuel", patient.currentTreatment), isCritical: isFieldCritical("Traitement actuel", patient.currentTreatment) },
        { label: "Allergies", value: formatValue(patient.allergies && patient.allergies !== "NULL" ? patient.allergies : null), isImportant: isFieldImportant("Allergies", patient.allergies), isCritical: isFieldCritical("Allergies", patient.allergies) },
        { label: "Examens complémentaires", value: formatValue(patient.complementaryExams), isImportant: isFieldImportant("Examens complémentaires", patient.complementaryExams), isCritical: isFieldCritical("Examens complémentaires", patient.complementaryExams) },
        { label: "Résumé / Conclusion consultation", value: formatValue(patient.consultation_conclusion), isImportant: isFieldImportant("Résumé / Conclusion consultation", patient.consultation_conclusion), isCritical: isFieldCritical("Résumé / Conclusion consultation", patient.consultation_conclusion) },
        { label: "Diagnostic", value: formatValue(patient.diagnosis), isImportant: isFieldImportant("Diagnostic", patient.diagnosis), isCritical: isFieldCritical("Diagnostic", patient.diagnosis) },
        { label: "Plan de traitement", value: formatValue(patient.treatment_plan), isImportant: isFieldImportant("Plan de traitement", patient.treatment_plan), isCritical: isFieldCritical("Plan de traitement", patient.treatment_plan) },
        { label: "Examen médical", value: formatValue(patient.medical_examination), isImportant: isFieldImportant("Examen médical", patient.medical_examination), isCritical: isFieldCritical("Examen médical", patient.medical_examination) },
        { label: "Autres commentaires (adulte)", value: formatValue(patient.other_comments_adult), isImportant: isFieldImportant("Autres commentaires (adulte)", patient.other_comments_adult), isCritical: isFieldCritical("Autres commentaires (adulte)", patient.other_comments_adult) },
      ],
    },
    {
      title: "Activité & Hygiène de vie",
      icon: Dumbbell,
      category: "lifestyle" as const,
      items: [
        { label: "Activité physique", value: formatValue(patient.physicalActivity), isImportant: isFieldImportant("Activité physique", patient.physicalActivity), isCritical: isFieldCritical("Activité physique", patient.physicalActivity) },
        { label: "Fréquence sportive", value: formatValue(patient.sport_frequency), isImportant: isFieldImportant("Fréquence sportive", patient.sport_frequency), isCritical: isFieldCritical("Fréquence sportive", patient.sport_frequency) },
        { label: "Qualité du sommeil", value: formatValue(patient.sleep_quality), isImportant: isFieldImportant("Qualité du sommeil", patient.sleep_quality), isCritical: isFieldCritical("Qualité du sommeil", patient.sleep_quality) },
        { label: "Alimentation", value: formatValue(patient.feeding), isImportant: isFieldImportant("Alimentation", patient.feeding), isCritical: isFieldCritical("Alimentation", patient.feeding) },
        { label: "Poids", value: formatValue(patient.weight), isImportant: isFieldImportant("Poids", patient.weight), isCritical: isFieldCritical("Poids", patient.weight) },
        { label: "Taille", value: formatValue(patient.height), isImportant: isFieldImportant("Taille", patient.height), isCritical: isFieldCritical("Taille", patient.height) },
      ],
    },
    {
      title: "Sphère ORL / Ophtalmo / Dentaire",
      icon: Eye,
      category: "sensory" as const,
      items: orlOphDentalItems,
    },
    {
      title: "Sphère viscérale / digestive",
      icon: Soup,
      category: "digestive" as const,
      items: [
        { label: "Médecin digestif", value: formatValue(patient.digestiveDoctorName), isImportant: isFieldImportant("Médecin digestif", patient.digestiveDoctorName), isCritical: isFieldCritical("Médecin digestif", patient.digestiveDoctorName) },
        { label: "Problèmes digestifs", value: formatValue(patient.digestiveProblems), isImportant: isFieldImportant("Problèmes digestifs", patient.digestiveProblems), isCritical: isFieldCritical("Problèmes digestifs", patient.digestiveProblems) },
        { label: "Transit intestinal", value: formatValue(patient.intestinal_transit), isImportant: isFieldImportant("Transit intestinal", patient.intestinal_transit), isCritical: isFieldCritical("Transit intestinal", patient.intestinal_transit) },
      ],
    },
    {
      title: "Sphère neuro",
      icon: User,
      category: "general" as const,
      items: [
        { label: "Antécédents neurologiques", value: formatValue(patient.neurological_history), isImportant: isFieldImportant("Antécédents neurologiques", patient.neurological_history), isCritical: isFieldCritical("Antécédents neurologiques", patient.neurological_history) },
        { label: "Historique neurodéveloppemental", value: formatValue(patient.neurodevelopmental_history), isImportant: isFieldImportant("Historique neurodéveloppemental", patient.neurodevelopmental_history), isCritical: isFieldCritical("Historique neurodéveloppemental", patient.neurodevelopmental_history) },
        { label: "Examen des nerfs crâniens", value: formatValue(patient.cranial_nerve_exam), isImportant: isFieldImportant("Examen des nerfs crâniens", patient.cranial_nerve_exam), isCritical: isFieldCritical("Examen des nerfs crâniens", patient.cranial_nerve_exam) },
        { label: "Examen crânien", value: formatValue(patient.cranial_exam), isImportant: isFieldImportant("Examen crânien", patient.cranial_exam), isCritical: isFieldCritical("Examen crânien", patient.cranial_exam) },
        { label: "Examen membranes crâniennes", value: formatValue(patient.cranial_membrane_exam), isImportant: isFieldImportant("Examen membranes crâniennes", patient.cranial_membrane_exam), isCritical: isFieldCritical("Examen membranes crâniennes", patient.cranial_membrane_exam) },
        { label: "Examen des fascias", value: formatValue(patient.fascia_exam), isImportant: isFieldImportant("Examen des fascias", patient.fascia_exam), isCritical: isFieldCritical("Examen des fascias", patient.fascia_exam) },
        { label: "Examen vasculaire", value: formatValue(patient.vascular_exam), isImportant: isFieldImportant("Examen vasculaire", patient.vascular_exam), isCritical: isFieldCritical("Examen vasculaire", patient.vascular_exam) },
        { label: "Symptômes généraux", value: formatValue(patient.generalSymptoms), isImportant: isFieldImportant("Symptômes généraux", patient.generalSymptoms), isCritical: isFieldCritical("Symptômes généraux", patient.generalSymptoms) },
      ],
    },
    {
      title: "Sphère périphérique",
      icon: Activity,
      category: "general" as const,
      items: [
        { label: "Sous-section : Membres supérieurs", value: "" },
        ...periphericSection[0].items,
        { label: "Sous-section : Membres inférieurs", value: "" },
        ...periphericSection[1].items,
      ],
    },
    {
      title: "Sphère pelvienne/gynéco-uro",
      icon: Baby,
      category: "reproductive" as const,
      items: [
        { label: "Antécédents pelviens/gynéco-uro", value: formatValue(patient.pelvic_history), isImportant: isFieldImportant("Antécédents pelviens/gynéco-uro", patient.pelvic_history), isCritical: isFieldCritical("Antécédents pelviens/gynéco-uro", patient.pelvic_history) },
        { label: "Antécédents gynécologiques", value: formatValue(patient.gynecological_history), isImportant: isFieldImportant("Antécédents gynécologiques", patient.gynecological_history), isCritical: isFieldCritical("Antécédents gynécologiques", patient.gynecological_history) },
      ],
    },
    {
      title: "Enfant : données enfant/pédiatrie",
      icon: Baby,
      category: "pediatric" as const,
      items: [
        { label: "Poids de naissance", value: formatValue(patient.weight_at_birth), isImportant: isFieldImportant("Poids de naissance", patient.weight_at_birth), isCritical: isFieldCritical("Poids de naissance", patient.weight_at_birth) },
        { label: "Taille de naissance", value: formatValue(patient.height_at_birth), isImportant: isFieldImportant("Taille de naissance", patient.height_at_birth), isCritical: isFieldCritical("Taille de naissance", patient.height_at_birth) },
        { label: "Périmètre crânien", value: formatValue(patient.head_circumference), isImportant: isFieldImportant("Périmètre crânien", patient.head_circumference), isCritical: isFieldCritical("Périmètre crânien", patient.head_circumference) },
        { label: "Score d'Apgar", value: formatValue(patient.apgar_score), isImportant: isFieldImportant("Score d'Apgar", patient.apgar_score), isCritical: isFieldCritical("Score d'Apgar", patient.apgar_score) },
        { label: "Mode de garde", value: formatValue(patient.childcare_type), isImportant: isFieldImportant("Mode de garde", patient.childcare_type), isCritical: isFieldCritical("Mode de garde", patient.childcare_type) },
        { label: "Niveau scolaire", value: formatValue(patient.school_grade), isImportant: isFieldImportant("Niveau scolaire", patient.school_grade), isCritical: isFieldCritical("Niveau scolaire", patient.school_grade) },
        { label: "Pédiatre", value: formatValue(patient.pediatrician_name), isImportant: isFieldImportant("Pédiatre", patient.pediatrician_name), isCritical: isFieldCritical("Pédiatre", patient.pediatrician_name) },
        { label: "Suivi paramédical", value: formatValue(patient.paramedical_followup), isImportant: isFieldImportant("Suivi paramédical", patient.paramedical_followup), isCritical: isFieldCritical("Suivi paramédical", patient.paramedical_followup) },
        { label: "Commentaires enfant", value: formatValue(patient.other_comments_child), isImportant: isFieldImportant("Commentaires enfant", patient.other_comments_child), isCritical: isFieldCritical("Commentaires enfant", patient.other_comments_child) },
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
