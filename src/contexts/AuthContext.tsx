
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthState, User, AuthContextType } from '@/types';
import { api } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: undefined
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => { throw new Error('Not implemented'); },
  loginWithMagicLink: async () => false,
  register: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); },
  loadStoredToken: async () => { throw new Error('Not implemented'); },
  updateUser: () => { throw new Error('Not implemented'); },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);
  
  // Définir si l'utilisateur est admin
  const isAdmin = authState.user?.role === 'ADMIN';
  
  useEffect(() => {
    // Configurer l'écouteur d'événement d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Événement d'authentification Supabase:", event, session?.user?.id);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("Utilisateur connecté, obtention des données utilisateur");
          try {
            // Charger l'utilisateur depuis la table User
            if (session?.user?.id) {
              const { data: userData, error } = await supabase
                .from('User')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (!error && userData) {
                setAuthState({
                  isAuthenticated: true,
                  isLoading: false,
                  user: userData as User,
                  token: session.access_token
                });
                
                // Stocker l'état d'authentification
                localStorage.setItem('authState', JSON.stringify({
                  isAuthenticated: true,
                  isLoading: false,
                  user: userData,
                  token: session.access_token
                }));
              }
            }
          } catch (error) {
            console.error("Erreur lors de l'obtention des données utilisateur:", error);
          }
        }
        
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('authState');
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null
          });
        }
      }
    );
    
    // Vérifier le token stocké au chargement initial
    loadStoredToken();
    
    // Nettoyage à la désinscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const loadStoredToken = async () => {
    console.log("Chargement de la session stockée...");
    try {
      const authState = await api.getSession();
      setAuthState(authState);
      return authState;
    } catch (error) {
      console.error("Erreur lors du chargement du token:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      throw error;
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      const authState = await api.login(email, password);
      setAuthState(authState);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      let errorMessage = "Une erreur est survenue lors de la tentative de connexion.";
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "Identifiants incorrects. Veuillez vérifier votre email et mot de passe.";
            break;
          case "Email not confirmed":
            errorMessage = "Votre email n'a pas été confirmé. Veuillez vérifier votre boîte de réception.";
            break;
          default:
            errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const register = async (userData: { firstName: string; lastName: string; email: string; password: string; }) => {
    try {
      const authState = await api.register(userData);
      setAuthState(authState);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      let errorMessage = "Une erreur est survenue lors de l'inscription.";
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        switch (error.message) {
          case "User already registered":
            errorMessage = "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.";
            break;
          default:
            errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };
  
  const loginWithMagicLink = async (email: string) => {
    try {
      const success = await api.loginWithMagicLink(email);
      return success;
    } catch (error) {
      console.error("Erreur lors de l'envoi du lien magique:", error);
      toast.error("Erreur lors de l'envoi du lien magique. Veuillez réessayer.");
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await api.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion.");
    }
  };
  
  const updateUser = (userData: User) => {
    setAuthState({
      ...authState,
      user: userData
    });
    
    // Mise à jour du localStorage
    if (authState.isAuthenticated) {
      localStorage.setItem('authState', JSON.stringify({
        isAuthenticated: true,
        isLoading: false,
        user: userData,
        token: authState.token
      }));
    }
  };
  
  const promoteToAdmin = async (userId: string) => {
    try {
      await api.promoteToAdmin(userId);
      toast.success("Utilisateur promu administrateur avec succès!");
    } catch (error) {
      console.error("Erreur lors de la promotion en admin:", error);
      toast.error("Erreur lors de la promotion en administrateur.");
      throw error;
    }
  };
  
  const value = {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
    login,
    loginWithMagicLink,
    register,
    logout,
    loadStoredToken,
    updateUser,
    isAdmin,
    promoteToAdmin
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
