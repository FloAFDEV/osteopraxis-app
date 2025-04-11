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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  token: null,
  isAdmin: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loadStoredToken: () => {},
  updateUser: () => true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null,
  });
  const isAdmin = useMemo(() => authState.user?.role === "ADMIN", [authState.user]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
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

  return (
    <AuthContext.Provider
      value={{ 
        ...authState, 
        isAdmin, 
        login, 
        register, 
        logout, 
        loadStoredToken,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
