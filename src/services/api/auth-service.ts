
import { User, AuthState, Role } from "@/types";
import { supabaseAuthService } from "../supabase-api/auth-service";
import { supabase } from '@/integrations/supabase/client';

// Mock data for the auth service when using mocks
const mockUsers: User[] = [
  {
    id: "1",
    email: "test@example.com",
    first_name: "Test",
    last_name: "User",
    role: "USER",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const authService = {
  async login(email: string, password: string): Promise<AuthState> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        // Récupérer les informations utilisateur depuis la base de données
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) console.error("Erreur lors de la récupération des données utilisateur:", userError);
        
        const user: User = {
          id: data.user.id,
          email: data.user.email || "",
          first_name: userData?.first_name || data.user.user_metadata?.first_name,
          last_name: userData?.last_name || data.user.user_metadata?.last_name,
          role: userData?.role || "USER",
          professionalProfileId: userData?.professionalProfileId,
          created_at: userData?.created_at || data.user.created_at,
          updated_at: userData?.updated_at || data.user.updated_at,
          avatar_url: data.user.user_metadata?.avatar_url
        };
        
        return {
          user,
          isAuthenticated: true,
          isLoading: false,
          token: data.session?.access_token
        };
      }
      
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
    } catch (error) {
      console.error("Erreur de connexion:", error);
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
    }
  },
  
  async register(userData: { firstName: string; lastName: string; email: string; password: string; }): Promise<AuthState> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });
      
      if (error) throw error;
      
      if (data && data.user) {
        // Créer l'entrée utilisateur dans notre table personnalisée
        const { error: userError } = await supabase
          .from('User')
          .insert({
            id: data.user.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: "USER",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (userError) {
          console.error("Erreur lors de la création de l'utilisateur:", userError);
          throw userError;
        }
        
        const user: User = {
          id: data.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: "USER",
          created_at: data.user.created_at,
          updated_at: data.user.created_at
        };
        
        return {
          user,
          isAuthenticated: true,
          isLoading: false,
          token: data.session?.access_token
        };
      }
      
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    }
  },
  
  async loginWithMagicLink(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard"
        }
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Erreur d'envoi du lien magique:", error);
      return false;
    }
  },
  
  async getSession(): Promise<any> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        return null;
      }
      
      return data.session;
    } catch (error) {
      console.error("Erreur lors de la récupération de la session:", error);
      return null;
    }
  },
  
  async checkAuth(): Promise<AuthState> {
    try {
      // Récupérer la session Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }
      
      // Récupérer les informations utilisateur depuis la base de données
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
        
      if (userError) {
        console.error("Erreur lors de la récupération des données utilisateur:", userError);
      }
      
      const user: User = {
        id: data.session.user.id,
        email: data.session.user.email || "",
        first_name: userData?.first_name || data.session.user.user_metadata?.first_name,
        last_name: userData?.last_name || data.session.user.user_metadata?.last_name,
        role: userData?.role || "USER",
        professionalProfileId: userData?.professionalProfileId,
        created_at: userData?.created_at || data.session.user.created_at,
        updated_at: userData?.updated_at || data.session.user.updated_at,
        avatar_url: data.session.user.user_metadata?.avatar_url
      };
      
      return {
        user,
        isAuthenticated: true,
        isLoading: false,
        token: data.session.access_token
      };
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
    }
  },
  
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  }
};
