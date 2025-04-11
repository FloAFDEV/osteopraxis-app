
import { supabase } from "./utils";

export const supabaseUserService = {
  async updateUserOsteopathId(userId: string, osteopathId: number): Promise<void> {
    const { error } = await supabase
      .from("User")
      .update({ osteopathId })
      .eq("id", userId);
      
    if (error) throw new Error(error.message);
  }
};
