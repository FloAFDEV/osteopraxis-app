
import { createContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loadStoredToken?: () => Promise<void>; // Added to fix the issue in App.tsx
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState({ ...authState, loading: true, error: null });
    try {
      const user = await api.login(email, password);
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user: user,
          loading: false,
          error: null,
        });
        toast.success('Connexion réussie!');
        navigate('/dashboard');
      } else {
        setAuthState({
          ...authState,
          loading: false,
          error: 'Identifiants invalides.',
        });
        toast.error('Identifiants invalides.');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setAuthState({
        ...authState,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: "Erreur lors de la connexion. Veuillez réessayer.",
      });
      toast.error("Erreur lors de la connexion. Veuillez réessayer.");
    }
  };

  const register = async (userData: any) => {
    setAuthState({ ...authState, loading: true, error: null });
    try {
      const user = await api.register(userData);
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user: user,
          loading: false,
          error: null,
        });
        toast.success('Inscription réussie!');
        navigate('/dashboard');
      } else {
        setAuthState({
          ...authState,
          loading: false,
          error: 'Erreur lors de l\'inscription.',
        });
        toast.error('Erreur lors de l\'inscription.');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      setAuthState({
        ...authState,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: "Erreur lors de l'inscription. Veuillez réessayer.",
      });
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
    }
  };

  const logout = async () => {
    setAuthState({ ...authState, loading: true, error: null });
    try {
      await api.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      navigate('/login');
      toast.success('Déconnexion réussie.');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      setAuthState({
        ...authState,
        loading: false,
        error: "Erreur lors de la déconnexion. Veuillez réessayer.",
      });
      toast.error("Erreur lors de la déconnexion. Veuillez réessayer.");
    }
  };

  const checkAuth = async () => {
    setAuthState({ ...authState, loading: true, error: null });
    try {
      const user = await api.checkAuth();
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user: user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          ...authState,
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setAuthState({
        ...authState,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: "Erreur lors de la vérification de l'authentification.",
      });
    }
  };

  // Add loadStoredToken function to fix the issue in App.tsx
  const loadStoredToken = async () => {
    try {
      const storedAuth = localStorage.getItem('authState');
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth && parsedAuth.token) {
          // Validate the stored token
          const user = await api.checkAuth();
          if (user) {
            setAuthState({
              isAuthenticated: true,
              user,
              loading: false,
              error: null,
            });
            return;
          }
        }
      }
      
      // If no valid stored token is found
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading stored token:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        login,
        register,
        logout,
        checkAuth,
        loadStoredToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook directly from here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Missing import
import { useContext } from 'react';
