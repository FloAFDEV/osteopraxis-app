
import { supabase } from "../utils";

export async function deletePatient(id: number): Promise<{ error: any | null }> {
  try {
    const { error } = await supabase.from("Patient").delete().eq("id", id);
    return { error: error || null };
  } catch (error) {
    console.error("Exception while deleting patient:", error);
    return { error };
  }
}
