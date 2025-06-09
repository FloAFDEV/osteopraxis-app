
import { Patient } from "@/types";

export interface PatientFormValues {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  gender?: "Homme" | "Femme" | null; // Updated to match Patient interface
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;
  cabinetId?: number | null;
  maritalStatus?: string | null;
  occupation?: string | null;
  hasChildren?: string | null;
  childrenAges?: number[] | null;
  generalPractitioner?: string | null;
  surgicalHistory?: string | null;
  traumaHistory?: string | null;
  rheumatologicalHistory?: string | null;
  currentTreatment?: string | null;
  handedness?: string | null;
  hasVisionCorrection?: boolean;
  ophtalmologistName?: string | null;
  entProblems?: string | null;
  entDoctorName?: string | null;
  digestiveProblems?: string | null;
  digestiveDoctorName?: string | null;
  physicalActivity?: string | null;
  isSmoker?: boolean;
  isExSmoker?: boolean;
  smokingSince?: string | null;
  smokingAmount?: string | null;
  quitSmokingDate?: string | null;
  contraception?: string | null;
  familyStatus?: string | null;
  complementaryExams?: string | null;
  generalSymptoms?: string | null;
  pregnancyHistory?: string | null;
  birthDetails?: string | null;
  developmentMilestones?: string | null;
  sleepingPattern?: string | null;
  feeding?: string | null;
  behavior?: string | null;
  childCareContext?: string | null;
  allergies?: string | null;
  
  // Nouveaux champs généraux
  ent_followup?: string | null;
  intestinal_transit?: string | null;
  sleep_quality?: string | null;
  fracture_history?: string | null;
  dental_health?: string | null;
  sport_frequency?: string | null;
  gynecological_history?: string | null;
  other_comments_adult?: string | null;
  
  // Nouveaux champs spécifiques aux enfants
  fine_motor_skills?: string | null;
  gross_motor_skills?: string | null;
  weight_at_birth?: number | null;
  height_at_birth?: number | null;
  head_circumference?: number | null;
  apgar_score?: string | null;
  childcare_type?: string | null;
  school_grade?: string | null;
  pediatrician_name?: string | null;
  paramedical_followup?: string | null;
  other_comments_child?: string | null;
  
  // Champs manquants identifiés dans Patient mais pas dans le formulaire
  avatarUrl?: string | null;
  userId?: string | null;
  osteopathId?: number | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  job?: string | null;
  alcoholConsumption?: string | null;
  hdlm?: string | null;
  isDeceased?: boolean;
  smoker?: boolean;
  smokerSince?: number | null;
  sportActivity?: string | null;
  medicalHistory?: string | null;
  currentMedication?: string | null;
  otherContraception?: string | null;
  notes?: string | null;
}

export interface PatientFormProps {
  patient?: Patient;
  onSubmit?: (data: PatientFormValues) => Promise<void>;
  onSave?: (data: PatientFormValues) => Promise<void>;
  emailRequired?: boolean;
  selectedCabinetId?: number | null;
  isLoading?: boolean;
}
