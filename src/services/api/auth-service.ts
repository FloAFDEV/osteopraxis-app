
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

      try {
        const { data: userProfile, error: userProfileError } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (userProfileError && userProfileError.code !== 'PGRST116') {
          console.error("Error fetching user profile:", userProfileError);
          throw userProfileError;
        }

        if (userProfile) {
          return { user: userProfile as User, token };
        }
        
        // Si l'utilisateur n'a pas de profil, créer un profil de base
        const basicUser = {
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Essayer d'insérer le profil utilisateur
        try {
          const { error: insertError } = await supabase
            .from('User')
            .insert([basicUser]);
            
          if (insertError) {
            console.error("Error creating user profile:", insertError);
          }
        } catch (err) {
          console.error("Error during profile creation:", err);
        }
        
        return { user: basicUser as User, token };
      } catch (profileError) {
        console.error("Error handling user profile:", profileError);
        
        const basicUser = {
          id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH"
        };
        
        return { user: basicUser as User, token };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  },

  async loginWithMagicLink(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

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
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("No user found after registration");
      }

      // Créer l'entrée utilisateur dans la table User
      const userRecord = {
        id: data.user.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      try {
        const { error: profileError } = await supabase
          .from('User')
          .insert([userRecord]);

        if (profileError) {
          console.error("Error creating user profile:", profileError);
        }
      } catch (err) {
        console.error("Error inserting user record:", err);
      }

      // Si une session est disponible, retourner le token
      if (data.session) {
        return { 
          user: userRecord as User, 
          token: data.session.access_token 
        };
      }
      
      // Sinon, retourner juste l'utilisateur
      return { 
        user: userRecord as User, 
        token: '' 
      };
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
        console.log("Pas de session active");
        return null;
      }
      
      const userId = session.user.id;
      
      try {
        const { data, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error("Erreur lors de la récupération de l'utilisateur:", error);
          throw error;
        }
        
        if (data) {
          return data as User;
        }
        
        // Créer un utilisateur de base si aucun n'est trouvé
        const basicUser = {
          id: session.user.id,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
          role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Tenter de créer l'entrée utilisateur
        try {
          const { error: insertError } = await supabase
            .from('User')
            .insert([basicUser]);
            
          if (insertError) {
            console.error("Error creating user entry:", insertError);
          }
        } catch (err) {
          console.error("Failed to create user entry:", err);
        }
        
        return basicUser as User;
      } catch (error) {
        console.error("Erreur lors de la requête utilisateur:", error);
        
        // Fallback en cas d'erreur
        const basicUser = {
          id: session.user.id,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
          role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH"
        };
        
        return basicUser as User;
      }
    } catch (error) {
      console.error("Erreur inattendue lors de la récupération de l'utilisateur:", error);
      return null;
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
