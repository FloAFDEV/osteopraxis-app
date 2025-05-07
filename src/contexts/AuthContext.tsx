
import { createContext, useState, useEffect, useContext } from 'react';
import { User, AuthState } from '@/types';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
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
  isLoading: true,
  error: null,
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
    isLoading: true,
    isAdmin: false,
    token: null,
    error: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      const result = await api.login(email, password);
      if (result && result.user) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          isLoading: false,
          isAdmin: result.user.role === 'ADMIN',
          token: result.token,
          error: null,
        });
        toast.success('Connexion réussie!');
        navigate('/dashboard');
        return;
      } else {
        setAuthState({
          ...authState,
          isLoading: false,
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
        isLoading: false,
        isAdmin: false,
        token: null,
        error: "Erreur lors de la connexion. Veuillez réessayer.",
      });
      toast.error("Erreur lors de la connexion. Veuillez réessayer.");
    }
  };

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      await api.loginWithMagicLink(email);
      toast.success('Lien de connexion envoyé à votre adresse email.');
      setAuthState({ ...authState, isLoading: false });
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du lien magique:', error);
      setAuthState({
        ...authState,
        isLoading: false,
        error: "Erreur lors de l'envoi du lien. Veuillez réessayer.",
      });
      toast.error("Erreur lors de l'envoi du lien. Veuillez réessayer.");
      return false;
    }
  };

  const register = async (userData: any) => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      const result = await api.register(userData.email, userData.password);
      if (result && result.user) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          isLoading: false,
          isAdmin: result.user.role === 'ADMIN',
          token: result.token,
          error: null,
        });
        toast.success('Inscription réussie!');
        navigate('/dashboard');
      } else {
        setAuthState({
          ...authState,
          isLoading: false,
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
        isLoading: false,
        isAdmin: false,
        token: null,
        error: "Erreur lors de l'inscription. Veuillez réessayer.",
      });
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
    }
  };

  const logout = async () => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      await api.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isAdmin: false,
        token: null,
        error: null,
      });
      navigate('/login');
      toast.success('Déconnexion réussie.');
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      setAuthState({
        ...authState,
        isLoading: false,
        error: "Erreur lors de la déconnexion. Veuillez réessayer.",
      });
      toast.error("Erreur lors de la déconnexion. Veuillez réessayer.");
    }
  };

  const checkAuth = async () => {
    setAuthState({ ...authState, isLoading: true, error: null });
    try {
      const user = await api.checkAuth();
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user: user,
          isLoading: false,
          isAdmin: user.role === 'ADMIN',
          token: localStorage.getItem('auth_token'), // Assumer que le token est stocké dans localStorage
          error: null,
        });
      } else {
        setAuthState({
          ...authState,
          isAuthenticated: false,
          user: null,
          isLoading: false,
          isAdmin: false,
          token: null,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setAuthState({
        ...authState,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isAdmin: false,
        token: null,
        error: "Erreur lors de la vérification de l'authentification.",
      });
    }
  };

  // Fonction pour charger le token stocké
  const loadStoredToken = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const user = await api.checkAuth();
        if (user) {
          setAuthState({
            isAuthenticated: true,
            user: user,
            isLoading: false,
            isAdmin: user.role === 'ADMIN',
            token: token,
            error: null,
          });
        } else {
          // Token invalide ou expiré
          localStorage.removeItem('auth_token');
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            isAdmin: false,
            token: null,
            error: null,
          });
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          isAdmin: false,
          token: null,
          error: "Erreur lors de la validation du token stocké.",
        });
      }
    } else {
      setAuthState({
        ...authState,
        isLoading: false,
      });
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      await api.promoteToAdmin(userId);
      toast.success("Utilisateur promu administrateur avec succès");
      checkAuth(); // Rafraîchir les données utilisateur
    } catch (error) {
      console.error("Erreur lors de la promotion au statut d'administrateur:", error);
      toast.error("Erreur lors de la promotion au statut d'administrateur");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        isLoading: authState.isLoading,
        error: authState.error || null,
        isAdmin: authState.isAdmin,
        login,
        register,
        logout,
        checkAuth,
        loadStoredToken,
        loginWithMagicLink,
        promoteToAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
