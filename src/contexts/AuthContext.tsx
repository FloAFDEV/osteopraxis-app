
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { AuthState, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  register: (userData: { firstName: string; lastName: string; email: string; password: string; }) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });
  const navigate = useNavigate();
  
  // Cette fonction sera appelée au chargement initial de l'application
  const loadStoredToken = async () => {
    try {
      console.log("Récupération de la session stockée...");
      const session = await api.getSession();
      
      if (session && session.user) {
        console.log("Session trouvée:", session.user);
        
        // Vérifier si l'utilisateur existe dans notre base de données
        const authResult = await api.checkAuth();
        
        if (authResult && authResult.user) {
          console.log("Utilisateur authentifié:", authResult.user);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: authResult.user
          });
          return;
        }
      } 
      
      // Si on arrive ici, c'est qu'aucune session valide n'a été trouvée
      console.log("Aucune session valide trouvée");
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      
    } catch (error) {
      console.error("Erreur lors de la récupération de la session:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
    }
  };
  
  // Login
  const login = async (email: string, password: string) => {
    try {
      console.log("Tentative de connexion pour:", email);
      const authResult = await api.login(email, password);
      
      if (!authResult.isAuthenticated || !authResult.user) {
        console.error("Échec de l'authentification");
        throw new Error("Échec de l'authentification");
      }
      
      console.log("Connexion réussie:", authResult);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: authResult.user,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      toast.error("Identifiants incorrects");
      throw error;
    }
  };
  
  // Login avec lien magique
  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    try {
      console.log("Envoi d'un lien magique à:", email);
      const success = await api.loginWithMagicLink(email);
      
      if (success) {
        toast.success("Un lien de connexion a été envoyé à votre adresse email");
        return true;
      } else {
        throw new Error("Échec de l'envoi du lien magique");
      }
    } catch (error) {
      console.error("Erreur d'envoi du lien magique:", error);
      toast.error("Erreur lors de l'envoi du lien. Veuillez réessayer.");
      return false;
    }
  };
  
  // Register
  const register = async (userData: { firstName: string; lastName: string; email: string; password: string; }) => {
    try {
      console.log("Tentative d'inscription pour:", userData.email);
      const authResult = await api.register(userData);
      
      if (!authResult.isAuthenticated || !authResult.user) {
        console.error("Échec de l'enregistrement");
        throw new Error("Échec de l'enregistrement");
      }
      
      console.log("Inscription réussie:", authResult);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: authResult.user
      });
      
      // Créer automatiquement un profil d'ostéopathe pour l'utilisateur
      navigate('/profile/setup');
      
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      throw error;
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await api.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      navigate('/login');
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };
  
  // Mettre à jour les données utilisateur
  const updateUser = (userData: User) => {
    setAuthState(prevState => ({
      ...prevState,
      user: userData
    }));
  };
  
  useEffect(() => {
    // Écouteur d'événements d'authentification Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Événement d'authentification Supabase:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("Utilisateur connecté, obtention des données utilisateur");
          try {
            const authResult = await api.checkAuth();
            if (authResult && authResult.user) {
              console.log("Données utilisateur récupérées:", authResult.user);
              setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user: authResult.user
              });
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données utilisateur:", error);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("Utilisateur déconnecté");
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null
          });
        }
      }
    );

    // Effet initial pour charger l'état d'authentification
    loadStoredToken();
    
    // Nettoyage de l'écouteur à la destruction du composant
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        user: authState.user,
        login,
        loginWithMagicLink,
        register,
        logout,
        loadStoredToken,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
