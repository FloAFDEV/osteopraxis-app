
import { Patient, Contraception, Gender } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

// Type pour la création de patient, sans les champs générés
export type CreatePatientPayload = Omit<Patient, "id" | "createdAt" | "updatedAt">;

export async function createPatient(patient: CreatePatientPayload): Promise<Patient> {
  // Correction pour certaines valeurs d'énumération
  let contraceptionValue = patient.contraception;
  if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
    contraceptionValue = "IMPLANTS" as Contraception;
  }
  let genderValue = patient.gender;
  if (genderValue && genderValue.toString() === "Autre") {
    genderValue = "Homme" as Gender;
  }

  // Vérification de l'osteopathId
  if (!patient.osteopathId) {
    console.error("Erreur: osteopathId manquant lors de la création du patient");
    throw new Error("L'ID de l'ostéopathe est requis pour créer un patient");
  }

  // Vérification que cabinetId est défini
  if (!patient.cabinetId) {
    console.warn("Attention: cabinetId manquant lors de la création du patient. Utilisation du cabinet par défaut.");
  }

  // Création de l'objet à insérer sans id ni timestamps (ils seront gérés par Postgres)
  const insertable = {
    ...patient,
    contraception: contraceptionValue,
    gender: genderValue,
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
    // Email est maintenant facultatif
    email: patient.email || null,
    osteopathId: patient.osteopathId,
    cabinetId: patient.cabinetId,
    userId: patient.userId || null,
    // Nouveaux champs pour le tabagisme
    smokingSince: patient.smokingSince || null,
    smokingAmount: patient.smokingAmount || null,
    isExSmoker: patient.isExSmoker || false,
    quitSmokingDate: patient.quitSmokingDate || null,
    // Ajout des nouveaux champs avec valeurs par défaut
    apgar_score: patient.apgar_score || null,
    childcare_type: patient.childcare_type || null,
    dental_health: patient.dental_health || null,
    ent_followup: patient.ent_followup || null,
    fine_motor_skills: patient.fine_motor_skills || null,
    fracture_history: patient.fracture_history || null,
    gross_motor_skills: patient.gross_motor_skills || null,
    gynecological_history: patient.gynecological_history || null,
    head_circumference: patient.head_circumference || null,
    height_at_birth: patient.height_at_birth || null,
    intestinal_transit: patient.intestinal_transit || null,
    other_comments_adult: patient.other_comments_adult || null,
    other_comments_child: patient.other_comments_child || null,
    paramedical_followup: patient.paramedical_followup || null,
    pediatrician_name: patient.pediatrician_name || null,
    school_grade: patient.school_grade || null,
    sleep_quality: patient.sleep_quality || null,
    sport_frequency: patient.sport_frequency || null,
    weight_at_birth: patient.weight_at_birth || null
  };

  console.log("Création d'un patient avec les données:", insertable);

  // Insertion avec single() pour obtenir directement l'objet
  const { data, error } = await supabase
    .from("Patient")
    .insert(insertable)
    .select()
    .single();

  if (error) {
    console.error("[SUPABASE ERROR]", error.code, error.message);
    throw error;
  }

  return adaptPatientFromSupabase(data);
}
