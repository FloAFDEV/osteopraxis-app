
import { UseFormReturn } from "react-hook-form";

export interface PatientFormValues {
  // Informations de base
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string | null;
  address: string;
  
  // Informations personnelles
  gender: string | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  cabinetId: number | null;
  maritalStatus: string | null;
  occupation: string | null;
  hasChildren: string | null;
  childrenAges: number[] | null;
  
  // Médecins et santé
  generalPractitioner: string | null;
  surgicalHistory: string | null;
  traumaHistory: string | null;
  rheumatologicalHistory: string | null;
  currentTreatment: string | null;
  handedness: string | null;
  hasVisionCorrection: boolean;
  ophtalmologistName: string | null;
  entProblems: string | null;
  entDoctorName: string | null;
  digestiveProblems: string | null;
  digestiveDoctorName: string | null;
  physicalActivity: string | null;
  
  // Tabagisme
  isSmoker: boolean;
  isExSmoker: boolean;
  smokingSince: string | null;
  smokingAmount: string | null;
  quitSmokingDate: string | null;
  
  // Contraception et statut familial
  contraception: string | null;
  familyStatus: string | null;
  
  // Examens et symptômes
  complementaryExams: string | null;
  generalSymptoms: string | null;
  allergies: string | null;
  
  // Historique de grossesse et développement (enfants)
  pregnancyHistory: string | null;
  birthDetails: string | null;
  developmentMilestones: string | null;
  sleepingPattern: string | null;
  feeding: string | null;
  behavior: string | null;
  childCareContext: string | null;
  
  // Nouveaux champs généraux
  ent_followup: string | null;
  intestinal_transit: string | null;
  sleep_quality: string | null;
  fracture_history: string | null;
  dental_health: string | null;
  sport_frequency: string | null;
  gynecological_history: string | null;
  other_comments_adult: string | null;
  
  // Nouveaux champs spécifiques aux enfants
  fine_motor_skills: string | null;
  gross_motor_skills: string | null;
  weight_at_birth: number | null;
  height_at_birth: number | null;
  head_circumference: number | null;
  apgar_score: string | null;
  childcare_type: string | null;
  school_grade: string | null;
  pediatrician_name: string | null;
  paramedical_followup: string | null;
  other_comments_child: string | null;

  // Champs cliniques
  diagnosis: string | null;
  medical_examination: string | null;
  treatment_plan: string | null;
  consultation_conclusion: string | null;
  cardiac_history: string | null;
  pulmonary_history: string | null;
  pelvic_history: string | null;
  neurological_history: string | null;
  neurodevelopmental_history: string | null;
  cranial_nerve_exam: string | null;
  dental_exam: string | null;
  cranial_exam: string | null;
  lmo_tests: string | null;
  cranial_membrane_exam: string | null;
  musculoskeletal_history: string | null;
  lower_limb_exam: string | null;
  upper_limb_exam: string | null;
  shoulder_exam: string | null;
  scoliosis: string | null;
  facial_mask_exam: string | null;
  fascia_exam: string | null;
  vascular_exam: string | null;
}

export interface PatientFormProps {
  patient?: any;
  onSubmit?: (data: PatientFormValues) => Promise<void>;
  onSave?: (data: PatientFormValues) => Promise<void>;
  emailRequired?: boolean;
  selectedCabinetId?: number | null;
  isLoading?: boolean;
}

export interface FormTabProps {
  form: UseFormReturn<PatientFormValues>;
}
