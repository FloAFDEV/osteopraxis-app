import { AuthState, Role, User } from "@/types";
import { supabaseAuthService } from "../supabase-api/auth-service";
import { supabase } from "@/integrations/supabase/client";

export const authService = {
  // Fonction pour obtenir la session actuelle
  async getSession(): Promise<AuthState> {
    if (process.env.NODE_ENV !== "production") {
      console.log("Récupération de la session stockée...");
    }
    
    try {
      // Tente de récupérer l'état d'authentification depuis le localStorage
      const storedAuth = localStorage.getItem("authState");
      
      // Si un état d'authentification existe en local storage
      if (storedAuth) {
        const authState = JSON.parse(storedAuth) as AuthState;
        
        // Vérifie que l'utilisateur et le token existent
        if (authState.user && authState.token) {
          return { ...authState };
        }
      }
      
      // Si pas d'état stocké ou état incomplet, tente de récupérer la session depuis Supabase
      console.log("Récupération de la session depuis Supabase");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }
      
      // Si une session existe, récupérer les données complètes de l'utilisateur
      if (data.session) {
        // Récupérer les données de l'utilisateur depuis la table User
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (userError) {
          console.error("Erreur lors de la récupération des données utilisateur:", userError);
          // Continuer avec les données minimales de l'utilisateur depuis auth
          const minimalUser: User = {
            id: data.session.user.id,
            email: data.session.user.email || "",
            first_name: "",
            last_name: "",
            role: "USER" as Role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          return {
            user: minimalUser,
            isAuthenticated: true,
            isLoading: false,
            token: data.session.access_token
          };
        }
        
        return {
          user: userData as User,
          isAuthenticated: true,
          isLoading: false,
          token: data.session.access_token
        };
      }
      
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
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
  
  // Fonction pour vérifier l'authentification actuelle
  async checkAuth(): Promise<AuthState> {
    return await this.getSession();
  },
  
  // Fonction pour connecter un utilisateur
  async login(email: string, password: string): Promise<AuthState> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Erreur lors de la connexion:", error);
        throw error;
      }
      
      // Si la connexion réussit, récupérer les données complètes de l'utilisateur
      if (data.session) {
        // Récupérer les données de l'utilisateur depuis la table User
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (userError) {
          console.error("Erreur lors de la récupération des données utilisateur:", userError);
          // Continuer avec les données minimales de l'utilisateur
          const minimalUser: User = {
            id: data.session.user.id,
            email: data.session.user.email || "",
            first_name: userData.firstName || "",
            last_name: userData.lastName || "",
            role: "USER" as Role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const authState: AuthState = {
            user: minimalUser,
            isAuthenticated: true,
            isLoading: false,
            token: data.session.access_token
          };
          
          // Stocker l'état d'authentification dans le localStorage
          localStorage.setItem("authState", JSON.stringify(authState));
          
          return authState;
        }
        
        const authState: AuthState = {
          user: userData as User,
          isAuthenticated: true,
          isLoading: false,
          token: data.session.access_token
        };
        
        // Stocker l'état d'authentification dans le localStorage
        localStorage.setItem("authState", JSON.stringify(authState));
        
        return authState;
      }
      
      throw new Error("La connexion a échoué");
      
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  },
  
  // Fonction pour déconnecter un utilisateur
  async logout(): Promise<AuthState> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
        throw error;
      }
      
      // Réinitialiser l'état d'authentification local
      localStorage.removeItem("authState");
      
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
      
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  },
  
  // Fonction pour inscrire un nouvel utilisateur
  async register(userData: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthState> {
    try {
      // Créer l'utilisateur dans Auth
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
      
      if (error) {
        console.error("Erreur lors de l'inscription:", error);
        throw error;
      }
      
      // Si l'inscription réussit et renvoie une session
      if (data.session) {
        const now = new Date().toISOString();
        // Créer l'entrée dans la table User
        const { error: userError } = await supabase
          .from('User')
          .insert({
            id: data.user?.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: "USER",
            created_at: now,
            updated_at: now
          });
        
        if (userError) {
          console.error("Erreur lors de la création de l'utilisateur:", userError);
          
          // Si erreur dans la création de l'utilisateur, continuer avec les données minimales
          const minimalUser: User = {
            id: data.user?.id || "",
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: "USER" as Role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const authState: AuthState = {
            user: minimalUser,
            isAuthenticated: true,
            isLoading: false,
            token: data.session.access_token
          };
          
          // Stocker l'état d'authentification dans le localStorage
          localStorage.setItem("authState", JSON.stringify(authState));
          
          return authState;
        }
        
        // Utilisateur créé avec succès
        const user: User = {
          id: data.user?.id || "",
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: "USER" as Role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const authState: AuthState = {
          user,
          isAuthenticated: true,
          isLoading: false,
          token: data.session.access_token
        };
        
        // Stocker l'état d'authentification dans le localStorage
        localStorage.setItem("authState", JSON.stringify(authState));
        
        return authState;
      }
      
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
      
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  },
  
  // Fonction pour se connecter avec un lien magique envoyé par email
  async loginWithMagicLink(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error("Erreur lors de l'envoi du lien magique:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'envoi du lien magique:", error);
      throw error;
    }
  }
};
