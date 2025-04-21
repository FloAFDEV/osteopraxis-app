
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function getPatientById(id: number): Promise<Patient | null> {
  const { data, error } = await supabase
    .from("Patient")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching patient with id ${id}:`, error);
    throw error;
  }
  return data ? adaptPatientFromSupabase(data) : null;
}
