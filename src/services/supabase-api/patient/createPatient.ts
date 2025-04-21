
import { Patient, Contraception, Gender } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function createPatient(patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
  let contraceptionValue = patient.contraception;
  if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
    contraceptionValue = "IMPLANTS" as Contraception;
  }
  let genderValue = patient.gender;
  if (genderValue && genderValue.toString() === "Autre") {
    genderValue = "Homme" as Gender;
  }

  // On ne gère plus createdAt ni updatedAt ici, on laisse Postgres s'en charger
  const patientData = {
    ...patient,
    contraception: contraceptionValue,
    gender: genderValue,
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
    osteopathId: patient.osteopathId || 1,
    userId: patient.userId || null,
    createdAt: undefined,
    updatedAt: undefined,
  };

  // On réalise tout en un seul upsert (avec onConflict 'email') : 
  const { data, error } = await supabase
    .from("Patient")
    .upsert(patientData, { onConflict: "email", ignoreDuplicates: false })
    .select()
    .single();

  if (error) {
    console.error("Error creating patient:", error);
    throw error;
  }

  return adaptPatientFromSupabase(data);
}
