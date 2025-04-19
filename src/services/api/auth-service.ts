
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

      // Tenter de récupérer le profil utilisateur
      try {
        const { data: userProfile, error: userProfileError } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (userProfileError) {
          console.error("Error fetching user profile:", userProfileError);
          
          // Si l'utilisateur n'existe pas dans la base, créer un profil de base
          if (userProfileError.code === 'PGRST116' || !userProfile) {
            const basicUser = {
              id: user.id,
              email: user.email || '',
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            return { user: basicUser as User, token };
          }
          
          throw userProfileError;
        }

        if (userProfile) {
          return { user: userProfile as User, token };
        } else {
          // Créer un profil de base si aucun n'est trouvé
          const basicUser = {
            id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          return { user: basicUser as User, token };
        }
      } catch (profileError) {
        console.error("Error handling user profile:", profileError);
        
        // Fallback en cas d'erreur
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
          
        if (error) {
          console.error("Erreur lors de la récupération de l'utilisateur:", error);
          
          if (error.code === 'PGRST116') {
            console.log("Aucun utilisateur trouvé avec cet ID");
            
            // Créer un utilisateur de base à partir des données de session
            const basicUser = {
              id: session.user.id,
              email: session.user.email || '',
              first_name: session.user.user_metadata?.first_name || '',
              last_name: session.user.user_metadata?.last_name || '',
              role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            return basicUser as User;
          }
          
          throw error;
        }
        
        if (data) {
          return data as User;
        }
        
        // Si aucun utilisateur n'est trouvé mais qu'il n'y a pas d'erreur
        const basicUser = {
          id: session.user.id,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
          role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
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
          role: 'ADMIN', // Correctly typed now as 'ADMIN'
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
