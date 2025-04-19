
import { User, AuthState } from "@/types";
import { supabase } from "./utils";

export const supabaseAuthService = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async signUp(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
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

      // Create an entry in the User table if sign up was successful
      if (data.user) {
        // Check if user already exists in the User table
        const { data: existingUser } = await supabase
          .from("User")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!existingUser) {
          const { error: userError } = await supabase
            .from("User")
            .insert({
              id: data.user.id,
              email: userData.email,
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: "USER",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (userError) {
            console.error("Error creating user record:", userError);
            // Continue anyway, as the auth record is created
          }
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return;
    } catch (error) {
      throw error;
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    } catch (error) {
      throw error;
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data as User;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw error;
    }
  },

  async signInWithMagicLink(email: string) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw error;
    }
  },
};
