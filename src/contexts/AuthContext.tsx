
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { User } from "@/types";
import { api } from "@/services/api";
import { supabase } from "@/services/supabase-api/utils";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  message?: string; // Optional message field for auth feedback
}

interface AuthContextType extends AuthState {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  loadStoredToken: () => Promise<boolean>;
  updateUser: (updatedUser: User) => boolean;
  isLoading: boolean;
  loginWithMagicLink: (email: string) => Promise<void>;
  promoteToAdmin: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  token: null,
  isAdmin: false,
  isLoading: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loadStoredToken: async () => false,
  updateUser: () => true,
  loginWithMagicLink: async () => {},
  promoteToAdmin: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const isAdmin = useMemo(() => authState.user?.role === "ADMIN", [authState.user]);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const MAX_LOAD_ATTEMPTS = 3;

  // Define loadStoredToken FIRST
  const loadStoredToken = useCallback(async () => {
    console.log("Tentative de chargement du token stocké...");
    const storedAuthState = localStorage.getItem("authState");
    if (storedAuthState) {
      try {
        console.log("État d'authentification trouvé dans localStorage");
        const parsedState = JSON.parse(storedAuthState);
        
        if (parsedState.token) {
          console.log("Token trouvé dans l'état stocké");
          try {
            if (parsedState.token) {
              console.log("Définition du token dans la session Supabase");
              await supabase.auth.setSession({
                access_token: parsedState.token,
                refresh_token: ""
              });
              console.log("Token défini dans Supabase");
            }
            
            console.log("Attente de synchronisation...");
            await new Promise(resolve => setTimeout(resolve, 500)); // Augmenté à 500ms
            
            console.log("Vérification de l'authentification...");
            const authCheck = await api.checkAuth();
            console.log("Résultat vérification d'auth:", authCheck);
            
            if (authCheck.isAuthenticated && authCheck.user) {
              console.log("Authentification validée par l'API");
              setAuthState({
                user: authCheck.user,
                isAuthenticated: true,
                token: authCheck.token || parsedState.token,
              });
              
              console.log("✅ Authentication réussie:", authCheck.user.id);
              
              // Vérifier l'état de la session Supabase
              const { data: session } = await supabase.auth.getSession();
              console.log("Session Supabase après vérification:", session?.session ? "Valide" : "Invalide");
              
              return true;
            } else {
              console.warn("Token invalidé par l'API, suppression de l'état d'authentification");
              localStorage.removeItem("authState");
              setAuthState({
                user: null,
                isAuthenticated: false,
                token: null,
              });
              return false;
            }
          } catch (error) {
            console.error("Error checking auth:", error);
            
            // Dernier recours: tenter une connexion directe avec Supabase
            try {
              console.log("Tentative de récupération directe de la session Supabase...");
              const { data: supabaseSession } = await supabase.auth.getSession();
              
              if (supabaseSession?.session) {
                console.log("Session Supabase trouvée directement:", supabaseSession.session.user.id);
                // Utilisez la session Supabase et mettez à jour l'état local
                return true;
              }
            } catch (supabaseError) {
              console.error("Erreur lors de la récupération directe de la session Supabase:", supabaseError);
            }
            
            console.warn("Erreur de vérification d'authentification, utilisation du token local comme fallback");
            setAuthState({
              user: parsedState.user,
              isAuthenticated: true,
              token: parsedState.token,
            });
            
            return true;
          }
        } else {
          console.log("Aucun token trouvé dans l'état stocké");
        }
      } catch (error) {
        console.error("Error parsing auth state:", error);
        localStorage.removeItem("authState");
      }
    } else {
      console.log("Aucun état d'authentification trouvé dans localStorage");
    }
    return false;
  }, []);

  // Then use useEffect with loadStoredToken
  useEffect(() => {
    const initialAuth = async () => {
      try {
        console.log(`Tentative d'authentification initiale (${loadAttempts + 1}/${MAX_LOAD_ATTEMPTS})...`);
        setIsLoading(true);
        const success = await loadStoredToken();
        console.log("Résultat de la tentative:", success ? "Succès" : "Échec");
        
        if (!success && loadAttempts < MAX_LOAD_ATTEMPTS) {
          console.log(`Tentative d'authentification ${loadAttempts + 1}/${MAX_LOAD_ATTEMPTS} échouée, nouvel essai dans 1s...`);
          setTimeout(() => setLoadAttempts(prev => prev + 1), 1000);
          return;
        }
      } catch (error) {
        console.error("Error during initial auth check:", error);
      } finally {
        setIsLoading(false);
        setInitialCheckDone(true);
      }
    };

    initialAuth();
  }, [loadAttempts, loadStoredToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        console.log("Tentative de connexion avec:", email);
        setIsLoading(true);
        // Simulation d'une requête d'authentification
        const response = await api.login(email, password);
        
        if (response.token) {
          console.log("Connexion réussie, token reçu");
          const authData = {
            user: response.user,
            isAuthenticated: true,
            token: response.token,
          };
          
          localStorage.setItem("authState", JSON.stringify(authData));
          setAuthState(authData);
          
          // Définir également la session dans Supabase
          if (response.token) {
            console.log("Configuration de la session Supabase avec le token");
            await supabase.auth.setSession({
              access_token: response.token,
              refresh_token: ""
            });
          }
          
          // Forcer un court délai pour s'assurer que l'état est bien mis à jour
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return true;
        }
        console.log("Échec de connexion: pas de token reçu");
        return false;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loginWithMagicLink = useCallback(
    async (email: string) => {
      try {
        setIsLoading(true);
        await api.loginWithMagicLink(email);
        // Note: We don't set auth state here as the user will need to click the link in their email
      } catch (error) {
        console.error("Magic link error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (userData: { 
      firstName: string; 
      lastName: string; 
      email: string; 
      password: string; 
    }) => {
      try {
        setIsLoading(true);
        const response = await api.register(userData);
        
        if (response.token) {
          const authData = {
            user: response.user,
            isAuthenticated: true,
            token: response.token,
          };
          
          localStorage.setItem("authState", JSON.stringify(authData));
          setAuthState(authData);
          
          // Forcer un court délai pour s'assurer que l'état est bien mis à jour
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return true;
        }
        return false;
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("authState");
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: null,
    });
    api.logout();
  }, []);

  
  
  const updateUser = useCallback((updatedUser: User) => {
    setAuthState((prev) => {
      const newState = {
        ...prev,
        user: updatedUser,
      };
      
      // Update localStorage
      localStorage.setItem("authState", JSON.stringify(newState));
      
      return newState;
    });
    
    return true;
  }, []);

  const promoteToAdmin = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const result = await api.promoteToAdmin(userId);
      return result;
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ 
        ...authState, 
        isAdmin, 
        login, 
        register, 
        logout, 
        loadStoredToken,
        updateUser,
        isLoading,
        loginWithMagicLink,
        promoteToAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
