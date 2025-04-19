
import { User, Role, AuthState } from "@/types";
import { supabase } from '@/integrations/supabase/client';
import { DEMO_MODE, USE_SUPABASE, delay } from './config';
import { supabaseAuthService } from '../supabase-api/auth-service';
import { toast } from 'sonner';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User | null; token: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        throw new Error(error.message);
      }

      console.log("Login successful:", data);

      if (!data.user) {
        return { user: null, token: null };
      }

      // Get user info from User table
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        throw new Error(userError.message);
      }

      // Créer l'objet User à partir des données de l'authentification et de la table User
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        role: (userData?.role as Role) || 'USER',
        created_at: userData?.created_at || new Date().toISOString(),
        updated_at: userData?.updated_at || new Date().toISOString(),
        professionalProfileId: userData?.professionalProfileId,
        avatar_url: data.user.user_metadata?.avatar_url
      };

      return {
        user,
        token: data.session ? data.session.access_token : null,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async register(userData: { firstName: string; lastName: string; email: string; password: string }): Promise<{ user: User | null; token: string | null }> {
    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      });

      if (authError) {
        console.error("Registration auth error:", authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        console.error("Registration failed - no user returned");
        throw new Error("Registration failed");
      }

      // Create entry in the User table
      const now = new Date().toISOString();
      const { data: userData2, error: userError } = await supabase
        .from("User")
        .insert({
          id: authData.user.id,
          email: authData.user.email || '',
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: 'OSTEOPATH' as Role, // Par défaut, tous les utilisateurs sont des ostéopathes
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (userError) {
        console.error("Error creating user record:", userError);
        // Cleanup the auth user if DB insert fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(userError.message);
      }

      // Créer l'objet User
      const user: User = {
        id: authData.user.id,
        email: authData.user.email || '',
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData2.role as Role,
        created_at: userData2.created_at,
        updated_at: userData2.updated_at,
        professionalProfileId: userData2.professionalProfileId
      };

      return {
        user,
        token: authData.session ? authData.session.access_token : null,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Get auth user
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        throw sessionError;
      }

      if (!sessionData.session?.user) {
        return null;
      }

      // Get user info from User table
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return null;
      }

      // Créer l'objet User
      const user: User = {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email || '',
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        role: userData?.role as Role,
        created_at: userData?.created_at || '',
        updated_at: userData?.updated_at || '',
        professionalProfileId: userData?.professionalProfileId,
        avatar_url: sessionData.session.user.user_metadata?.avatar_url
      };

      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },
  
  async loginWithMagicLink(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Magic link login error:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Magic link login error:", error);
      throw error;
    }
  },
  
  async updateUserProfile(userId: string, updates: { firstName?: string; lastName?: string }): Promise<User> {
    try {
      const { error } = await supabase
        .from("User")
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }

      // Récupérer l'utilisateur mis à jour
      const updatedUser = await this.getCurrentUser();
      if (!updatedUser) {
        throw new Error("Failed to get updated user");
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  async promoteToAdmin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("User")
        .update({
          role: 'ADMIN' as Role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error("Error promoting user to admin:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      throw error;
    }
  }
};
