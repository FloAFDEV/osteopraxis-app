
import { supabase } from "@/integrations/supabase/client";

/**
 * Get current user's osteopath ID
 */
export async function getCurrentUserOsteopathId(): Promise<number> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) {
    throw new Error("No authenticated session");
  }

  const { data: userData, error: userError } = await supabase
    .from("User")
    .select("osteopathId")
    .eq("id", session.session.user.id)
    .single();

  if (userError || !userData || !userData.osteopathId) {
    console.error("Error getting user's osteopathId:", userError || "No osteopathId found");
    throw new Error("Unable to get osteopath ID");
  }

  return userData.osteopathId;
}
