import { User, Role } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { delay, USE_SUPABASE } from "./config";

// Sample data for development
const users: User[] = [];

export const userService = {
  async createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
    if (USE_SUPABASE) {
      try {
        const now = new Date().toISOString();
        
        // Ensure role is correctly typed for the database
        let role: Role = userData.role === 'ADMIN' ? 'ADMIN' : 'OSTEOPATH';
        
        const { data, error } = await supabase
          .from('User')
          .insert({
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: role,
            updated_at: now,
            created_at: now,
            professionalProfileId: userData.professionalProfileId,
            osteopathId: userData.osteopathId
          })
          .select()
          .single();
          
        if (error) throw error;
        return data as User;
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    }
    
    await delay(500);
    const now = new Date().toISOString();
    const newUser = {
      ...userData,
      id: `user-${users.length + 1}`,
      created_at: now,
      updated_at: now,
    } as User;
    
    users.push(newUser);
    return newUser;
  },
  
  async getUserById(id: string): Promise<User | null> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
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
    }
    
    await delay(300);
    return users.find(user => user.id === id) || null;
  },
  
  async updateUser(updates: Partial<User>): Promise<User> {
    if (USE_SUPABASE) {
      try {
        if (!updates.id) {
          throw new Error("User ID is required");
        }
        
        // Ensure role is correctly typed for the database
        const role: Role | undefined = updates.role;
        
        const { data, error } = await supabase
          .from('User')
          .update({
            email: updates.email,
            first_name: updates.first_name,
            last_name: updates.last_name,
            role: role,
            updated_at: new Date().toISOString(),
            professionalProfileId: updates.professionalProfileId,
            osteopathId: updates.osteopathId
          })
          .eq('id', updates.id)
          .select()
          .single();
          
        if (error) throw error;
        return data as User;
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
    
    await delay(300);
    if (!updates.id) {
      throw new Error("User ID is required");
    }
    
    const index = users.findIndex(user => user.id === updates.id);
    if (index === -1) {
      throw new Error(`User with ID ${updates.id} not found`);
    }
    
    users[index] = {
      ...users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    return users[index];
  },
  
  async updateUserRole(userId: string, role: Role): Promise<User> {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase
          .from('User')
          .update({
            role: role,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (error) throw error;
        return data as User;
      } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
      }
    }
    
    await delay(300);
    const index = users.findIndex(user => user.id === userId);
    if (index === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    users[index].role = role;
    users[index].updated_at = new Date().toISOString();
    
    return users[index];
  }
};
