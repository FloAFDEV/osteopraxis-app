import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, AuthState, User } from "@/types";
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  loadStoredToken: async () => {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    };
  },
  updateUser: () => {},
  loginWithMagicLink: async () => false,
  isAdmin: false,
  promoteToAdmin: async () => {},
});

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  });

  useEffect(() => {
    console.log("Setting up auth listener");
    
    // Add auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (session && session.user) {
          try {
            const { data: userProfile, error: userError } = await supabase
              .from('User')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError && userError.code !== 'PGRST116') {
              console.error("Error fetching user data:", userError);
              throw userError;
            }

            if (userProfile) {
              setAuthState({
                user: userProfile as User,
                isAuthenticated: true,
                isLoading: false,
                token: session.access_token
              });
            } else {
              // Ne pas créer de profil ici, laisser le processus d'inscription s'en charger
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                token: null
              });
            }
          } catch (error) {
            console.error("Error in auth state change handler:", error);
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              token: null
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null
          });
        }
      }
    );
    
    // Then check for existing session
    const setupAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null
          });
          return;
        }

        const { data: userProfile, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          throw userError;
        }

        if (userProfile) {
          setAuthState({
            user: userProfile as User,
            isAuthenticated: true,
            isLoading: false,
            token: session.access_token
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null
          });
        }
      } catch (error) {
        console.error("Error during auth setup:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
      }
    };

    setupAuth();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadStoredToken = async (): Promise<AuthState> => {
    try {
      // Récupérer la session utilisateur
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking auth session:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }

      if (!session) {
        console.log("No session found");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }

      try {
        // Récupérer les données complètes de l'utilisateur
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
          throw userError;
        }
        
        if (!userData) {
          console.log("User not found in database, creating new user record");
          
          // Create a new user record if one doesn't exist
          const newUserData = {
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.first_name || '',
            last_name: session.user.user_metadata?.last_name || '',
            role: "OSTEOPATH" as "ADMIN" | "OSTEOPATH", // Only use valid database roles
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { data: newUser, error: createError } = await supabase
            .from('User')
            .insert([newUserData])
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating new user:", createError);
            throw createError;
          }
          
          console.log("New user created:", newUser);
          
          const updatedAuthState = {
            user: newUser as User,
            isAuthenticated: true,
            isLoading: false,
            token: session.access_token
          };
          
          setAuthState(updatedAuthState);
          return updatedAuthState;
        }
        
        console.log("User authenticated:", userData);
        const updatedAuthState = {
          user: userData as User,
          isAuthenticated: true,
          isLoading: false,
          token: session.access_token
        };
        
        setAuthState(updatedAuthState);
        return updatedAuthState;
      } catch (err) {
        console.error("Error processing user data:", err);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
        return {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        };
      }
    } catch (error) {
      console.error("Error loading stored token:", error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("Pas de session après connexion");
      }

      // Le profil utilisateur sera géré par le listener onAuthStateChange
      toast.success(`Bienvenue !`);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Échec de la connexion. Veuillez réessayer.");
      throw error;
    }
  };

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
      
      toast.success(`Un lien de connexion a été envoyé à ${email}`);
      return true;
    } catch (error: any) {
      console.error("Magic link login error:", error);
      toast.error(error.message || "Échec de l'envoi du lien magique. Veuillez réessayer.");
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
      
      toast.info("Vous avez été déconnecté");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Échec de la déconnexion. Veuillez réessayer.");
    }
  };

  const register = async (userData: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Pas d'utilisateur créé");
      }

      const { error: profileError } = await supabase
        .from('User')
        .insert({
          id: data.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: 'OSTEOPATH',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        throw profileError;
      }

      toast.success("Compte créé avec succès ! Veuillez vous connecter.");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Échec de l'inscription. Veuillez réessayer.");
      throw error;
    }
  };
  
  const updateUser = (updatedUserData: User) => {
    if (authState.user) {
      setAuthState({
        ...authState,
        user: {
          ...authState.user,
          ...updatedUserData
        }
      });
    }
  };
  
  const promoteToAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('User')
        .update({
          role: 'ADMIN' as "ADMIN" | "OSTEOPATH",
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success("Utilisateur promu administrateur avec succès");
      
      // Si l'utilisateur courant est promu, mettre à jour son état
      if (authState.user && authState.user.id === userId) {
        updateUser(data as User);
      }
    } catch (error: any) {
      console.error("Error promoting user to admin:", error);
      toast.error(error.message || "Échec de la promotion. Veuillez réessayer.");
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{
        ...authState,
        login,
        logout,
        register,
        loadStoredToken,
        updateUser,
        loginWithMagicLink,
        isAdmin: authState.user?.role === 'ADMIN',
        promoteToAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
