/**
 * 🔐 Service d'authentification simplifié
 * 
 * Utilise directement Supabase Auth sans condition USE_SUPABASE
 * Architecture hybride : Auth toujours en cloud, données selon classification HDS
 */

import { User, AuthState } from "@/types";
import { delay } from "./config";
import { toast } from "sonner";
import { supabaseAuthService } from "../supabase-api/auth-service";

export const authService = {
  async register(userData: {
    firstName: string,
    lastName: string,
    email: string,
    password: string
  }): Promise<AuthState> {
    try {
      const response = await supabaseAuthService.register(
        userData.email, 
        userData.password, 
        userData.firstName, 
        userData.lastName
      );
      if (response.message) {
        toast.info(response.message);
      }
      return response;
    } catch (error) {
      console.error("Erreur register:", error);
      toast.error("Erreur lors de l'inscription");
      throw error;
    }
  },
  
  async login(email: string, password: string): Promise<AuthState> {
    try {
      console.log("🔐 Connexion utilisateur via Supabase Auth");
      const authResult = await supabaseAuthService.login(email, password);
      console.log("✅ Connexion réussie:", authResult);
      return authResult;
    } catch (error) {
      console.error("❌ Erreur login:", error);
      
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
  },

  async loginWithMagicLink(email: string): Promise<void> {
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
  },
  
  async logout(): Promise<void> {
    try {
      return await supabaseAuthService.logout();
    } catch (error) {
      console.error("Erreur logout:", error);
      // Ne pas bloquer la déconnexion locale
    }
  },
  
  async checkAuth(): Promise<AuthState> {
    try {
      console.log("🔍 Vérification de l'authentification via Supabase");
      const result = await supabaseAuthService.checkAuth();
      console.log("✅ État d'authentification:", result);
      return result;
    } catch (error) {
      console.error("❌ Erreur checkAuth:", error);
      return {
        user: null,
        isAuthenticated: false,
        token: null
      };
    }
  },

  async promoteToAdmin(userId: string): Promise<boolean> {
    try {
      return await supabaseAuthService.promoteToAdmin(userId);
    } catch (error) {
      console.error("Erreur promoteToAdmin:", error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<any> {
    try {
      const authState = await supabaseAuthService.checkAuth();
      return authState.user;
    } catch (error) {
      console.error("Erreur getCurrentUser:", error);
      return null;
    }
  }
};