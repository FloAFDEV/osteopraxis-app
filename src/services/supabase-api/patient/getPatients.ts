
import { Patient } from "@/types";
import { supabase } from "../utils";
import { adaptPatientFromSupabase } from "../patient-adapter";

export async function getPatients(): Promise<Patient[]> {
  // First check if we have an authenticated user
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.error("No authenticated session found");
    return [];
  }
  
  try {
    // First attempt to get the osteopath ID for the current user
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("osteopathId")
      .eq("id", sessionData.session.user.id)
      .single();
      
    if (userError || !userData || !userData.osteopathId) {
      console.error("Error fetching user's osteopath ID:", userError || "No osteopathId found");
      return [];
    }
    
    // Now fetch only the patients belonging to this osteopath
    const { data, error } = await supabase
      .from("Patient")
      .select("*")
      .eq("osteopathId", userData.osteopathId);
      
    if (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
    
    return data.map(adaptPatientFromSupabase);
  } catch (error) {
    console.error("Exception in getPatients:", error);
    return [];
  }
}
