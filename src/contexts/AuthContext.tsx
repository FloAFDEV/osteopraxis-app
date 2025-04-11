import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";
import { AuthState, User, Role } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isUserAdmin } from "@/utils/patient-form-helpers";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  promoteToAdmin: (userId: string) => Promise<void>;
  loadStoredToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadStoredToken = async () => {
    try {
      const state = await api.checkAuth();
      setAuthState(state);
      setIsAdmin(isUserAdmin(state.user));
      setIsLoading(false);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const state = await api.login(email, password);
      setAuthState(state);
      setIsAdmin(isUserAdmin(state.user));
      
      // Redirect to complete profile if user doesn't have an osteopathId
      if (state.user && !state.user.osteopathId) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
      
      toast.success("Connexion réussie");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Échec de la connexion: identifiants incorrects");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMagicLink = async (email: string) => {
    try {
      setIsLoading(true);
      await api.loginWithMagicLink(email);
      toast.success("Un lien de connexion a été envoyé à votre adresse email");
    } catch (error) {
      console.error("Magic link sending failed:", error);
      toast.error("Échec de l'envoi du magic link");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      const state = await api.register(email, password, firstName, lastName);
      
      setAuthState(state);
      
      // Si on a un message, c'est qu'il y a besoin de confirmer l'email
      if (state.message) {
        toast.info(state.message);
        navigate("/login");
        return;
      }
      
      setIsAdmin(isUserAdmin(state.user));
      
      if (state.isAuthenticated) {
        // Always redirect to complete profile after registration
        navigate("/complete-profile");
        toast.success("Compte créé avec succès");
      }
    } catch (error: any) {
      console.error("Register failed:", error);
      toast.error(error.message || "Échec de l'inscription");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.logout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        token: null
      });
      setIsAdmin(false);
      navigate("/login");
      toast.info("Vous avez été déconnecté");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      setIsLoading(true);
      await api.promoteToAdmin(userId);
      toast.success("Utilisateur promu en tant qu'administrateur");
      
      // Mettre à jour l'état si l'utilisateur actuel est promu
      if (authState.user && authState.user.id === userId) {
        const updatedUser = {
          ...authState.user,
          role: "ADMIN" as Role
        };
        setAuthState({
          ...authState,
          user: updatedUser
        });
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Promote to admin failed:", error);
      toast.error("Échec de la promotion en administrateur");
    } finally {
      setIsLoading(false);
    }
  };

  // Ajout d'un useEffect pour charger automatiquement le token au démarrage
  useEffect(() => {
    console.log("AuthProvider mounted");
    loadStoredToken().catch(error => {
      console.error("Failed to load auth token at startup:", error);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAdmin,
        isAuthenticated: authState.isAuthenticated,
        isLoading,
        login,
        loginWithMagicLink,
        logout,
        register,
        promoteToAdmin,
        loadStoredToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
