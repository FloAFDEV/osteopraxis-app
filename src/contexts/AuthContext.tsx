
import React, { createContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, AuthState, User, Role } from "@/types";
import { api } from "@/services/api";
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  loadStoredToken: async () => {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    };
  },
  updateUser: () => {},
  loginWithMagicLink: async () => false,
  isAdmin: false,
  promoteToAdmin: async () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  });

  useEffect(() => {
    const setupAuth = async () => {
      try {
        await loadStoredToken();
      } catch (error) {
        console.error("Error during auth setup:", error);
      }
    };

    setupAuth();
  }, []);

  const loadStoredToken = async (): Promise<AuthState> => {
    try {
      // Récupérer la session utilisateur
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking auth session:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }

      if (!session) {
        console.log("No session found");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }

      // Récupérer les données complètes de l'utilisateur
      const user = await api.getCurrentUser();
      
      if (!user) {
        console.log("Current user not found in database");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }

      console.log("User authenticated:", user);
      const updatedAuthState = {
        user,
        isAuthenticated: true,
        isLoading: false,
        token: session.access_token
      };
      setAuthState(updatedAuthState);
      return updatedAuthState;
    } catch (error) {
      console.error("Error loading stored token:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await api.login(email, password);
      
      if (!user || !token) {
        throw new Error("Login failed: No user or token returned");
      }

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        token
      });
      
      toast.success(`Bienvenue, ${user.first_name || user.email} !`);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Échec de la connexion. Veuillez réessayer.");
      throw error;
    }
  };

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    try {
      await api.loginWithMagicLink(email);
      toast.success(`Un lien de connexion a été envoyé à ${email}`);
      return true;
    } catch (error: any) {
      console.error("Magic link login error:", error);
      toast.error(error.message || "Échec de l'envoi du lien magique. Veuillez réessayer.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
      toast.info("Vous avez été déconnecté");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Échec de la déconnexion. Veuillez réessayer.");
    }
  };

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const { user, token } = await api.register(userData);
      
      if (!user || !token) {
        throw new Error("Registration failed: No user or token returned");
      }
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        token
      });
      
      toast.success(`Bienvenue, ${user.first_name} ! Votre compte a été créé.`);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Échec de l'inscription. Veuillez réessayer.");
      throw error;
    }
  };
  
  const updateUser = (updatedUserData: User) => {
    if (authState.user) {
      setAuthState({
        ...authState,
        user: {
          ...authState.user,
          ...updatedUserData
        }
      });
    }
  };
  
  const promoteToAdmin = async (userId: string) => {
    try {
      await api.promoteToAdmin(userId);
      toast.success("Utilisateur promu administrateur avec succès");
      
      // Si l'utilisateur courant est promu, mettre à jour son état
      if (authState.user && authState.user.id === userId) {
        updateUser({
          ...authState.user,
          role: 'ADMIN'
        });
      }
    } catch (error: any) {
      console.error("Error promoting user to admin:", error);
      toast.error(error.message || "Échec de la promotion. Veuillez réessayer.");
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{
        ...authState,
        login,
        logout,
        register,
        loadStoredToken,
        updateUser,
        loginWithMagicLink,
        isAdmin: authState.user?.role === 'ADMIN',
        promoteToAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
