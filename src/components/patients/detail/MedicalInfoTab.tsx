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

  // Fonction helper pour fusionner traumatismes et fractures
  const getTraumaAndFractureHistory = () => {
    const trauma = patient.traumaHistory;
    const fractures = patient.fracture_history;

    if (trauma && fractures) {
      return `${trauma} | ${fractures}`;
    }
    return trauma || fractures || null;
  };

  // Fonction helper pour déterminer l'importance médicale
  const isCriticalCondition = (value: string | null | undefined) => {
    if (!value) return false;
    const criticalKeywords = [
      "allergie",
      "urgence",
      "critique",
      "grave",
      "sévère",
      "avp",
      "accident",
      "hospitalisation",
      "AVC",
      "AVP",
    ];
    return criticalKeywords.some((keyword) =>
      value.toLowerCase().includes(keyword)
    );
  };

  const isImportantCondition = (value: string | null | undefined) => {
    if (!value) return false;
    const importantKeywords = [
      "traitement",
      "médicament",
      "suivi",
      "chronique",
      "antécédent",
      "antécédents",
    ];
    return importantKeywords.some((keyword) =>
      value.toLowerCase().includes(keyword)
    );
  };

  type MedicalSectionCategory =
    | "general"
    | "lifestyle"
    | "sensory"
    | "digestive"
    | "additional"
    | "reproductive"
    | "pediatric";

  const medicalSections: {
    title: string;
    icon: any;
    priority: "high" | "medium" | "low";
    category: MedicalSectionCategory;
    defaultOpen?: boolean;
    sectionId: string;
    items: any[];
  }[] = [
    {
      title: "Informations médicales générales",
      icon: Stethoscope,
      priority: "high" as const,
      category: "general" as const,
      defaultOpen: true,
      sectionId: "informations-medicales-generales",
      items: [
        {
          label: "Médecin généraliste",
          value: patient.generalPractitioner,
          // Retiré isImportant pour le médecin généraliste
        },
        {
          label: "Traitement actuel",
          value: patient.currentTreatment,
          isCritical: isCriticalCondition(patient.currentTreatment),
          isImportant: !!patient.currentTreatment,
        },
        {
          label: "Allergies",
          value:
            patient.allergies && patient.allergies !== "NULL"
              ? patient.allergies
              : null,
          isCritical: !!(
            patient.allergies && patient.allergies !== "NULL"
          ),
          isImportant: !!(
            patient.allergies && patient.allergies !== "NULL"
          ),
        },
        {
          label: "Antécédents médicaux familiaux",
          value: patient.familyStatus,
          isImportant: isImportantCondition(patient.familyStatus),
        },
        {
          label: "Chirurgie",
          value: patient.surgicalHistory,
          isImportant: isImportantCondition(patient.surgicalHistory),
        },
        {
          label: "Traumatismes et fractures",
          value: getTraumaAndFractureHistory(),
          isImportant: !!(
            patient.traumaHistory || patient.fracture_history
          ),
        },
        {
          label: "Rhumatologie",
          value: patient.rheumatologicalHistory,
          isImportant: isImportantCondition(
            patient.rheumatologicalHistory
          ),
        },
      ],
    },
    {
      title: "Activité physique / Sommeil",
      icon: Dumbbell,
      priority: "medium" as const,
      category: "lifestyle" as const,
      sectionId: "activite-physique-sommeil",
      items: [
        {
          label: "Activité physique",
          value: patient.physicalActivity,
        },
        {
          label: "Fréquence sportive",
          value: patient.sport_frequency,
        },
        {
          label: "Qualité du sommeil",
          value: patient.sleep_quality,
          isImportant:
            patient.sleep_quality
              ?.toLowerCase()
              .includes("mauvais") ||
            patient.sleep_quality
              ?.toLowerCase()
              .includes("trouble"),
        },
      ],
    },
    {
      title: "Ophtalmologie / Dentaire",
      icon: Eye,
      priority: "low" as const,
      category: "sensory" as const,
      sectionId: "ophtalmologie-dentaire",
      items: [
        {
          label: "Correction de la vue",
          value: patient.hasVisionCorrection ? "Oui" : "Non",
        },
        {
          label: "Ophtalmologue",
          value: patient.ophtalmologistName,
        },
        {
          label: "Santé dentaire",
          value: patient.dental_health,
          isImportant:
            patient.dental_health
              ?.toLowerCase()
              .includes("problème") ||
            patient.dental_health
              ?.toLowerCase()
              .includes("douleur"),
        },
      ],
    },
    {
      title: "ORL",
      icon: Ear,
      priority: "medium" as const,
      category: "sensory" as const,
      sectionId: "orl",
      items: [
        {
          label: "Problèmes ORL",
          value: patient.entProblems,
          isCritical: isCriticalCondition(patient.entProblems),
          isImportant: !!patient.entProblems,
        },
        {
          label: "Médecin ORL",
          value: patient.entDoctorName,
        },
        {
          label: "Suivi ORL",
          value: patient.ent_followup,
          isImportant: !!patient.ent_followup,
        },
      ],
    },
    {
      title: "Digestif",
      icon: Soup,
      priority: "medium" as const,
      category: "digestive" as const,
      sectionId: "digestif",
      items: [
        {
          label: "Problèmes digestifs",
          value: patient.digestiveProblems,
          isCritical: isCriticalCondition(patient.digestiveProblems),
          isImportant: !!patient.digestiveProblems,
        },
        {
          label: "Transit intestinal",
          value: patient.intestinal_transit,
          isImportant:
            patient.intestinal_transit
              ?.toLowerCase()
              .includes("problème") ||
            patient.intestinal_transit
              ?.toLowerCase()
              .includes("trouble"),
        },
        {
          label: "Médecin digestif",
          value: patient.digestiveDoctorName,
        },
      ],
    },
    {
      title: "Anamnèse complémentaire",
      icon: FilePlus2,
      priority: "low" as const,
      category: "additional" as const,
      sectionId: "anamnese-complementaire",
      items: [
        {
          label: "Examens complémentaires",
          value: patient.complementaryExams,
          isImportant: !!patient.complementaryExams,
        },
        {
          label: "Symptômes généraux",
          value: patient.generalSymptoms,
          isImportant: !!patient.generalSymptoms,
        },
      ],
    },
  ];

  // Sections spécifiques aux adultes
  if (!isChild) {
    medicalSections.push({
      title: "Gynécologique",
      icon: Heart,
      priority: "medium" as const,
      category: "reproductive" as const,
      sectionId: "gynecologique",
      items: [
        {
          label: "Contraception",
          value: patient.contraception
            ? String(patient.contraception)
            : null,
        },
        {
          label: "Antécédents gynécologiques",
          value: patient.gynecological_history,
          isImportant: isImportantCondition(
            patient.gynecological_history
          ),
        },
      ],
    });

    if (patient.other_comments_adult) {
      medicalSections.push({
        title: "Autres commentaires",
        icon: StickyNote,
        priority: "low" as const,
        category: "additional" as const,
        sectionId: "autres-commentaires-adulte",
        items: [
          {
            label: "Notes supplémentaires",
            value: patient.other_comments_adult,
            isImportant: !!patient.other_comments_adult,
          },
        ],
      });
    }
  }

  // Sections spécifiques aux enfants
  if (isChild) {
    medicalSections.push(
      {
        title: "Informations pédiatriques générales",
        icon: Baby,
        priority: "high" as const,
        category: "pediatric" as const,
        defaultOpen: true,
        sectionId: "informations-pediatriques-generales",
        items: [
          {
            label: "Grossesse",
            value: patient.pregnancyHistory,
            isImportant: isImportantCondition(
              patient.pregnancyHistory
            ),
          },
          {
            label: "Naissance",
            value: patient.birthDetails,
            isImportant: isImportantCondition(patient.birthDetails),
          },
          {
            label: "Score APGAR",
            value: patient.apgar_score,
            isImportant: patient.apgar_score
              ? parseFloat(patient.apgar_score) < 7
              : false,
          },
          {
            label: "Poids à la naissance",
            value: patient.weight_at_birth
              ? `${patient.weight_at_birth} g`
              : null,
            isImportant: patient.weight_at_birth
              ? Number(patient.weight_at_birth) < 2500 ||
                Number(patient.weight_at_birth) > 4000
              : false,
          },
          {
            label: "Taille à la naissance",
            value: patient.height_at_birth
              ? `${patient.height_at_birth} cm`
              : null,
          },
          {
            label: "Périmètre crânien",
            value: patient.head_circumference
              ? `${patient.head_circumference} cm`
              : null,
          },
        ],
      },
      {
        title: "Développement et suivi",
        icon: Activity,
        priority: "medium" as const,
        category: "pediatric" as const,
        sectionId: "developpement-et-suivi",
        items: [
          {
            label: "Développement moteur",
            value: patient.developmentMilestones,
            isImportant:
              patient.developmentMilestones
                ?.toLowerCase()
                .includes("retard") ||
              patient.developmentMilestones
                ?.toLowerCase()
                .includes("problème"),
          },
          {
            label: "Motricité fine",
            value: patient.fine_motor_skills,
            isImportant:
              patient.fine_motor_skills
                ?.toLowerCase()
                .includes("difficile") ||
              patient.fine_motor_skills
                ?.toLowerCase()
                .includes("retard"),
          },
          {
            label: "Motricité globale",
            value: patient.gross_motor_skills,
            isImportant:
              patient.gross_motor_skills
                ?.toLowerCase()
                .includes("difficile") ||
              patient.gross_motor_skills
                ?.toLowerCase()
                .includes("retard"),
          },
          {
            label: "Sommeil",
            value: patient.sleepingPattern,
            isImportant:
              patient.sleepingPattern
                ?.toLowerCase()
                .includes("trouble") ||
              patient.sleepingPattern
                ?.toLowerCase()
                .includes("difficile"),
          },
          {
            label: "Alimentation",
            value: patient.feeding,
            isImportant:
              patient.feeding
                ?.toLowerCase()
                .includes("problème") ||
              patient.feeding
                ?.toLowerCase()
                .includes("difficile"),
          },
          {
            label: "Comportement",
            value: patient.behavior,
            isImportant:
              patient.behavior
                ?.toLowerCase()
                .includes("problème") ||
              patient.behavior
                ?.toLowerCase()
                .includes("difficile"),
          },
        ],
      },
      {
        title: "Environnement et suivi",
        icon: Home,
        priority: "low" as const,
        category: "pediatric" as const,
        sectionId: "environnement-et-suivi",
        items: [
          {
            label: "Mode de garde",
            value: patient.childcare_type,
          },
          {
            label: "Niveau scolaire",
            value: patient.school_grade,
          },
          {
            label: "Pédiatre",
            value: patient.pediatrician_name,
          },
          {
            label: "Suivis paramédicaux",
            value: patient.paramedical_followup,
            isImportant: !!patient.paramedical_followup,
          },
          {
            label: "Contexte de garde",
            value: patient.childCareContext,
          },
        ],
      }
    );

    if (patient.other_comments_child) {
      medicalSections.push({
        title: "Autres commentaires",
        icon: StickyNote,
        priority: "low" as const,
        category: "additional" as const,
        sectionId: "autres-commentaires-enfant",
        items: [
          {
            label: "Notes supplémentaires",
            value: patient.other_comments_child,
            isImportant: !!patient.other_comments_child,
          },
        ],
      });
    }
  }

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

  // Regrouper les sphères — ajouté ou déplacé si besoin
  const groupedMedicalSections = [
    {
      group: "ORL",
      icon: <Ear className="h-4 w-4 text-purple-700" />,
      items: [
        { label: "Médecin ORL", value: patient.entDoctorName },
        { label: "Problèmes ORL", value: patient.entProblems },
        { label: "Suivi ORL", value: patient.ent_followup },
      ],
    },
    {
      group: "Viscérale",
      icon: <Soup className="h-4 w-4 text-amber-700" />,
      items: [
        { label: "Médecin digestif", value: patient.digestiveDoctorName },
        { label: "Problèmes digestifs", value: patient.digestiveProblems },
        { label: "Transit intestinal", value: patient.intestinal_transit },
      ],
    },
    {
      group: "Périphérique",
      icon: <Activity className="h-4 w-4 text-green-700" />,
      items: [
        { label: "Motricité globale", value: patient.gross_motor_skills },
        { label: "Motricité fine", value: patient.fine_motor_skills },
        { label: "Fractures", value: patient.fracture_history },
        { label: "Antécédents rhumatologiques", value: patient.rheumatologicalHistory },
        { label: "Antécédents de traumatismes", value: patient.traumaHistory },
        { label: "Fréquence sportive", value: patient.sport_frequency },
      ],
    },
    {
      group: "Générale",
      icon: <User className="h-4 w-4 text-gray-700" />,
      items: [
        { label: "Symptômes généraux", value: patient.generalSymptoms },
        { label: "Correction de la vue", value: patient.hasVisionCorrection ? "Oui" : "Non" },
        { label: "Latéralité", value: patient.handedness },
        { label: "Qualité du sommeil", value: patient.sleep_quality },
        { label: "Alimentation", value: patient.feeding },
        // ... ajoutez autres champs généraux pertinents si besoin
      ],
    },
  ];

  // 1. Récupérer tous les labels déjà affichés dans groupedMedicalSections
  const shownLabels = new Set<string>();
  groupedMedicalSections.forEach(g => {
    g.items.forEach(item => {
      if (item.value && item.label) {
        shownLabels.add(item.label);
      }
    });
  });

  // 2. Filtrer les medicalSections pour ne pas réafficher ces labels
  const filteredMedicalSections = medicalSections.map(section => ({
    ...section,
    items: section.items.filter(item => !shownLabels.has(item.label)),
  })).filter(section => section.items.length > 0); // ignorer les sections vides

  // Regroupement pour affichage dédié des nouvelles sphères
  const specializedSphereSections = [
    {
      title: "Antécédents cardiaques",
      value: patient.cardiac_history,
    },
    {
      title: "Antécédents pulmonaires",
      value: patient.pulmonary_history,
    },
    {
      title: "Antécédents pelviens / gynéco-uro",
      value: patient.pelvic_history,
    },
    {
      title: "Antécédents neurologiques",
      value: patient.neurological_history,
    },
    {
      title: "Historique neurodéveloppemental",
      value: patient.neurodevelopmental_history,
    },
    {
      title: "Examen des nerfs crâniens",
      value: patient.cranial_nerve_exam,
    },
    {
      title: "Examen dentaire",
      value: patient.dental_exam,
    },
    {
      title: "Examen crânien",
      value: patient.cranial_exam,
    },
    {
      title: "Tests LMO",
      value: patient.lmo_tests,
    },
    {
      title: "Examen des membranes crâniennes",
      value: patient.cranial_membrane_exam,
    },
    {
      title: "Historique musculo-squelettique",
      value: patient.musculoskeletal_history,
    },
    {
      title: "Examen du membre inférieur",
      value: patient.lower_limb_exam,
    },
    {
      title: "Examen du membre supérieur",
      value: patient.upper_limb_exam,
    },
    {
      title: "Examen de l'épaule",
      value: patient.shoulder_exam,
    },
    {
      title: "Scoliose",
      value: patient.scoliosis,
    },
    {
      title: "Examen des fascias",
      value: patient.fascia_exam,
    },
    {
      title: "Examen du masque facial",
      value: patient.facial_mask_exam,
    },
    {
      title: "Examen vasculaire",
      value: patient.vascular_exam,
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

      {/* Nouvelles sections cliniques : affichage conditionnel */}
      {clinicalSections.some(section => section.field && section.field.trim() !== "") && (
        <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50/70 dark:bg-blue-950/30 mb-4 space-y-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <StickyNote className="h-5 w-5 text-blue-900" />
            Compte-rendu clinique
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clinicalSections.map(
              (section, idx) =>
                section.field && section.field.trim() !== "" && (
                  <div key={section.title} className="bg-white dark:bg-slate-800 rounded p-3 border border-muted-200 dark:border-muted-700 flex flex-col shadow-sm">
                    <span className="flex items-center gap-2 font-medium text-sm mb-1">
                      {section.icon}
                      {section.title}
                    </span>
                    <span className="text-gray-700 dark:text-gray-100">{section.field}</span>
                  </div>
                )
            )}
          </div>
        </div>
      )}

      {/* Séparateurs visuels & regroupement par sphères médicales */}
      {groupedMedicalSections.map(g =>
        g.items.some(item => item.value && item.value.trim() !== "") && (
          <div key={g.group} className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-lg font-semibold text-gray-700 dark:text-gray-100">
              {g.icon} {g.group}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {g.items.map(
                (item, idx) =>
                  item.value &&
                  item.value.trim() !== "" && (
                    <div
                      key={item.label}
                      className="bg-white dark:bg-slate-800 rounded p-3 border border-muted-200 dark:border-muted-700 flex flex-col shadow-sm"
                    >
                      <span className="font-medium text-sm mb-1">{item.label}</span>
                      <span className="text-gray-700 dark:text-gray-100">{item.value}</span>
                    </div>
                  )
              )}
            </div>
            {g !== groupedMedicalSections[groupedMedicalSections.length - 1] && (
              <hr className="my-6 border-t border-dashed border-gray-300 dark:border-gray-700" />
            )}
          </div>
        )
      )}

      {/* Section sphères spéciales */}
      {specializedSphereSections.some(s => s.value && String(s.value).trim() !== "") && (
        <Card className="border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Sphères spécialisées
              <span className="text-sm font-normal text-orange-700 dark:text-orange-200">
                (nouveaux champs)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specializedSphereSections.map(
                (s, idx) =>
                  s.value &&
                  String(s.value).trim() !== "" && (
                    <div
                      key={s.title}
                      className="bg-white dark:bg-slate-800 rounded p-4 border border-muted-200 dark:border-muted-700 flex flex-col shadow-sm"
                    >
                      <span className="font-semibold text-base mb-1 text-orange-900 dark:text-orange-200">{s.title}</span>
                      <span className="text-gray-700 dark:text-gray-100 whitespace-pre-line break-words">{s.value}</span>
                    </div>
                  )
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <MedicalAccordion sections={filteredMedicalSections} />
    </div>
  );
}
