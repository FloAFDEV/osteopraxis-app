
import { Patient, Contraception, Gender } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

// Ne jamais envoyer createdAt/updatedAt à Supabase ; laissez le trigger SQL mettre à jour updatedAt côté serveur
export async function updatePatient(patient: Patient): Promise<Patient> {
  let contraceptionValue = patient.contraception;
  if (contraceptionValue && contraceptionValue.toString() === "IMPLANT") {
    contraceptionValue = "IMPLANTS" as Contraception;
  }
  let genderValue = patient.gender;
  if (genderValue && genderValue.toString() === "Autre") {
    genderValue = "Homme" as Gender;
  }

  const {
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...updatable
  } = {
    ...patient,
    contraception: contraceptionValue,
    gender: genderValue,
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString() : null,
    osteopathId: patient.osteopathId || 1,
  } as any;

  // Ne pas utiliser upsert ici sauf besoin (et unique index)
  const { data, error } = await supabase
    .from("Patient")
    .update(updatable)
    .eq("id", patient.id)
    .single();

  if (error) {
    console.error("[SUPABASE ERROR]", error.code, error.message);
    throw error;
  }
  return adaptPatientFromSupabase(data);
}
