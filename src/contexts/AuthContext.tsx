import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
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
  loadStoredToken: () => void;
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
  loadStoredToken: () => {},
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
  const isAdmin = useMemo(() => authState.user?.role === "ADMIN", [authState.user]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        // Simulation d'une requête d'authentification
        const response = await api.login(email, password);
        
        if (response.token) {
          localStorage.setItem("authState", JSON.stringify(response));
          setAuthState({
            user: response.user,
            isAuthenticated: true,
            token: response.token,
          });
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
          localStorage.setItem("authState", JSON.stringify(response));
          setAuthState({
            user: response.user,
            isAuthenticated: true,
            token: response.token,
          });
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

  const loadStoredToken = useCallback(() => {
    const storedAuthState = localStorage.getItem("authState");
    if (storedAuthState) {
      try {
        const parsedState = JSON.parse(storedAuthState);
        if (parsedState.token) {
          setAuthState({
            user: parsedState.user,
            isAuthenticated: true,
            token: parsedState.token,
          });
        }
      } catch (error) {
        console.error("Error parsing auth state:", error);
        localStorage.removeItem("authState");
      }
    }
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
