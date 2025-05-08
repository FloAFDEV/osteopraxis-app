
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase.from("Patient").select("*");
  if (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
  return data.map(adaptPatientFromSupabase);
}
