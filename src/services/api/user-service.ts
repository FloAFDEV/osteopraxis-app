
import { User, Role } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const userService = {
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('User')
        .insert({
          email: userData.email!,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          role: userData.role || 'OSTEOPATH',
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // Si l'erreur est "Aucune ligne trouvée", retourner null
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as User;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('User')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
};
