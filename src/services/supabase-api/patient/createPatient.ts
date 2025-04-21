
import { Patient, Contraception, Gender } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

// Ne jamais envoyer id / createdAt / updatedAt ; fallback sur DEFAULTs SQL pour les timestamps
export async function createPatient(patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
  let contraceptionValue = patient.contraception;
  if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
    contraceptionValue = "IMPLANTS" as Contraception;
  }
  let genderValue = patient.gender;
  if (genderValue && genderValue.toString() === "Autre") {
    genderValue = "Homme" as Gender;
  }

  const { id: _omit, createdAt: _createdAt, updatedAt: _updatedAt, ...insertable } = {
    ...patient,
    contraception: contraceptionValue,
    gender: genderValue,
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
    osteopathId: patient.osteopathId || 1,
    userId: patient.userId || null
  } as any;

  // Si onConflict: s'assurer que 'email' est bien UNIQUE côté SQL, sinon retirer!
  const { data, error } = await supabase
    .from("Patient")
    .insert(insertable)
    .single();

  if (error) {
    console.error("[SUPABASE ERROR]", error.code, error.message);
    throw error;
  }

  return adaptPatientFromSupabase(data);
}
