
import { Patient, Contraception, Gender } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

// Type pour la création de patient, sans les champs générés
type CreatePatientPayload = Omit<Patient, "id" | "createdAt" | "updatedAt">;

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

  // Création de l'objet à insérer sans id ni timestamps (ils seront gérés par Postgres)
  const insertable = {
    ...patient,
    contraception: contraceptionValue,
    gender: genderValue,
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
    // Email est maintenant facultatif
    email: patient.email || null,
    osteopathId: patient.osteopathId,
    userId: patient.userId || null
  };

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
