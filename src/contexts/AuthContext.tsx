
import { createContext, useState, useEffect, useContext } from 'react';
import { User, AuthState } from '@/types';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loadStoredToken?: () => Promise<void>;
  loginWithMagicLink?: (email: string) => Promise<boolean>;
  promoteToAdmin?: (userId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  isLoading: true,
  isAdmin: false,
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
        return;
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

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    setAuthState({ ...authState, loading: true, error: null });
    try {
      await api.loginWithMagicLink(email);
      toast.success('Lien de connexion envoyé à votre adresse email.');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du lien magique:', error);
      setAuthState({
        ...authState,
        loading: false,
        error: "Erreur lors de l'envoi du lien. Veuillez réessayer.",
      });
      toast.error("Erreur lors de l'envoi du lien. Veuillez réessayer.");
      return false;
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

  // Add promoteToAdmin function
  const promoteToAdmin = async (userId: string) => {
    try {
      await api.promoteToAdmin(userId);
      toast.success('Utilisateur promu administrateur avec succès');
    } catch (error) {
      console.error('Erreur lors de la promotion en administrateur:', error);
      toast.error('Erreur lors de la promotion en administrateur');
      throw error;
    }
  };

  const isAdmin = authState.user?.role === "ADMIN";
  const isLoading = authState.loading;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        checkAuth,
        loadStoredToken,
        loginWithMagicLink,
        promoteToAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
