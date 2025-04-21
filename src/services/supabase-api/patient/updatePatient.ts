
import { Patient, Contraception, Gender } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function updatePatient(patient: Patient): Promise<Patient> {
  let contraceptionValue = patient.contraception;
  if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
    contraceptionValue = "IMPLANTS" as Contraception;
  }
  let genderValue = patient.gender;
  if (genderValue && genderValue.toString() === "Autre") {
    genderValue = "Homme" as Gender;
  }

  // Remove createdAt/updatedAt from client-side updates - let Postgres handle these
  const patientData = {
    ...patient,
    contraception: contraceptionValue,
    gender: genderValue,
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
    osteopathId: patient.osteopathId || 1,
    // Let Postgres handle timestamps
    createdAt: undefined,
    updatedAt: undefined,
  };

  // Use upsert with onConflict to handle potential conflicts
  const { data, error } = await supabase
    .from("Patient")
    .upsert(patientData)
    .select()
    .single();

  if (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
  return adaptPatientFromSupabase(data);
}
