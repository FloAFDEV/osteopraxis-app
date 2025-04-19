
import { User, Credentials } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("No session found after sign-in");
      }

      const user = data.session.user;
      const token = data.session.access_token;

      if (!user || !token) {
        throw new Error("User or token not found after sign-in");
      }

      // Fetch the complete user profile from the database
      const { data: userProfile, error: userProfileError } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userProfileError) {
        throw userProfileError;
      }

      return { user: userProfile as User, token };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  },

  async loginWithMagicLink(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Login with magic link error:", error);
      throw new Error(error.message || "Failed to send magic link");
    }
  },

  async register(userData: Credentials): Promise<{ user: User; token: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("No session found after registration");
      }

      const user = data.session.user;
      const token = data.session.access_token;

      if (!user || !token) {
        throw new Error("User or token not found after registration");
      }

      // Fetch the complete user profile from the database
      const { data: userProfile, error: userProfileError } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userProfileError) {
        throw userProfileError;
      }

      return { user: userProfile as User, token };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Logout failed");
    }
  },

  async getSession() {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error("getSession error:", error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("No active session found");
        return null;
      }
      
      const userId = session.user.id;
      
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("User not found in database");
          return null;
        }
        throw error;
      }
      
      return data as User;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  },

  async promoteToAdmin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('User')
        .update({
          role: 'ADMIN',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      throw error;
    }
  },
};
