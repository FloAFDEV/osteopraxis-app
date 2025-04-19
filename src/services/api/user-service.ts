
import { User, Role } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const userService = {
  async updateUserRole(userId: string, role: Role | "OSTEOPATH"): Promise<User> {
    try {
      // Cast Role to string to avoid type errors
      const { data, error } = await supabase
        .from('User')
        .update({ role: role })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data as User;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  },
  
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*');
        
      if (error) throw new Error(error.message);
      return data as User[];
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
};
