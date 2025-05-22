import { User, AuthState } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAuthService } from "../supabase-api/auth-service";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

// Données simulées pour les utilisateurs
const users: User[] = [
  {
    id: "d79c31bc-b1fa-42a2-bbd8-379f03f0d8e9",
    email: "franck.blanchet@example.com",
    first_name: "Franck",
    last_name: "BLANCHET",
    role: "OSTEOPATH",
    created_at: "2024-12-20 22:29:30",
    updated_at: "2024-12-20 22:29:30",
    osteopathId: 1
  }
];

// Variables pour stocker l'état d'authentification
let authState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null
};

export const authService = {
  async register(userData: {
    firstName: string,
    lastName: string,
    email: string,
    password: string
  }): Promise<AuthState> {
    if (USE_SUPABASE) {
      try {
        const response = await supabaseAuthService.register(userData.email, userData.password, userData.firstName, userData.lastName);
        if (response.message) {
          toast.info(response.message);
        }
        return response;
      } catch (error) {
        console.error("Erreur Supabase register:", error);
        toast.error("Erreur lors de l'inscription");
        throw error;
      }
    }
    
    // Fallback: code simulé existant
    await delay(500);
    // Simuler une inscription (démo seulement)
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: "OSTEOPATH",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      osteopathId: users.length + 1
    };
    
    users.push(newUser);
    
    // Créer un token simulé
    const token = "fake-jwt-token-" + Math.random().toString(36).substring(2);
    
    authState = {
      user: newUser,
      isAuthenticated: true,
      token
    };
    
    localStorage.setItem("authState", JSON.stringify(authState));
    
    return authState;
  },
  
  async login(email: string, password: string): Promise<AuthState> {
    if (USE_SUPABASE) {
      console.log("Connexion avec Supabase:", email);
    
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Erreur de connexion Supabase:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Identifiants incorrects");
      }
      
      // Ne pas essayer de créer un profil Ostéopathe automatiquement
      // Vérifier simplement si l'utilisateur en a déjà un
      let osteopathId = null;
      try {
        // Recherche d'un profil Ostéopathe déjà existant
        const { data: osteopathData } = await supabase
          .from("Osteopath")
          .select("id")
          .eq("userId", data.user.id)
          .maybeSingle();
          
        if (osteopathData) {
          osteopathId = osteopathData.id;
          console.log("Profil ostéopathe trouvé:", osteopathId);
        } else {
          console.log("Pas de profil ostéopathe trouvé pour userId:", data.user.id);
        }
      } catch (osteoError) {
        console.error("Erreur lors de la recherche du profil ostéopathe:", osteoError);
      }
      
      const user: User = {
        id: data.user.id,
        email: data.user.email || "",
        first_name: data.user.user_metadata.first_name,
        last_name: data.user.user_metadata.last_name,
        role: (data.user.user_metadata.role || "OSTEOPATH") as any,
        created_at: data.user.created_at,
        updated_at: new Date().toISOString(),
        osteopathId: osteopathId
      };
      
      // L'utilisateur a besoin de configuration s'il n'a pas d'ID d'ostéopathe
      const needsSetup = !user.osteopathId;
      
      authState = {
        user,
        isAuthenticated: true,
        token: data.session?.access_token || null,
        needsProfileSetup: needsSetup
      };
      
      localStorage.setItem("authState", JSON.stringify(authState));
      
      return authState;
    }
    
    // Fallback: code simulé existant
    await delay(500);
    const user = users.find(u => u.email === email);
    
    if (!user || password !== "password") { // Simulation de mot de passe pour démo
      throw new Error("Identifiants incorrects");
    }
    
    const token = "fake-jwt-token-" + Math.random().toString(36).substring(2);
    
    authState = {
      user,
      isAuthenticated: true,
      token,
      needsProfileSetup: false // Par défaut, supposons que le profil est complet dans le mode simulé
    };
    
    localStorage.setItem("authState", JSON.stringify(authState));
    
    return authState;
  },

  async loginWithMagicLink(email: string): Promise<void> {
    if (USE_SUPABASE) {
      try {
        await supabaseAuthService.loginWithMagicLink(email);
        toast.success("Un lien de connexion a été envoyé à votre adresse email. Veuillez vérifier votre boîte mail.", {
          duration: 6000
        });
      } catch (error) {
        console.error("Erreur magic link:", error);
        toast.error("Erreur lors de l'envoi du lien de connexion");
        throw error;
      }
    }
    
    // Fallback: code simulé
    await delay(500);
    console.log(`Magic link envoyé à ${email} (simulation)`);
  },
  
  async logout(): Promise<void> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAuthService.logout();
      } catch (error) {
        console.error("Erreur Supabase logout:", error);
      }
    }
    
    // Fallback: code simulé existant
    await delay(200);
    authState = {
      user: null,
      isAuthenticated: false,
      token: null
    };
    
    localStorage.removeItem("authState");
  },
  
  async checkAuth(): Promise<AuthState> {
    if (USE_SUPABASE) {
      try {
        const { data } = await supabase.auth.getSession();
      
        if (!data.session) {
          return {
            user: null,
            isAuthenticated: false,
            token: null
          };
        }
        
        if (!data.session.user) {
          return {
            user: null,
            isAuthenticated: false,
            token: null
          };
        }
        
        const user: User = {
          id: data.session.user.id,
          email: data.session.user.email || "",
          first_name: data.session.user.user_metadata.first_name,
          last_name: data.session.user.user_metadata.last_name,
          role: (data.session.user.user_metadata.role || "OSTEOPATH") as any,
          created_at: data.session.user.created_at,
          updated_at: new Date().toISOString(),
          osteopathId: data.session.user.user_metadata.osteopathId
        };
        
        // Vérifier si l'utilisateur a déjà un profil d'ostéopathe
        let osteopathId = null;
        try {
          const { data: osteopathData } = await supabase
            .from("Osteopath")
            .select("id")
            .eq("userId", data.session.user.id)
            .maybeSingle();
            
          if (osteopathData) {
            osteopathId = osteopathData.id;
            console.log("Profil ostéopathe trouvé lors du checkAuth:", osteopathId);
          } else {
            console.log("Pas de profil ostéopathe trouvé pour userId:", data.session.user.id);
          }
        } catch (osteoError) {
          console.error("Erreur lors de la recherche du profil ostéopathe:", osteoError);
        }
        
        const updatedUser: User = {
          ...user,
          osteopathId: osteopathId
        };
        
        // L'utilisateur a besoin de configuration s'il n'a pas d'ID d'ostéopathe
        const needsSetup = !user.osteopathId;
        
        return {
          user: updatedUser,
          isAuthenticated: true,
          token: data.session.access_token,
          needsProfileSetup: needsSetup
        };
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        return {
          user: null,
          isAuthenticated: false,
          token: null
        };
      }
    }
    
    // Fallback: code simulé existant
    await delay(100);
    const storedAuth = localStorage.getItem("authState");
    
    if (storedAuth) {
      try {
        authState = JSON.parse(storedAuth);
      } catch (e) {
        console.error("Failed to parse stored auth state", e);
        authState = {
          user: null,
          isAuthenticated: false,
          token: null
        };
      }
    }
    
    return authState;
  },

  async promoteToAdmin(userId: string): Promise<boolean> {
    if (USE_SUPABASE) {
      try {
        return await supabaseAuthService.promoteToAdmin(userId);
      } catch (error) {
        console.error("Erreur Supabase promoteToAdmin:", error);
        throw error;
      }
    }
    
    // Fallback: code simulé
    await delay(300);
    return true;
  }
};
