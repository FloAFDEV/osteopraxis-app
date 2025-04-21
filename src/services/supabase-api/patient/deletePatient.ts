
import { supabase } from "../utils";

export async function deletePatient(id: number): Promise<{ error: any | null }> {
  try {
    // Using DELETE method via the client SDK, which properly handles this as a POST
    // with the right parameters, avoiding CORS PATCH issues
    const { error } = await supabase.from("Patient").delete().eq("id", id);
    return { error: error || null };
  } catch (error) {
    console.error("Exception while deleting patient:", error);
    return { error };
  }
}
