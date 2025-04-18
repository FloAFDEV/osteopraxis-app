
import { AuthState } from "@/types";
import { USE_SUPABASE } from "./config";
import { supabaseAuthService } from "../supabase-api/auth-service";

export const authService = {
  async register(userData: {
    firstName: string,
    lastName: string,
    email: string,
    password: string
  }): Promise<AuthState> {
    if (!USE_SUPABASE) {
      throw new Error("Supabase is required for authentication");
    }
    
    try {
      return await supabaseAuthService.register(userData.email, userData.password, userData.firstName, userData.lastName);
    } catch (error) {
      console.error("Erreur Supabase register:", error);
      throw error;
    }
  },
  
  async login(email: string, password: string): Promise<AuthState> {
    if (!USE_SUPABASE) {
      throw new Error("Supabase is required for authentication");
    }
    
    try {
      return await supabaseAuthService.login(email, password);
    } catch (error) {
      console.error("Erreur Supabase login:", error);
      throw error;
    }
  },
  
  async loginWithMagicLink(email: string): Promise<void> {
    if (!USE_SUPABASE) {
      throw new Error("Supabase is required for authentication");
    }
    
    try {
      return await supabaseAuthService.loginWithMagicLink(email);
    } catch (error) {
      console.error("Erreur Supabase magic link:", error);
      throw error;
    }
  },
  
  async logout(): Promise<void> {
    if (!USE_SUPABASE) {
      throw new Error("Supabase is required for authentication");
    }
    
    try {
      return await supabaseAuthService.logout();
    } catch (error) {
      console.error("Erreur Supabase logout:", error);
      throw error;
    }
  },
  
  async checkAuth(): Promise<AuthState> {
    if (!USE_SUPABASE) {
      throw new Error("Supabase is required for authentication");
    }
    
    try {
      return await supabaseAuthService.checkAuth();
    } catch (error) {
      console.error("Erreur Supabase checkAuth:", error);
      throw error;
    }
  },

  async promoteToAdmin(userId: string): Promise<boolean> {
    if (!USE_SUPABASE) {
      throw new Error("Supabase is required for authentication");
    }
    
    try {
      return await supabaseAuthService.promoteToAdmin(userId);
    } catch (error) {
      console.error("Erreur Supabase promoteToAdmin:", error);
      throw error;
    }
  }
};
