
import { Patient, Contraception, Gender } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

// Type pour la mise à jour de patient
type UpdatePatientPayload = Omit<Patient, "createdAt" | "updatedAt">;

export async function updatePatient(patient: UpdatePatientPayload): Promise<Patient> {
  // Correction pour certaines valeurs d'énumération
  let contraceptionValue = patient.contraception;
  if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
    contraceptionValue = "IMPLANTS" as Contraception;
  }
  let genderValue = patient.gender;
  if (genderValue && genderValue.toString() === "Autre") {
    genderValue = "Homme" as Gender;
  }

  // Construction de l'objet à mettre à jour (sans timestamps)
  const updatable = {
    ...patient,
    contraception: contraceptionValue,
    gender: genderValue,
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
    osteopathId: patient.osteopathId || 1,
  };

  // Mise à jour avec single() pour obtenir directement l'objet
  const { data, error } = await supabase
    .from("Patient")
    .update(updatable)
    .eq("id", patient.id)
    .select()
    .single();

  if (error) {
    console.error("[SUPABASE ERROR]", error.code, error.message);
    throw error;
  }
  return adaptPatientFromSupabase(data);
}
