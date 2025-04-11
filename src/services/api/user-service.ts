
import { delay, USE_SUPABASE } from "./config";
import { supabaseUserService } from "../supabase-api/user-service";

export const userService = {
  async updateUserOsteopathId(userId: string, osteopathId: number): Promise<void> {
    if (USE_SUPABASE) {
      try {
        return await supabaseUserService.updateUserOsteopathId(userId, osteopathId);
      } catch (error) {
        console.error("Erreur Supabase updateUserOsteopathId:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    console.log(`User ${userId} updated with osteopathId ${osteopathId}`);
  }
};
