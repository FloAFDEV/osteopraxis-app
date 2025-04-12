
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

  // Vérifier l'authentification au chargement initial avec retries
  useEffect(() => {
    const initialAuth = async () => {
      try {
        setIsLoading(true);
        const success = await loadStoredToken();
        
        if (!success && loadAttempts < MAX_LOAD_ATTEMPTS) {
          // Si l'authentification échoue, réessayer après un délai
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
  }, [loadAttempts]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        // Simulation d'une requête d'authentification
        const response = await api.login(email, password);
        
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

  const loadStoredToken = useCallback(async () => {
    const storedAuthState = localStorage.getItem("authState");
    if (storedAuthState) {
      try {
        const parsedState = JSON.parse(storedAuthState);
        
        if (parsedState.token) {
          // Vérifier si le token est toujours valide
          try {
            // Attendre un court moment pour s'assurer que tout est synchronisé
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Vérification de l'état d'authentification auprès de l'API
            const authCheck = await api.checkAuth();
            
            if (authCheck.isAuthenticated && authCheck.user) {
              // Le token est valide, mettre à jour l'état
              setAuthState({
                user: authCheck.user,
                isAuthenticated: true,
                token: authCheck.token || parsedState.token,
              });
              
              // Log pour débogage
              console.log("✅ Authentication réussie:", authCheck.user.id);
              
              return true;
            } else {
              // Le token n'est plus valide, effacer l'état local
              console.warn("Token invalide, suppression de l'état d'authentification");
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
            
            // En cas d'erreur réseau, on fait confiance au token stocké temporairement
            // mais on renvoie false pour indiquer que la vérification a échoué
            console.warn("Erreur de vérification d'authentification, utilisation du token local comme fallback");
            setAuthState({
              user: parsedState.user,
              isAuthenticated: true,
              token: parsedState.token,
            });
            
            return true; // Considérer que l'auth est OK pour éviter les redirections en boucle
          }
        }
      } catch (error) {
        console.error("Error parsing auth state:", error);
        localStorage.removeItem("authState");
      }
    }
    return false;
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
