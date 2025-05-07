import { User, AuthState } from "@/types";
import { delay, USE_SUPABASE } from "./config";
import { supabaseAuthService } from "../supabase-api/auth-service";
import { toast } from "sonner";

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
      try {
        return await supabaseAuthService.login(email, password);
      } catch (error) {
        console.error("Erreur Supabase login:", error);
        
        // Messages d'erreur spécifiques
        if (error.message?.includes("Invalid login credentials")) {
          toast.error("Identifiants incorrects");
        } else if (error.message?.includes("Email not confirmed")) {
          toast.error("Email non confirmé. Veuillez vérifier votre boîte mail.");
        } else {
          toast.error("Erreur lors de la connexion");
        }
        throw error;
      }
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
      token
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
        return await supabaseAuthService.checkAuth();
      } catch (error) {
        console.error("Erreur Supabase checkAuth:", error);
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
